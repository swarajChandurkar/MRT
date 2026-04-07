module.exports = {
  apps: [
    {
      name: 'mrt-international',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'admin123',
        JWT_SECRET: 'mrt-international-secret-2026-change-in-production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
