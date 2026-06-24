# FemEmbed-BOT

Discord-бот на TypeScript для публикации кастомных embed-ов. Пользоваться может **только владелец** (по его Discord ID).

Принцип работы: каждый embed описывается отдельным файлом в `src/embeds/`. Чтобы добавить новый — опиши его, и он добавляется как файл-определение. Публикация — командой `/post`.

## Установка

```bash
npm install
```

## Настройка

1. Зайди на https://discord.com/developers/applications → **New Application**.
2. Вкладка **Bot** → **Reset Token** → скопируй токен.
3. Вкладка **General Information** → скопируй **Application ID**.
4. В Discord включи режим разработчика (Настройки → Расширенные → Режим разработчика).
   - ПКМ по серверу → **Copy Server ID** (это `guildId`)
5. Скопируй `config.example.json` в `config.json` и заполни значения:

```bash
cp config.example.json config.json
```

```json
{
  "token": "твой_токен",
  "clientId": "application_id",
  "guildId": "id_сервера"
}
```

> ID владельца (`ownerId`) зашит прямо в коде — см. `OWNER_ID` в `src/config.ts`.

6. Пригласи бота на сервер. На вкладке **OAuth2 → URL Generator** выбери scopes
   `bot` и `applications.commands`, права `Send Messages` + `Embed Links`,
   открой полученную ссылку и добавь бота на сервер.

## Запуск (локально, Node.js)

```bash
npm start        # запустить бота — команды /post и /embeds регистрируются автоматически
```

Команды регистрируются на сервере при каждом старте бота, отдельный шаг не нужен.
Если хочется зарегистрировать их вручную (без запуска бота) — `npm run deploy`.

Для разработки с автоперезапуском: `npm run dev`.

## Запуск в Docker

Образ собирается на базе `node:24-slim` (многоступенчатая сборка: TypeScript
компилируется в `dist`, в финальном образе — только прод-зависимости).
`config.json` не вшивается в образ, а пробрасывается томом с хоста.

```bash
# Запустить бота (в фоне, с автоперезапуском) — команды регистрируются сами
docker compose up -d --build

# Логи / остановка
docker compose logs -f
docker compose down
```

> Слэш-команды регистрируются автоматически при старте. Отдельный сервис для
> ручной регистрации остаётся на случай нужды:
> `docker compose --profile deploy run --rm deploy`.

> Перед запуском должен существовать заполненный `config.json` рядом с `docker-compose.yml`.

## Команды

| Команда | Действие |
| --- | --- |
| `/post name:<имя> [channel]` | Опубликовать embed по имени в канал (по умолчанию — текущий) |
| `/embeds` | Показать список доступных embed-ов |

У `name` есть автоподсказка — начни печатать имя, и бот подскажет варианты.

## Как добавить embed

Создай файл в `src/embeds/`, например `src/embeds/welcome.ts`:

```ts
import { EmbedBuilder } from 'discord.js';
import type { EmbedDefinition } from './types.js';

const welcome: EmbedDefinition = {
  name: 'welcome',
  description: 'Приветствие новичков',
  build: () =>
    new EmbedBuilder()
      .setTitle('Добро пожаловать!')
      .setDescription('Рады видеть тебя на сервере.')
      .setColor(0x57f287),
};

export default welcome;
```

Файлы подхватываются автоматически. После добавления просто перезапусти бота
(`npm start`) — регистрировать команды заново при этом **не нужно**, новые имена
сразу появятся в автоподсказке `/post`.
