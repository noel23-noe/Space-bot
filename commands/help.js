const menu = require('./menu');

module.exports = {
  name: 'help',
  description: 'Show list of commands (alias of .menu)',
  run: menu.run,
};
