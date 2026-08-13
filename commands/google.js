const { reply } = require('./_reply');

module.exports = {
  name: 'google',
  description: 'Quick web search: .google <query>',
  async run(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return reply(sock, msg, 'Give a search query, e.g. `.google baileys npm`');

    try {
      const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
      const data = await res.json();

      const summary = data.AbstractText || data.Answer;
      if (summary) {
        return reply(sock, msg, `${summary}\n\n🔗 ${data.AbstractURL || ''}`);
      }

      const related = data.RelatedTopics?.filter((t) => t.Text).slice(0, 3);
      if (related?.length) {
        const lines = related.map((t) => `• ${t.Text}\n  ${t.FirstURL}`);
        return reply(sock, msg, `Results for "${query}":\n\n${lines.join('\n\n')}`);
      }

      await reply(sock, msg, `No quick answer found for "${query}". Try a more specific query, or search directly at duckduckgo.com.`);
    } catch (err) {
      await reply(sock, msg, 'Search is unavailable right now, try again shortly.');
    }
  },
};
