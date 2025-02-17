import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const hmrPlugin = {
  name: 'handle-hmr-custom',
  async handleHotUpdate({ file, server }) {
    if (file.includes('/packages/') && !file.includes('themes')) {
      server.ws.send({ type: 'full-reload' });
    }
  },
};

const createDateStrings = () => {
  const dateObj = new Date();

  const year = dateObj.getFullYear();
  const full = dateObj.toString();
  return process.env.NODE_ENV === 'development' ? { year, full, date: dateObj } : { year };
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    hmrPlugin,
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
      '@npm': fileURLToPath(new URL('./node_modules', import.meta.url)),
      '@component':
        command === 'serve'
          ? fileURLToPath(new URL('./node_modules/byfo-components-lit/src/', import.meta.url))
          : fileURLToPath(new URL('./node_modules/byfo-components-lit/dist/', import.meta.url)),
    },
  },
  server: {
    port: 5150,
    strictPort: true,
  },
  define: {
    __BUILD_DATE__: createDateStrings(),
  },
}));
