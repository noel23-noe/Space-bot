const { reply } = require('./_reply');

module.exports = {
  name: 'jid',
  description: 'Show this chat\'s WhatsApp ID',
  async run(sock, msg, args, ctx) {
    await reply(sock, msg, `Chat ID: ${ctx.chatId}\nSender ID: ${ctx.sender}`);
  },
};
