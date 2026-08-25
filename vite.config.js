import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { reticle } from '@reticlehq/vite-plugin';
export default defineConfig({
  plugins: [reticle({ captureNetworkBodies: true }),react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
