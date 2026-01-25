import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      '/api': {
        target: 'https://vxfpuksczazj.share.zrok.io',
        changeOrigin: true,
        secure: true,
      },
    },
    // hmr: {
    //   overlay: false,
    // },
  },
})

