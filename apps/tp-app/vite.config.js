import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const watcherPlugin = {
  name: 'watch-node-modules',
  configureServer: server => {
    server.watcher.on('change', file => {
      if (/byfo-components\/dist\/components\/.*/.test(file) || /byfo-native/.test(file)) {
        server.restart();
      }
    });
  },
};

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
});
