import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';

export const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  new SlashCommandBuilder()
    .setName('post')
    .setDescription('Опубликовать готовый embed по имени')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((opt) =>
      opt
        .setName('name')
        .setDescription('Какой embed отправить')
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName('channel')
        .setDescription('Канал назначения (по умолчанию — текущий)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName('embeds')
    .setDescription('Показать список доступных embed-ов')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map((c) => c.toJSON());
