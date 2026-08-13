const { reply } = require('./_reply');

const startedAt = Date.now();

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

module.exports = {
  name: 'alive',
  description: 'Show bot status and uptime',
  async run(sock, msg) {
    const uptime = formatUptime(Date.now() - startedAt);
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    await reply(
      sock,
      msg,
      `✅ Bot is alive\nUptime: ${uptime}\nRAM: ${ram} MiB`
    );
  },
};
