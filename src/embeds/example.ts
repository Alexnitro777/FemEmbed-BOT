import { EmbedBuilder } from 'discord.js';
import type { EmbedDefinition } from './types.js';

const example: EmbedDefinition = {
  name: 'example',
  description: 'Демонстрационный embed',
  build: () => ({
    embeds: [
      new EmbedBuilder()
        .setTitle('Привет! 👋')
        .setDescription('Это пример embed-а. Замени меня на свой контент.')
        .setColor(0x5865f2)
        .addFields(
          { name: 'Поле 1', value: 'Значение 1', inline: true },
          { name: 'Поле 2', value: 'Значение 2', inline: true },
        )
        .setFooter({ text: 'FemEmbed-BOT' })
        .setTimestamp(),
    ],
  }),
};

export default example;
