import {
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags,
  REST,
  Routes,
  type ButtonInteraction,
  type TextBasedChannel,
} from 'discord.js';
import { config } from './config.js';
import { commands } from './commands.js';
import { loadEmbeds } from './embeds/registry.js';
import type { EmbedDefinition } from './embeds/types.js';

const embeds = await loadEmbeds();
console.log(`📦 Загружено embed-ов: ${embeds.size} (${[...embeds.keys()].join(', ') || 'нет'})`);

const buttonHandlers = new Map<string, (i: ButtonInteraction) => Promise<void> | void>();
for (const def of embeds.values()) {
  for (const [customId, handler] of Object.entries(def.buttons ?? {})) {
    if (buttonHandlers.has(customId)) {
      throw new Error(`Дублирующийся customId кнопки: "${customId}" (embed ${def.name})`);
    }
    buttonHandlers.set(customId, handler);
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Бот запущен как ${c.user.tag}`);

  try {
    const rest = new REST().setToken(config.token);
    await rest.put(Routes.applicationGuildCommands(c.user.id, config.guildId), {
      body: commands,
    });
    console.log(`🚀 Команды зарегистрированы (${commands.length}) на сервере ${config.guildId}.`);
  } catch (err) {
    console.error('⚠️ Не удалось зарегистрировать команды:', err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    const handler = buttonHandlers.get(interaction.customId);
    if (handler) {
      try {
        await handler(interaction);
      } catch (err) {
        console.error('Ошибка в обработчике кнопки:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: '❌ Что-то пошло не так.', flags: MessageFlags.Ephemeral });
        }
      }
    }
    return;
  }

  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = [...embeds.values()]
      .filter((e) => e.name.toLowerCase().includes(focused))
      .slice(0, 25)
      .map((e) => ({ name: `${e.name} — ${e.description}`.slice(0, 100), value: e.name }));
    await interaction.respond(choices);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.user.id !== config.ownerId) {
    await interaction.reply({
      content: '⛔ Этим ботом может пользоваться только его владелец.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (interaction.commandName === 'запостить') {
    const name = interaction.options.getString('название', true);
    const def: EmbedDefinition | undefined = embeds.get(name);
    if (!def) {
      await interaction.reply({
        content: `❌ Embed «${name}» не найден.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const target = (interaction.options.getChannel('канал') ?? interaction.channel) as
      | TextBasedChannel
      | null;

    if (!target || !target.isTextBased() || !('send' in target)) {
      await interaction.reply({
        content: '❌ Не получилось отправить: выбери текстовый канал.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const { embeds: embedList, components } = def.build();
      await target.send({ embeds: embedList, components: components ?? [] });
      await interaction.reply({
        content: `✅ Embed «${name}» отправлен в <#${target.id}>.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error('Ошибка при отправке embed-а:', err);
      await interaction.reply({
        content: `❌ Ошибка при отправке: ${err instanceof Error ? err.message : String(err)}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(config.token);
