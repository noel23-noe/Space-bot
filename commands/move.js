const { reply } = require('./_reply');
const ttt = require('./tictactoe');

function renderBoard(board) {
  const cell = (v, i) => (v || String(i + 1));
  const rows = [];
  for (let r = 0; r < 3; r++) {
    rows.push([0, 1, 2].map((c) => cell(board[r * 3 + c], r * 3 + c)).join(' | '));
  }
  return rows.join('\n---------\n');
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

module.exports = {
  name: 'move',
  description: 'Play your turn in tic-tac-toe: .move <1-9>',
  async run(sock, msg, args, ctx) {
    const game = ttt.games.get(ctx.chatId);
    if (!game) return reply(sock, msg, 'No active game. Start one with `.tictactoe @user`.');
    if (ctx.sender !== game.turn) return reply(sock, msg, "It's not your turn.");

    const pos = parseInt(args[0], 10);
    if (!pos || pos < 1 || pos > 9) return reply(sock, msg, 'Pick a number 1-9, e.g. `.move 5`.');

    const idx = pos - 1;
    if (game.board[idx]) return reply(sock, msg, 'That square is taken, pick another.');

    game.board[idx] = game.symbols[ctx.sender];

    const result = checkWinner(game.board);
    if (result === 'draw') {
      ttt.games.delete(ctx.chatId);
      return reply(sock, msg, `${renderBoard(game.board)}\n\nIt's a draw! 🤝`);
    }
    if (result) {
      ttt.games.delete(ctx.chatId);
      return reply(sock, msg, `${renderBoard(game.board)}\n\n🏆 @${ctx.sender.split('@')[0]} wins!`);
    }

    game.turn = game.players.find((p) => p !== ctx.sender);
    await reply(
      sock,
      msg,
      `${renderBoard(game.board)}\n\n@${game.turn.split('@')[0]}'s turn.`
    );
  },
};
