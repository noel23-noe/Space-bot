const { reply } = require('./_reply');
const { isSenderAdmin } = require('./_groupAuth');

module.exports = {
  name: 'tagall',
  description: 'Mention all group members (admin only): .tagall [message]',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');
    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }

    const meta = await sock.groupMetadata(ctx.chatId);
    const participants = meta.participants.map((p) => p.id);
    const note = args.join(' ');

    const text = [
      note || '📢 Attention everyone!',
      '',
      ...participants.map((id) => `@${id.split('@')[0]}`),
    ].join('\n');

    await sock.sendMessage(ctx.chatId, { text, mentions: participants }, { quoted: msg });
  },
};
