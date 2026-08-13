const { reply } = require('./_reply');
const { isSenderAdmin, isBotAdmin } = require('./_groupAuth');

module.exports = {
  name: 'add',
  description: 'Add a number to the group (admin only): .add <number>',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');

    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }
    if (!(await isBotAdmin(sock, ctx.chatId))) {
      return reply(sock, msg, 'I need to be a group admin to do that.');
    }

    const number = (args[0] || '').replace(/[^0-9]/g, '');
    if (!number) return reply(sock, msg, 'Provide a number: `.add 15551234567`');

    const jid = `${number}@s.whatsapp.net`;
    const result = await sock.groupParticipantsUpdate(ctx.chatId, [jid], 'add');
    const status = result?.[0]?.status;

    if (status === '200') {
      await reply(sock, msg, `Added ${number}.`);
    } else {
      await reply(sock, msg, `Could not add ${number} directly (they may need to be invited manually — status ${status}).`);
    }
  },
};
