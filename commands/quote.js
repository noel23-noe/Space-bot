const { reply } = require('./_reply');

module.exports = {
  name: 'quote',
  description: 'Get a random quote',
  async run(sock, msg) {
    try {
      const res = await fetch('https://api.quotable.io/random');
      const data = await res.json();
      await reply(sock, msg, `"${data.content}"\n— ${data.author}`);
    } catch (err) {
      await reply(sock, msg, 'Could not fetch a quote right now, try again shortly.');
    }
  },
};
