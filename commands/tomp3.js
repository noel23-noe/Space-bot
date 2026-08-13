const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { reply } = require('./_reply');
const { downloadQuotedOrDirectMedia } = require('./_media');

async function toMp3(inputBuffer) {
  const tmpIn = path.join(os.tmpdir(), `in-${Date.now()}`);
  const tmpOut = path.join(os.tmpdir(), `out-${Date.now()}.mp3`);
  fs.writeFileSync(tmpIn, inputBuffer);

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .noVideo()
      .audioCodec('libmp3lame')
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(tmpOut);
  });

  const out = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return out;
}

module.exports = {
  name: 'tomp3',
  description: 'Extract audio as mp3 from a replied video/audio message',
  async run(sock, msg, args, ctx) {
    const buffer = await downloadQuotedOrDirectMedia(sock, msg);
    if (!buffer) return reply(sock, msg, 'Reply to a video or audio message with `.tomp3`.');

    try {
      const mp3Buffer = await toMp3(buffer);
      await sock.sendMessage(ctx.chatId, { audio: mp3Buffer, mimetype: 'audio/mpeg' }, { quoted: msg });
    } catch (err) {
      console.error('tomp3 conversion failed:', err);
      await reply(sock, msg, 'Could not extract audio from that.');
    }
  },
};
