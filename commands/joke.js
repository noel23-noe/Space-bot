const { reply } = require('./_reply');

module.exports = {
  name: 'joke',
  description: 'Get a random joke',
  async run(sock, msg) {
    try {
      const res = await fetch('https://official-joke-api.appspot.com/random_joke');
      const data = await res.json();
      await reply(sock, msg, `${data.setup}\n\n${data.punchline}`);
    } catch (err) {
      await reply(sock, msg, 'Could not fetch a joke right now, try again shortly.');
    }
  },
};
