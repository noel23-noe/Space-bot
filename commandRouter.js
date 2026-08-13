const fs = require('fs');
const path = require('path');

const PREFIX = '.';

// Auto-load every command module in ./commands
// Each module exports: { name, description, run(sock, msg, args, ctx) }
const commands = new Map();
const commandsDir = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsDir)) {
  if (!file.endsWith('.js')) continue;
  const cmd = require(path.join(commandsDir, file));
  if (!cmd || !cmd.name) continue; // skip shared helpers like _reply.js that aren't commands
  commands.set(cmd.name, cmd);
}

function extractText(msg) {
  const m = msg.message;
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  );
}

async function handleMessage(sock, msg) {
  const text = extractText(msg).trim();
  if (!text.startsWith(PREFIX)) return; // not a command, ignore (extend here later for free-text/LLM handling)

  const [rawCmd, ...args] = text.slice(PREFIX.length).split(/\s+/);
  const cmdName = rawCmd.toLowerCase();

  const cmd = commands.get(cmdName);
  if (!cmd) return; // unknown command, stay silent (or add a "unknown command" reply if you prefer)

  const ctx = {
    chatId: msg.key.remoteJid,
    sender: msg.key.participant || msg.key.remoteJid,
    commands, // pass the full registry through, e.g. so .menu can list everything
  };

  // basic self-throttle: enforced at send layer (see commands/_reply.js) rather than per-command
  await cmd.run(sock, msg, args, ctx);
}

module.exports = { handleMessage, commands };
