require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const readline = require('readline');
const { handleMessage } = require('./commandRouter');
const groupSettings = require('./commands/_groupSettings');
const { checkSpam } = require('./spamTracker');

const AUTH_DIR = path.join(__dirname, 'auth'); // swap for a DB-backed store before scaling past one instance
const logger = pino({ level: 'warn' });

// Set to true (or pass --pairing-code) to get a text code instead of a QR.
// Phone number is asked for interactively so it's never hardcoded/committed.
const USE_PAIRING_CODE = process.argv.includes('--pairing-code');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    // QR printing only makes sense when we're NOT doing pairing-code login,
    // and only until we're actually registered.
    printQRInTerminal: !USE_PAIRING_CODE,
  });

  // Request a pairing code once, only if not already registered and pairing mode is on.
  if (USE_PAIRING_CODE && !sock.authState.creds.registered) {
    const rawNumber = await ask('Enter your WhatsApp number with country code, no + or spaces (e.g. 15551234567): ');
    const code = await sock.requestPairingCode(rawNumber);
    console.log(`\nYour pairing code: ${code}\n`);
    console.log('On your phone: WhatsApp > Settings > Linked Devices > Link a Device > Link with phone number instead, then enter this code.\n');
  }

  // Persist auth state whenever it changes
  sock.ev.on('creds.update', saveCreds);

  // Track connection lifecycle + auto-reconnect with backoff
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      console.log('Connection closed.', statusCode, loggedOut ? '(logged out, not reconnecting)' : '(reconnecting)');

      if (!loggedOut) {
        // simple fixed backoff; swap for exponential if you see repeated drops
        setTimeout(startBot, 3000);
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp.');
    }
  });

  // Inbound messages -> router + antispam check
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // ALLOW_SELF_TEST=true in .env lets you test commands by messaging yourself
      // (useful with only one WhatsApp number). Leave unset/false in normal use.
      const allowSelfTest = process.env.ALLOW_SELF_TEST === 'true';
      if (!msg.message || (msg.key.fromMe && !allowSelfTest)) continue; // skip empty events + our own sent messages

      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || chatId;

      // Antilink: only in groups, only if the admin turned it on, skip admins themselves
      const LINK_REGEX = /(https?:\/\/|www\.|chat\.whatsapp\.com\/)/i;
      if (chatId?.endsWith('@g.us') && groupSettings.get(chatId).antilink) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (text && LINK_REGEX.test(text)) {
          try {
            const meta = await sock.groupMetadata(chatId);
            const senderIsAdmin = meta.participants.find((p) => p.id === sender)?.admin;
            if (!senderIsAdmin) {
              await sock.sendMessage(chatId, { delete: msg.key });
              await sock.sendMessage(chatId, {
                text: `🔗 Link removed. @${sender.split('@')[0]}, links aren't allowed here.`,
                mentions: [sender],
              });
              continue; // don't route link text as a command
            }
          } catch (err) {
            console.error('Antilink removal failed (bot may not be admin):', err);
          }
        }
      }

      // Antispam: only in groups, only if the admin turned it on for this group
      if (chatId?.endsWith('@g.us') && groupSettings.get(chatId).antispam) {
        const text =
          msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (text && checkSpam(chatId, sender, text)) {
          try {
            await sock.sendMessage(chatId, {
              text: `⚠️ @${sender.split('@')[0]} please slow down / avoid repeated messages.`,
              mentions: [sender],
            });
          } catch (err) {
            console.error('Antispam warning failed:', err);
          }
          continue; // don't also route spam text as a command
        }
      }

      try {
        await handleMessage(sock, msg);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    }
  });

  // New group members -> welcome message, if enabled for that group
  sock.ev.on('group-participants.update', async (event) => {
    if (event.action !== 'add') return;
    const settings = groupSettings.get(event.id);
    if (!settings.welcome) return;

    for (const participantJid of event.participants) {
      const text = (settings.welcomeMsg || 'Welcome, {user}! 👋').replace(
        '{user}',
        `@${participantJid.split('@')[0]}`
      );
      try {
        await sock.sendMessage(event.id, { text, mentions: [participantJid] });
      } catch (err) {
        console.error('Welcome message failed:', err);
      }
    }
  });

  return sock;
}

startBot().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
