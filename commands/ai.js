const { reply } = require('./_reply');

module.exports = {
  name: 'ai',
  description: 'Ask the AI a question: .ai <question>',
  async run(sock, msg, args) {
    const question = args.join(' ');
    if (!question) return reply(sock, msg, 'Ask something, e.g. `.ai what\'s a good reply to a late delivery complaint?`');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return reply(sock, msg, 'The .ai command needs ANTHROPIC_API_KEY set in your .env file. Get one at console.anthropic.com.');
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 500,
          messages: [{ role: 'user', content: question }],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error('Anthropic API error:', res.status, errBody);
        return reply(sock, msg, 'The AI request failed. Check your API key and try again.');
      }

      const data = await res.json();
      const text = data.content?.find((c) => c.type === 'text')?.text || 'No response generated.';
      await reply(sock, msg, text);
    } catch (err) {
      console.error('.ai command failed:', err);
      await reply(sock, msg, 'Something went wrong reaching the AI service.');
    }
  },
};
