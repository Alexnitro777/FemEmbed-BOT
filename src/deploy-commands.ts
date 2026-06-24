import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { commands } from './commands.js';

const rest = new REST().setToken(config.token);

console.log(`🚀 Регистрирую ${commands.length} команду на сервере ${config.guildId}...`);
await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
  body: commands,
});
console.log('✅ Команды зарегистрированы.');
