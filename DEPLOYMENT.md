# Deploying Space_X Bot for multiple customers

This covers running the bot as a service: you host it on your own server, each
customer links their own WhatsApp number to their own isolated instance.

## 1. Server sizing

Each connected customer is a separate Node.js process holding a live WebSocket
connection, plus occasional sharp/ffmpeg work for media commands. Budget:

| Customers | Minimum RAM | Suggested VPS               |
|-----------|-------------|------------------------------|
| 1–10      | 2 GB        | $6–12/mo (DigitalOcean, Hetzner, Contabo) |
| 10–30     | 4 GB        | $12–24/mo                    |
| 30–50     | 6–8 GB      | $24–48/mo                    |

Start smaller and scale up — you'll see actual per-tenant RAM usage in your
first week and can size precisely from there (`pm2 monit` shows this live).

## 2. One-time server setup

```bash
# On a fresh Ubuntu VPS:
sudo apt update && sudo apt install -y nodejs npm ffmpeg git
node -v   # confirm 18+, install from nodesource if too old

git clone https://github.com/noel23-noe/Space-bot.git
cd Space-bot
npm install
cp .env.example .env
# edit .env: add ANTHROPIC_API_KEY / OPENWEATHER_API_KEY / NEWSAPI_KEY if you
# want these to work for every tenant. Set ALLOW_SELF_TEST=false here — this
# is production, not your personal test setup.

npm install -g pm2
```

## 3. Onboarding a new customer

```bash
node manager.js add <shortId> "<Business Name>" <phone_number_no_plus>
node manager.js start <shortId>
```

This prints a pairing code to your terminal, e.g.:

```
📋 Pairing code for Jane's Boutique (janes): 4K9X2P1M
   Send this to the customer to enter on their phone.
```

**What you send the customer:** only that 8-character code, with these
instructions — nothing else, and you never ask for anything back:

> On your phone: WhatsApp → Settings → Linked Devices → Link a Device →
> "Link with phone number instead" → enter this code: `4K9X2P1M`

Once they enter it, their worker reports `connected` in your terminal/logs —
their bot is live. Their session credentials live only in
`auth/<shortId>/` on your server; nothing is ever sent back to you or them
after the initial code.

## 4. Running it as a persistent service

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # follow the printed instructions to survive server reboots
```

Day-to-day:

```bash
node manager.js list           # see every customer + live status
pm2 logs space-bot-manager     # tail all activity
node manager.js stop <shortId>    # pause one customer (e.g. non-payment)
node manager.js start <shortId>    # resume them
```

## 5. What NOT to do

- Don't ask a customer for a "session ID" or any file from their end — if
  you're doing it right, nothing ever needs to flow from customer back to
  you after the pairing code.
- Don't commit `tenants.json`, `auth/`, or `data/` to git — already excluded
  in `.gitignore`, but worth remembering if you ever restructure the repo.
- Don't run more tenants than your server's tested RAM comfortably supports —
  a crashed manager process takes every connected customer offline at once.

## 6. Billing and access control

This starter doesn't include billing — `node manager.js stop <id>` /
`start <id>` is your manual on/off switch per customer for now. A natural
next step once you have paying customers is wiring `stop`/`start` to a simple
payment webhook (M-Pesa, Stripe, etc.) instead of running it by hand.
