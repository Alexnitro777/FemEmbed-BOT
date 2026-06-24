import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';

export const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  new SlashCommandBuilder()
    .setName('запостить')
    .setDescription('Опубликовать готовый embed по имени')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt
        .setName('название')
        .setDescription('Какой embed отправить')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName('канал')
        .setDescription('Канал назначения (по умолчанию — текущий)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName('вебхуки')
    .setDescription('Показать список доступных embed-ов')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map((c) => c.toJSON());
