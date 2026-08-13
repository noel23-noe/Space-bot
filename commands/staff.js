const { reply } = require('./_reply');

module.exports = {
  name: 'staff',
  description: 'List group admins (alias: works the same as .admins)',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) {
      return reply(sock, msg, 'This command only works in a group chat.');
    }
    const meta = await sock.groupMetadata(ctx.chatId);
    const admins = meta.participants.filter((p) => p.admin);
    if (admins.length === 0) {
      return reply(sock, msg, 'No admins found.');
    }
    const list = admins.map((a) => `• ${a.id.split('@')[0]} (${a.admin})`).join('\n');
    await reply(sock, msg, `*Group Admins:*\n${list}`);
  },
};
