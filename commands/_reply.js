// Shared helper so every command sends through one throttled path.
// Not a command itself (no `name` export), so commandRouter should skip it —
// see the require loop check below if you add more shared files.

let lastSend = 0;
const MIN_INTERVAL_MS = 1200; // simple self-imposed pacing; tune based on real usage

async function reply(sock, msg, text) {
  const now = Date.now();
  const wait = Math.max(0, lastSend + MIN_INTERVAL_MS - now);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastSend = Date.now();

  return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

module.exports = { reply };
