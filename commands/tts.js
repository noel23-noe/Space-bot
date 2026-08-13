const gTTS = require('gtts');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { reply } = require('./_reply');

module.exports = {
  name: 'tts',
  description: 'Convert text to speech: .tts <text>',
  async run(sock, msg, args, ctx) {
    const text = args.join(' ');
    if (!text) return reply(sock, msg, 'Give some text, e.g. `.tts hello there`');
    if (text.length > 200) return reply(sock, msg, 'Keep it under 200 characters for now.');

    const tmpFile = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);

    try {
      await new Promise((resolve, reject) => {
        const gtts = new gTTS(text, 'en');
        gtts.save(tmpFile, (err) => (err ? reject(err) : resolve()));
      });

      const audioBuffer = fs.readFileSync(tmpFile);
      await sock.sendMessage(ctx.chatId, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: msg });
      fs.unlinkSync(tmpFile);
    } catch (err) {
      console.error('.tts failed:', err);
      await reply(sock, msg, 'Could not generate speech right now.');
    }
  },
};
