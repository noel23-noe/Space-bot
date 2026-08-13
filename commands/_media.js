const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// Returns the Baileys message object to download media from: either the
// message itself (if it has media) or the quoted message it's replying to.
function getMediaMessage(msg) {
  const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted) {
    return {
      key: {
        remoteJid: msg.key.remoteJid,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
        participant: msg.message.extendedTextMessage.contextInfo.participant,
      },
      message: quoted,
    };
  }
  if (
    msg.message.imageMessage ||
    msg.message.videoMessage ||
    msg.message.stickerMessage ||
    msg.message.audioMessage
  ) {
    return msg;
  }
  return null;
}

async function downloadQuotedOrDirectMedia(sock, msg, logger) {
  const target = getMediaMessage(msg);
  if (!target) return null;
  return downloadMediaMessage(target, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage });
}

module.exports = { downloadQuotedOrDirectMedia };
