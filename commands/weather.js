const { reply } = require('./_reply');

module.exports = {
  name: 'weather',
  description: 'Get current weather: .weather <city>',
  async run(sock, msg, args) {
    const city = args.join(' ');
    if (!city) return reply(sock, msg, 'Give a city, e.g. `.weather Nairobi`');

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return reply(sock, msg, 'Weather needs OPENWEATHER_API_KEY set in .env. Get a free key at openweathermap.org/api.');

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
      );
      if (res.status === 404) return reply(sock, msg, `Could not find a city called "${city}".`);
      const data = await res.json();

      const text = [
        `📍 ${data.name}, ${data.sys.country}`,
        `${data.weather[0].main} — ${data.weather[0].description}`,
        `🌡️ ${data.main.temp}°C (feels like ${data.main.feels_like}°C)`,
        `💧 Humidity: ${data.main.humidity}%`,
        `💨 Wind: ${data.wind.speed} m/s`,
      ].join('\n');
      await reply(sock, msg, text);
    } catch (err) {
      await reply(sock, msg, 'Could not fetch weather right now, try again shortly.');
    }
  },
};
