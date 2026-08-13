const { reply } = require('./_reply');

module.exports = {
  name: 'news',
  description: 'Get top headlines: .news [topic]',
  async run(sock, msg, args) {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) return reply(sock, msg, 'News needs NEWSAPI_KEY set in .env. Get a free key at newsapi.org.');

    const topic = args.join(' ');
    const url = topic
      ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&pageSize=5&apiKey=${apiKey}`
      : `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data.articles?.length) return reply(sock, msg, 'No news found for that.');

      const lines = data.articles.map((a, i) => `${i + 1}. ${a.title}\n${a.url}`);
      await reply(sock, msg, `📰 *Top news${topic ? ' — ' + topic : ''}*\n\n${lines.join('\n\n')}`);
    } catch (err) {
      await reply(sock, msg, 'Could not fetch news right now, try again shortly.');
    }
  },
};
