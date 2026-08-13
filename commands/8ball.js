const { reply } = require('./_reply');

const ANSWERS = [
  'Yes, definitely.', 'It is certain.', 'Without a doubt.', 'Most likely.',
  'Ask again later.', 'Cannot predict now.', 'Better not tell you now.',
  'Don\'t count on it.', 'My reply is no.', 'Very doubtful.', 'Outlook good.',
  'Outlook not so good.', 'Signs point to yes.',
];

module.exports = {
  name: '8ball',
  description: 'Ask the magic 8-ball a question',
  async run(sock, msg, args) {
    if (args.length === 0) return reply(sock, msg, 'Ask a question, e.g. `.8ball will it rain today?`');
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await reply(sock, msg, `🎱 ${answer}`);
  },
};
