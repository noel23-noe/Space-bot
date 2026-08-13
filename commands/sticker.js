const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { reply } = require('./_reply');
const { downloadQuotedOrDirectMedia } = require('./_media');

async function videoToWebp(inputBuffer) {
  const tmpIn = path.join(os.tmpdir(), `in-${Date.now()}.mp4`);
  const tmpOut = path.join(os.tmpdir(), `out-${Date.now()}.webp`);
  fs.writeFileSync(tmpIn, inputBuffer);

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .outputOptions([
        '-vcodec', 'libwebp',
        '-vf', "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=10",
        '-loop', '0',
        '-t', '6', // cap at 6s so stickers stay small
        '-preset', 'default',
        '-an',
        '-vsync', '0',
      ])
      .toFormat('webp')
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
  name: 'sticker',
  description: 'Convert an image or short video (reply to it) into a sticker',
  async run(sock, msg, args, ctx) {
    const buffer = await downloadQuotedOrDirectMedia(sock, msg);
    if (!buffer) {
      return reply(sock, msg, 'Send or reply to an image/short video with `.sticker`.');
    }

    try {
      const isVideo = Boolean(
        msg.message.videoMessage ||
        msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
      );

      const webpBuffer = isVideo
        ? await videoToWebp(buffer)
        : await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toBuffer();

      await sock.sendMessage(ctx.chatId, { sticker: webpBuffer }, { quoted: msg });
    } catch (err) {
      console.error('Sticker conversion failed:', err);
      await reply(sock, msg, 'Could not convert that to a sticker.');
    }
  },
};
