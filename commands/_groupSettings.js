const fs = require('fs');
const path = require('path');

// Per-tenant settings file, so each customer's group configs stay isolated.
// TENANT_ID is set by worker.js (defaults to "default" for standalone/single-tenant use).
const TENANT_ID = process.env.TENANT_ID || 'default';
const FILE = path.join(__dirname, '..', 'data', `groupSettings.${TENANT_ID}.json`);

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return {};
  }
}

let settings = load();

function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(settings, null, 2));
}

function get(chatId) {
  return settings[chatId] || { welcome: false, welcomeMsg: null, antispam: false, antilink: false };
}

function set(chatId, patch) {
  settings[chatId] = { ...get(chatId), ...patch };
  save();
}

module.exports = { get, set };
