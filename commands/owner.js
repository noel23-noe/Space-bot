const { reply } = require('./_reply');

// Fill in your own contact details before deploying.
const OWNER_NAME = 'Noel Musya';
const OWNER_NUMBER = '+254794463885';
const OWNER_INSTAGRAM = 'The Developer | thedeveloper2026';
const OWNER_EMAIL = 'musyanoel85@gmail.com';

module.exports = {
  name: 'owner',
  description: 'Show bot owner contact info',
  async run(sock, msg) {
    await reply(
      sock,
      msg,
      `👤 Owner: ${OWNER_NAME}\n📞 ${OWNER_NUMBER}\n📸 Instagram: ${OWNER_INSTAGRAM}\n📧 Email: ${OWNER_EMAIL}`
    );
  },
};
