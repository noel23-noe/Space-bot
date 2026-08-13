const { reply } = require('./_reply');

// chatId -> { correctAnswer, options }
const pending = new Map();

function decodeHtml(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = {
  name: 'trivia',
  description: 'Get a trivia question (answer with .answer <letter>)',
  pending, // exposed so commands/answer.js can read/clear it
  async run(sock, msg, args, ctx) {
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = await res.json();
      const q = data.results[0];

      const options = shuffle([...q.incorrect_answers, q.correct_answer]);
      const letters = ['A', 'B', 'C', 'D'];
      const correctLetter = letters[options.indexOf(q.correct_answer)];

      pending.set(ctx.chatId, { correctLetter, correctAnswer: decodeHtml(q.correct_answer) });

      const lines = [
        `🧠 *Trivia* (${decodeHtml(q.category)})`,
        decodeHtml(q.question),
        '',
        ...options.map((o, i) => `${letters[i]}. ${decodeHtml(o)}`),
        '',
        'Reply with `.answer A/B/C/D`',
      ];
      await reply(sock, msg, lines.join('\n'));
    } catch (err) {
      await reply(sock, msg, 'Could not fetch a trivia question right now, try again shortly.');
    }
  },
};
