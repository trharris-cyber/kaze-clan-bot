# Kaze Clan Discord Bot

A friendly BLEACH-inspired Discord bot for the Kaze Clan in **Where Winds Meet**.

## Features

- `/guides` — opens a dropdown menu with:
  - Guide to Guild War (GvG)
  - Guide to Gear Minmaxing
  - Lvl 91 Sword Trial Guides
  - Kaze Clan Guild Manager
  - Weekly Calendar

- `/gearcheck` — lets members confirm if they are battle-ready or request help.

All bot responses use red embeds and Kaze Clan themed language.

## Setup

### 1. Install Node.js

Download Node.js from:

https://nodejs.org/

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

Copy `.env.example` and rename it to `.env`.

Fill it in:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_discord_server_id_here
```

## Where to find these values

### DISCORD_TOKEN

Discord Developer Portal → Your Application → Bot → Reset Token → Copy Token

### CLIENT_ID

Discord Developer Portal → Your Application → General Information → Application ID

### GUILD_ID

In Discord, enable Developer Mode:

User Settings → Advanced → Developer Mode

Then right-click your server → Copy Server ID

## Run the bot

```bash
npm start
```

You should see:

```bash
Slash commands deployed.
The Kaze Clan bot has awakened as YOUR_BOT_NAME
```

## Invite the bot

Discord Developer Portal → OAuth2 → URL Generator

Select:

- `bot`
- `applications.commands`

Recommended permissions:

- Send Messages
- Use Slash Commands
- Embed Links

Open the generated invite URL and add the bot to your server.

## Security Warning

Never upload your `.env` file to GitHub.

Your `.env` contains your bot token. If it leaks, reset the token immediately in the Discord Developer Portal.

## License

MIT
