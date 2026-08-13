const { reply } = require('./_reply');
const { isSenderAdmin, isBotAdmin } = require('./_groupAuth');

module.exports = {
  name: 'kick',
  description: 'Remove a member from the group (admin only): .kick @user',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');

    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }
    if (!(await isBotAdmin(sock, ctx.chatId))) {
      return reply(sock, msg, 'I need to be a group admin to do that.');
    }

    const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return reply(sock, msg, 'Tag the user to remove: `.kick @user`');

    await sock.groupParticipantsUpdate(ctx.chatId, [target], 'remove');
    await reply(sock, msg, `Removed @${target.split('@')[0]}.`);
  },
};
