const { reply } = require('./_reply');

module.exports = {
  name: 'meme',
  description: 'Get a random meme',
  async run(sock, msg) {
    try {
      const res = await fetch('https://meme-api.com/gimme');
      const data = await res.json();
      await sock.sendMessage(
        msg.key.remoteJid,
        { image: { url: data.url }, caption: data.title },
        { quoted: msg }
      );
    } catch (err) {
      await reply(sock, msg, 'Could not fetch a meme right now, try again shortly.');
    }
  },
};
