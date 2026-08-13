const { reply } = require('./_reply');

module.exports = {
  name: 'trt',
  description: 'Translate text: .trt <lang_code> <text> (e.g. .trt fr hello there)',
  async run(sock, msg, args) {
    const [langCode, ...rest] = args;
    const text = rest.join(' ');
    if (!langCode || !text) return reply(sock, msg, 'Usage: `.trt <lang_code> <text>`, e.g. `.trt fr hello there`');

    try {
      const res = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'auto', target: langCode, format: 'text' }),
      });
      const data = await res.json();
      if (!data.translatedText) return reply(sock, msg, `Could not translate to "${langCode}". Use a language code like en, fr, es, sw.`);
      await reply(sock, msg, `🌐 ${data.translatedText}`);
    } catch (err) {
      await reply(sock, msg, 'Translation service is unavailable right now, try again shortly.');
    }
  },
};
