const { reply } = require('./_reply');

module.exports = {
  name: 'fact',
  description: 'Get a random fact',
  async run(sock, msg) {
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      const data = await res.json();
      await reply(sock, msg, `💡 ${data.text}`);
    } catch (err) {
      await reply(sock, msg, 'Could not fetch a fact right now, try again shortly.');
    }
  },
};
