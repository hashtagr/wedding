import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import { handleRsvpHttpRequest } from './src/server/rsvp-handler.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log('[rsvp] env loaded', {
    scriptUrlPresent: Boolean(env.GOOGLE_SCRIPT_URL),
  });

  return {
    publicDir: resolve(__dirname, '../images'),
    build: {
      rollupOptions: {
        input: {
          family: resolve(__dirname, 'family.html'),
          friends: resolve(__dirname, 'friends.html'),
        },
      },
    },
    server: {
      open: '/family.html',
    },
    plugins: [
      {
        name: 'rsvp-api-dev',
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            const pathname = request.url?.split('?')[0];

            if (pathname !== '/api/rsvp') {
              next();
              return;
            }

            await handleRsvpHttpRequest(request, response, {
              scriptUrl: env.GOOGLE_SCRIPT_URL,
            });
          });
        },
      },
    ],
  };
});
