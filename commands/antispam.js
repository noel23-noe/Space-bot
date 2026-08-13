const { reply } = require('./_reply');
const { isSenderAdmin } = require('./_groupAuth');
const groupSettings = require('./_groupSettings');

module.exports = {
  name: 'antispam',
  description: 'Toggle basic anti-spam warnings (admin only): .antispam on|off',
  async run(sock, msg, args, ctx) {
    if (!ctx.chatId.endsWith('@g.us')) return reply(sock, msg, 'This command only works in a group.');
    if (!(await isSenderAdmin(sock, ctx.chatId, ctx.sender))) {
      return reply(sock, msg, 'Only group admins can use this.');
    }

    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      return reply(sock, msg, 'Usage: `.antispam on` or `.antispam off`');
    }

    groupSettings.set(ctx.chatId, { antispam: mode === 'on' });
    await reply(sock, msg, `Anti-spam ${mode === 'on' ? 'enabled' : 'disabled'}.`);
  },
};
