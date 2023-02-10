import { defineConfig } from "vite-plugin-windicss";

export default defineConfig({
  theme: {
    extend: {
      colors: {
        "brand-primary": "#2c33bf",
        "brand-select": "#8CC63F",
        app: "#DEF",
      },
    },
  },
});
