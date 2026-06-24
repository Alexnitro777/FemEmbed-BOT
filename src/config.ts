import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OWNER_ID = '703129488170549258';

export interface Config {
  token: string;
  clientId: string;
  guildId: string;
  ownerId: string;
}

interface FileConfig {
  token: string;
  clientId: string;
  guildId: string;
}

const configPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'config.json');

function loadConfig(): Config {
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf8');
  } catch {
    throw new Error(
      `❌ Не найден файл config.json (${configPath}).\n` +
        'Скопируй config.example.json в config.json и заполни значения.',
    );
  }

  let parsed: Partial<FileConfig>;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`❌ config.json содержит некорректный JSON: ${(err as Error).message}`);
  }

  const required: (keyof FileConfig)[] = ['token', 'clientId', 'guildId'];
  const missing = required.filter((k) => !parsed[k]);
  if (missing.length) {
    throw new Error(`❌ В config.json не заполнены поля: ${missing.join(', ')}`);
  }

  return { ...(parsed as FileConfig), ownerId: OWNER_ID };
}

export const config = loadConfig();
