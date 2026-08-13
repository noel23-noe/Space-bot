const { reply } = require('./_reply');

module.exports = {
  name: 'lyrics',
  description: 'Find lyrics for a song: .lyrics <song title>',
  async run(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return reply(sock, msg, 'Give a song title, e.g. `.lyrics bohemian rhapsody`');

    // Lyrics are copyrighted — this points to a licensed source rather than
    // reproducing the text directly.
    const searchUrl = `https://genius.com/search?q=${encodeURIComponent(query)}`;
    await reply(sock, msg, `🎵 Search "${query}" on Genius:\n${searchUrl}`);
  },
};
