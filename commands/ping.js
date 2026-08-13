const { reply } = require('./_reply');

module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  async run(sock, msg) {
    const start = Date.now();
    await reply(sock, msg, 'Pong! 🏓');
    const ms = Date.now() - start;
    await reply(sock, msg, `Response time: ${ms}ms`);
  },
};
