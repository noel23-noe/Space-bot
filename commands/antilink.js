const { reply } = require('./_reply');
const { isSenderAdmin } = require('./_groupAuth');
const groupSettings = require('./_groupSettings');

module.exports = {
  name: 'antilink',
  description: 'Toggle auto-delete of messages containing links (admin only): .antilink on|off',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');
    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }

    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      return reply(sock, msg, 'Usage: `.antilink on` or `.antilink off`');
    }

    groupSettings.set(ctx.chatId, { antilink: mode === 'on' });
    await reply(sock, msg, `Anti-link ${mode === 'on' ? 'enabled — links will be removed' : 'disabled'}. Bot must be a group admin for removal to work.`);
  },
};
