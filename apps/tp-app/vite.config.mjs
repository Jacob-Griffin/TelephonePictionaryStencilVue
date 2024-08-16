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
  return process.env.NODE_ENV === 'development' ?
  { year,full,date: dateObj } :
  { year };
}

// https://vitejs.dev/config/
export default defineConfig(({command})=>({
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
        '@npm': fileURLToPath(new URL('./node_modules',import.meta.url)),
        '@component': command === 'serve' ? fileURLToPath(new URL('./node_modules/byfo-components-lit/src/', import.meta.url)) : fileURLToPath(new URL('./node_modules/byfo-components-lit/dist/', import.meta.url))
      },
    },
    server: {
      port: 5150,
      strictPort: true,
    },
    define: {
      __BUILD_DATE__: createDateStrings(),
      __IS_DEV__: process.env.NODE_ENV === 'development',
    },
}));
