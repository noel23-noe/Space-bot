const { reply } = require('./_reply');
const { isSenderAdmin, isBotAdmin } = require('./_groupAuth');

module.exports = {
  name: 'demote',
  description: 'Remove admin status from a member (admin only): .demote @user',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');

    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }
    if (!(await isBotAdmin(sock, ctx.chatId))) {
      return reply(sock, msg, 'I need to be a group admin to do that.');
    }

    const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return reply(sock, msg, 'Tag the user to demote: `.demote @user`');

    await sock.groupParticipantsUpdate(ctx.chatId, [target], 'demote');
    await reply(sock, msg, `@${target.split('@')[0]} is no longer an admin.`);
  },
};
