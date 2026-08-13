const fs = require('fs');
const path = require('path');
const { reply } = require('./_reply');

const BANNER_PATH = path.join(__dirname, '..', 'assets', 'menu-banner.png');

// Category grouping for the menu display. Commands not listed here fall into "Other".
const CATEGORIES = [
  {
    title: '🧭 CORE',
    commands: ['ping', 'alive', 'menu', 'help', 'owner', 'jid', 'groupinfo', 'staff', 'admins'],
  },
  {
    title: '🎮 FUN & GAMES',
    commands: ['8ball', 'joke', 'fact', 'quote', 'dice', 'meme', 'trivia', 'answer', 'tictactoe', 'move'],
  },
  {
    title: '👮 GROUP MANAGEMENT',
    commands: ['kick', 'add', 'promote', 'demote', 'welcome', 'antispam', 'antilink', 'tagall', 'mute', 'unmute'],
  },
  {
    title: '☁️ INFO & UTILITY',
    commands: ['weather', 'news', 'tts', 'trt', 'url', 'ss', 'google', 'lyrics'],
  },
  {
    title: '🖼️ MEDIA',
    commands: ['sticker', 'toimg', 'tomp3'],
  },
  {
    title: '🤖 AI',
    commands: ['ai'],
  },
];

function buildMenuText(commands) {
  const lines = ['*SPACE_X BOT — COMMAND MENU*', ''];
  const seen = new Set();

  for (const category of CATEGORIES) {
    const entries = category.commands
      .map((name) => commands.get(name))
      .filter(Boolean);
    if (entries.length === 0) continue;

    lines.push(`┏━━ ${category.title} ━━┓`);
    for (const cmd of entries) {
      lines.push(`┃ .${cmd.name} — ${cmd.description || ''}`);
      seen.add(cmd.name);
    }
    lines.push('┗━━━━━━━━━━━━━━┛');
    lines.push('');
  }

  // Anything not explicitly categorized still shows up, so nothing silently disappears.
  const leftover = [...commands.values()]
    .filter((cmd) => !seen.has(cmd.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (leftover.length > 0) {
    lines.push('┏━━ 🧩 OTHER ━━┓');
    for (const cmd of leftover) {
      lines.push(`┃ .${cmd.name} — ${cmd.description || ''}`);
    }
    lines.push('┗━━━━━━━━━━━━━━┛');
  }

  return lines.join('\n').trim();
}

module.exports = {
  name: 'menu',
  description: 'Show this list of commands',
  async run(sock, msg, args, ctx) {
    const caption = buildMenuText(ctx.commands);

    if (fs.existsSync(BANNER_PATH)) {
      await sock.sendMessage(
        ctx.chatId,
        { image: fs.readFileSync(BANNER_PATH), caption },
        { quoted: msg }
      );
    } else {
      // Falls back to plain text if the banner image is ever missing.
      await reply(sock, msg, caption);
    }
  },
};
