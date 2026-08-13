const { reply } = require('./_reply');
const { isSenderAdmin, isBotAdmin } = require('./_groupAuth');

module.exports = {
  name: 'mute',
  description: 'Restrict messaging to admins only (admin only)',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');
    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }
    if (!(await isBotAdmin(sock, ctx.chatId))) {
      return reply(sock, msg, 'I need to be a group admin to do that.');
    }

    await sock.groupSettingUpdate(ctx.chatId, 'announcement');
    await reply(sock, msg, '🔇 Group muted — only admins can send messages now.');
  },
};
