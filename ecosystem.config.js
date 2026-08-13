// PM2 process config. This keeps manager.js itself alive 24/7 — manager.js
// in turn keeps every tenant's worker.js alive as its own child process.
//
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save              (so it survives a server reboot, after pm2 startup)
//   pm2 logs space-bot-manager
//   pm2 restart space-bot-manager
//   pm2 stop space-bot-manager

module.exports = {
  apps: [
    {
      name: 'space-bot-manager',
      script: 'manager.js',
      args: 'start-all',
      autorestart: true,
      max_restarts: 20,
      restart_delay: 5000,
      watch: false, // don't restart on file changes in production
      max_memory_restart: '1G', // adjust based on your VPS size and tenant count
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
