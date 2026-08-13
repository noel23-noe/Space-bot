const { reply } = require('./_reply');
const { isSenderAdmin } = require('./_groupAuth');
const groupSettings = require('./_groupSettings');

module.exports = {
  name: 'welcome',
  description: 'Toggle welcome messages (admin only): .welcome on|off [custom message]',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');
    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }

    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      return reply(sock, msg, 'Usage: `.welcome on [message with {user}]` or `.welcome off`');
    }

    if (mode === 'off') {
      groupSettings.set(ctx.chatId, { welcome: false });
      return reply(sock, msg, 'Welcome messages turned off.');
    }

    const customMsg = args.slice(1).join(' ') || 'Welcome to the group, {user}! 👋';
    groupSettings.set(ctx.chatId, { welcome: true, welcomeMsg: customMsg });
    await reply(sock, msg, `Welcome messages turned on.\nPreview: ${customMsg.replace('{user}', '@newmember')}`);
  },
};
