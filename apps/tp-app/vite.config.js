import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const watcherPlugin = {
  name: 'watch-node-modules',
  configureServer: server => {
    server.watcher.on('change', file => {
      if (/byfo-components\/dist\/components\/.*/.test(file) || /byfo-themes.+\.ts$/.test(file) || /byfo-utils/.test(file)) {
        server.restart();
      }
    });
  },
};

const createDateString = () => {
  const date = new Date();

  const year = date.getFullYear();
  let month = date.getMonth();
  if(month.length === 1) month = `0${month}`;
  let day = date.getDay();
  if(day.length === 1) day = `0${day}`;

  const full = `${year}-${month}-${day}`;

  return {year,full};
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    watcherPlugin,
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('tp-') || tag.startsWith('byfo-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5150,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['byfo-components/dist/components/tp-input-zone'],
  },
  define: {
    __BUILD_DATE__: createDateString(),
  },
});
