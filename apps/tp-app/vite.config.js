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

const createDateStrings = () => {
  const dateObj = new Date();

  const year = dateObj.getFullYear();
  const full = dateObj.toString();

  return {year,full,date: dateObj};
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
      '@npm': fileURLToPath(new URL('./node_modules',import.meta.url))
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
    __BUILD_DATE__: createDateStrings(),
    __IS_DEV__: process.env.NODE_ENV === 'development',
  },
});
