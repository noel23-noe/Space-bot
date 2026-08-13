const { reply } = require('./_reply');

// chatId -> { board: Array(9), turn: jid, players: [jidX, jidO], symbols: {jid: 'X'|'O'} }
const games = new Map();

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
  name: 'tictactoe',
  description: 'Start tic-tac-toe: .tictactoe @user (then play with .move <1-9>)',
  games, // exposed for commands/move.js
  async run(sock, msg, args, ctx) {
    const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentioned) return reply(sock, msg, 'Tag someone to challenge: `.tictactoe @user`');
    if (mentioned === ctx.sender) return reply(sock, msg, "You can't play against yourself.");

    if (games.has(ctx.chatId)) {
      return reply(sock, msg, 'A game is already in progress in this chat. Finish it first.');
    }

    games.set(ctx.chatId, {
      board: Array(9).fill(null),
      turn: ctx.sender,
      players: [ctx.sender, mentioned],
      symbols: { [ctx.sender]: 'X', [mentioned]: 'O' },
    });

    await reply(
      sock,
      msg,
      `🎮 Tic-Tac-Toe started!\n@${ctx.sender.split('@')[0]} is X, @${mentioned.split('@')[0]} is O.\n\n${renderBoard(Array(9).fill(null))}\n\n@${ctx.sender.split('@')[0]}'s turn. Play with \`.move <1-9>\`.`
    );
  },
};
