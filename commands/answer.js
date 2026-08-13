const { reply } = require('./_reply');
const trivia = require('./trivia');

module.exports = {
  name: 'answer',
  description: 'Answer the active .trivia question',
  async run(sock, msg, args, ctx) {
    const pendingQ = trivia.pending.get(ctx.chatId);
    if (!pendingQ) return reply(sock, msg, 'No active trivia question. Start one with `.trivia`.');

    const guess = (args[0] || '').toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(guess)) {
      return reply(sock, msg, 'Reply with `.answer A`, `.answer B`, `.answer C`, or `.answer D`.');
    }

    trivia.pending.delete(ctx.chatId);

    if (guess === pendingQ.correctLetter) {
      await reply(sock, msg, `✅ Correct! The answer was ${pendingQ.correctLetter}. ${pendingQ.correctAnswer}`);
    } else {
      await reply(sock, msg, `❌ Wrong. The correct answer was ${pendingQ.correctLetter}. ${pendingQ.correctAnswer}`);
    }
  },
};
