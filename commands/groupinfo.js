const { reply } = require('./_reply');

module.exports = {
  name: 'groupinfo',
  description: 'Show info about the current group',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) {
      return reply(sock, msg, 'This command only works in a group chat.');
    }
    const meta = await sock.groupMetadata(ctx.chatId);
    const text = [
      `*Group:* ${meta.subject}`,
      `*Members:* ${meta.participants.length}`,
      `*Created:* ${new Date(meta.creation * 1000).toLocaleString()}`,
      meta.desc ? `*Description:* ${meta.desc}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    await reply(sock, msg, text);
  },
};
