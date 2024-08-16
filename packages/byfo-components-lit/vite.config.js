import { defineConfig } from 'vite'
import { execSync } from 'child_process'

const srcFiles = execSync('ls src').toString();
const entry = srcFiles.split('\n').filter(f => f.startsWith('byfo')).map(f=>`src/${f}`);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry,
      formats: ['es'],
    }
  },
})