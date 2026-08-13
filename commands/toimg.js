const sharp = require('sharp');
const { reply } = require('./_reply');
const { downloadQuotedOrDirectMedia } = require('./_media');

module.exports = {
  name: 'toimg',
  description: 'Convert a sticker (reply to it) back into an image',
  async run(sock, msg, args, ctx) {
    const isSticker = Boolean(
      msg.message.stickerMessage ||
      msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage
    );
    if (!isSticker) return reply(sock, msg, 'Reply to a sticker with `.toimg`.');

    const buffer = await downloadQuotedOrDirectMedia(sock, msg);
    if (!buffer) return reply(sock, msg, 'Could not read that sticker.');

    try {
      const pngBuffer = await sharp(buffer).png().toBuffer();
      await sock.sendMessage(ctx.chatId, { image: pngBuffer }, { quoted: msg });
    } catch (err) {
      console.error('toimg conversion failed:', err);
      await reply(sock, msg, 'Could not convert that sticker to an image.');
    }
  },
};
