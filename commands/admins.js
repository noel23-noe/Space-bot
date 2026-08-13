const staff = require('./staff');

module.exports = {
  name: 'admins',
  description: 'List group admins (alias of .staff)',
  run: staff.run,
};
