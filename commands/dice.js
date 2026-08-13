const { reply } = require('./_reply');

module.exports = {
  name: 'dice',
  description: 'Roll a 6-sided die',
  async run(sock, msg) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    await reply(sock, msg, `${faces[roll - 1]} You rolled a ${roll}!`);
  },
};
