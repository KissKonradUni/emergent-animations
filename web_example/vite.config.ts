import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
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
})
