import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { EmbedDefinition } from './types.js';

const here = dirname(fileURLToPath(import.meta.url));

const SKIP = new Set(['types', 'registry']);

export async function loadEmbeds(): Promise<Map<string, EmbedDefinition>> {
  const registry = new Map<string, EmbedDefinition>();

  const files = readdirSync(here).filter((f) => {
    const base = f.replace(/\.(ts|js)$/, '');
    return /\.(ts|js)$/.test(f) && !f.endsWith('.d.ts') && !SKIP.has(base);
  });

  for (const file of files) {
    const mod = await import(pathToFileURL(join(here, file)).href);
    const candidates = new Set<unknown>([mod.default, ...Object.values(mod)]);
    for (const c of candidates) {
      if (isEmbedDefinition(c)) {
        if (registry.has(c.name)) {
          throw new Error(`Дублирующееся имя embed-а: "${c.name}" (файл ${file})`);
        }
        registry.set(c.name, c);
      }
    }
  }

  return registry;
}

function isEmbedDefinition(value: unknown): value is EmbedDefinition {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EmbedDefinition).name === 'string' &&
    typeof (value as EmbedDefinition).build === 'function'
  );
}
