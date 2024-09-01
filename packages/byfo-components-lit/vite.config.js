import { defineConfig } from 'vite'
import { execSync } from 'child_process'

const components = execSync('ls src/components').toString().trim().split('\n').map(f=>`src/components/${f}`);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: [...components,'src/index'],
      formats: ['es'],
    }
  },
})