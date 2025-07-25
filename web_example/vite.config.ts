import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isLocal = command === 'serve';
  return {
    plugins: [
      deno(), 
      svelte(),
      {
        name: 'full-reload-on-change',
        handleHotUpdate({ file, server }) {
          if (file.endsWith('src/rendering/CanvasWrapper.ts')) {
            console.log('Reloading page due to CanvasWrapper.ts change...');
            server.ws.send({
              type: 'full-reload',
              path: '*'
            });
          }
        },
      }
    ],
    base: isLocal ? '/' : '/emergent-animations/',
    define: {
      __IS_LOCAL__: JSON.stringify(isLocal)
    }
  };
});
