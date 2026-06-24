# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code style

- **No comments.** Do not add comments to any file (code, Docker, YAML). Keep code self-explanatory through naming. Existing code has none — keep it that way.
- ESM project (`"type": "module"`). Relative imports in `.ts` source **must** use the `.js` extension (e.g. `import { config } from './config.js'`), because production runs compiled output via `node dist/index.js`.

## Commands

- `npm start` — run the bot (via `tsx`). Slash commands are auto-registered to the guild on every startup.
- `npm run dev` — run with auto-restart on change.
- `npm run build` — compile TypeScript to `dist/`.
- `npm run serve` — run the compiled build (`node dist/index.js`).
- `npm run deploy` — register slash commands without starting the bot (rarely needed; startup does this automatically).
- Docker: `docker compose up -d --build`. There is no test suite.

## Configuration

- `config.json` (project root, gitignored) holds `token`, `clientId`, `guildId`. Read at runtime by `src/config.ts`, resolved relative to the file so cwd doesn't matter.
- `ownerId` is **hardcoded** as `OWNER_ID` in `src/config.ts`, not in `config.json`.

## Architecture

Single-process Discord bot (discord.js v14). Entry point `src/index.ts` does everything: loads embeds, wires interactions, logs in.

**Embed definitions are file-based and auto-discovered.** To add an embed, drop a new file in `src/embeds/` that exports an `EmbedDefinition` (default or named export). `src/embeds/registry.ts` reads every file in that directory except `types` and `registry`, dedupes, and keys them by `name`. No manual registration anywhere. Duplicate `name` throws at load.

An `EmbedDefinition` (`src/embeds/types.ts`) has:
- `name` / `description` — `name` is what `/post name:...` takes (with autocomplete).
- `build()` → `{ embeds, components? }` — the message payload sent by `/post`.
- `buttons?` — a map of `customId` → handler for interactive (non-link) buttons.

**Button handler routing is global.** At startup `index.ts` flattens every embed's `buttons` into one `customId → handler` map. **Every `customId` must be unique across all embeds** — a collision throws at startup. Button clicks run for any user (public); slash commands (`/post`, `/embeds`) are gated to `OWNER_ID`.

**Slash command definitions live in `src/commands.ts`** and are shared by two registration paths: auto-registration in the `ClientReady` handler of `index.ts` (runs every startup, guild-scoped), and the standalone `src/deploy-commands.ts`. Registration failure is non-fatal — the bot logs a warning and keeps running.

**Custom emoji** on buttons (see `src/embeds/info.ts`, `EMOJI` map in `name:id` form) only render if the bot is a member of the guild that owns the emoji.

**Docker** uses a multi-stage build on `node:24-slim`: the build stage compiles to `dist/`, the runtime stage installs prod-only deps and runs `node dist/index.js` (no `tsx`). `config.json` is never baked into the image — it's bind-mounted at `/app/config.json` via `docker-compose.yml`.
