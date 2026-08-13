// In-memory tracker: key = `${chatId}:${sender}` -> { lastText, count, lastTs }
const history = new Map();

const REPEAT_THRESHOLD = 4; // same message this many times in a row
const WINDOW_MS = 10000; // ...within this window
const RATE_THRESHOLD = 5; // or this many messages total
const RATE_WINDOW_MS = 8000; // ...within this window

const rateHistory = new Map(); // key -> array of timestamps

function checkSpam(chatId, sender, text) {
  const key = `${chatId}:${sender}`;
  const now = Date.now();

  // Repeat-message check
  const prev = history.get(key);
  if (prev && prev.lastText === text && now - prev.lastTs < WINDOW_MS) {
    prev.count += 1;
    prev.lastTs = now;
  } else {
    history.set(key, { lastText: text, count: 1, lastTs: now });
  }
  const repeatFlag = history.get(key).count >= REPEAT_THRESHOLD;

  // Rate check
  const times = (rateHistory.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  times.push(now);
  rateHistory.set(key, times);
  const rateFlag = times.length >= RATE_THRESHOLD;

  if (repeatFlag) history.get(key).count = 0; // reset after flagging once
  if (rateFlag) rateHistory.set(key, []);

  return repeatFlag || rateFlag;
}

module.exports = { checkSpam };
