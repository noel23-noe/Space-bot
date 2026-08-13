// Shared admin-check helper — not a command itself (no `name` export).

async function isSenderAdmin(sock, chatId, sender) {
  const meta = await sock.groupMetadata(chatId);
  const participant = meta.participants.find((p) => p.id === sender);
  return Boolean(participant?.admin);
}

async function isBotAdmin(sock, chatId) {
  const meta = await sock.groupMetadata(chatId);
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const participant = meta.participants.find((p) => p.id.startsWith(botId.split('@')[0]));
  return Boolean(participant?.admin);
}

module.exports = { isSenderAdmin, isBotAdmin };
