const { reply } = require('./_reply');

module.exports = {
  name: 'url',
  description: 'Shorten a link: .url <link>',
  async run(sock, msg, args) {
    const link = args[0];
    if (!link || !link.startsWith('http')) return reply(sock, msg, 'Give a valid link, e.g. `.url https://example.com`');

    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`);
      const short = await res.text();
      await reply(sock, msg, `🔗 ${short}`);
    } catch (err) {
      await reply(sock, msg, 'Could not shorten that link right now.');
    }
  },
};
