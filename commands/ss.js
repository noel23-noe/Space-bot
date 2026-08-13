const { reply } = require('./_reply');

module.exports = {
  name: 'ss',
  description: 'Screenshot a website: .ss <link>',
  async run(sock, msg, args, ctx) {
    const link = args[0];
    if (!link || !link.startsWith('http')) return reply(sock, msg, 'Give a valid link, e.g. `.ss https://example.com`');

    try {
      const shotUrl = `https://image.thum.io/get/width/800/${link}`;
      await sock.sendMessage(ctx.chatId, { image: { url: shotUrl }, caption: `Screenshot of ${link}` }, { quoted: msg });
    } catch (err) {
      await reply(sock, msg, 'Could not screenshot that site right now.');
    }
  },
};
