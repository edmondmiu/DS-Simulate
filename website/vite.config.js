import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-md'

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // <-- allows Vue to compile Markdown files
    }),
    Markdown({
      // Configure markdown processing
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      // Enable syntax highlighting for code blocks
      markdownItSetup(md) {
        // You can add markdown-it plugins here if needed
      },
      wrapperClasses: 'markdown-body',
    }),
  ],
  base: '/',
  server: {
    fs: {
      // Allow serving files from parent directory
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})