# Space_X Bot

A custom WhatsApp bot built on [Baileys](https://github.com/WhiskeySockets/Baileys), with a clean command-router architecture so new commands are easy to add.

⚠️ Baileys is an unofficial library that connects via the WhatsApp Web protocol — it is not WhatsApp's official API. Automated use like this carries a risk of the linked number being banned. Use a test number until you're confident, and keep sends throttled (already built in — see `commands/_reply.js`).

## Setup (single number — for yourself)

```bash
npm install
cp .env.example .env   # then fill in any API keys you want to use
node index.js --pairing-code
```

Enter your WhatsApp number when prompted (digits only, country code, no `+` or spaces), then link it on your phone: **WhatsApp → Settings → Linked Devices → Link a Device → "Link with phone number instead."**

`ffmpeg` must be installed and on your PATH for `.sticker` (video) and `.tomp3` to work.

## Running it for multiple customers

`worker.js` + `manager.js` let you host isolated bot instances for many customers from one server — each customer links their own number, sessions never leave your server. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full setup, server sizing guide, and onboarding flow.

Quick reference once set up:
```bash
node manager.js add <id> "<Business Name>" <phone_number>
node manager.js start <id>       # prints a pairing code to send the customer
node manager.js list             # see all customers + status
```

## Commands

**Core:** `.ping` `.alive` `.menu` `.help` `.owner` `.jid` `.groupinfo` `.staff` `.admins`

**Fun/games:** `.8ball` `.joke` `.fact` `.quote` `.dice` `.meme` `.trivia` + `.answer` `.tictactoe` + `.move`

**Group management** (bot must be a group admin): `.kick` `.add` `.promote` `.demote` `.welcome on|off` `.antispam on|off` `.antilink on|off` `.tagall` `.mute` `.unmute`

**Info/utility:** `.weather <city>` (needs `OPENWEATHER_API_KEY`) `.news [topic]` (needs `NEWSAPI_KEY`) `.tts <text>` `.trt <lang> <text>` `.url <link>` `.ss <link>` `.google <query>` `.lyrics <song>` (links to a licensed source, doesn't reproduce lyrics text)

**Media:** `.sticker` `.toimg` `.tomp3`

**AI:** `.ai <question>` — requires `ANTHROPIC_API_KEY` in `.env`

`.menu`/`.help` send a branded banner image (`assets/menu-banner.png`) with the full command list as the caption.

## Project structure

```
index.js            # single-tenant entrypoint (your own bot, one number)
worker.js            # tenant-aware bot process, spawned per customer by manager.js
manager.js            # spawns/tracks/controls one worker.js per customer
ecosystem.config.js    # PM2 config to keep manager.js alive 24/7
commandRouter.js     # auto-loads and dispatches commands/*.js
spamTracker.js       # antispam detection logic
assets/
  menu-banner.svg/png # banner shown on .menu / .help
commands/
  _reply.js          # shared throttled send helper (all replies go through this)
  _groupAuth.js       # admin-check helpers for group-management commands
  _groupSettings.js   # persisted per-group, per-tenant settings (welcome/antispam/antilink)
  _media.js            # shared media download helper
  <command>.js          # one file per command
```

Files prefixed with `_` are shared helpers, not commands — the router skips them.

## Environment variables

See `.env.example`. All are optional except what each command needs — commands whose key is missing will reply with a clear "not configured" message instead of crashing.

## Notes on scope

This bot intentionally does not include: video/audio downloading from platforms like YouTube or TikTok (ToS/copyright), full lyrics reproduction (copyright — `.lyrics` was scoped out for this reason), or any "view-once bypass" functionality (defeats a privacy feature the sender chose).

## Owner

Noel Musya
📞 +254794463885
📸 Instagram — The Developer | thedeveloper2026
📧 musyanoel85@gmail.com
