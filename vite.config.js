import fs from 'fs'
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { reticle } from '@reticlehq/vite-plugin';
/**
 * Stamps public/sw.js with the build's asset list.
 *
 * The file names are content-hashed, so a hand-written worker cannot know
 * them; and a worker whose bytes never change between deploys is one the
 * browser never reinstalls, so the list changing is also what makes a new
 * deploy take effect.
 */
function swPrecache() {
  return {
    name: 'sw-precache',
    apply: 'build',
    writeBundle(options, bundle) {
      const swPath = path.join(options.dir || 'dist', 'sw.js');
      if (!fs.existsSync(swPath)) return;
      const assets = Object.keys(bundle)
        .filter((f) => !f.endsWith('.map') && f !== 'sw.js')
        .map((f) => '/' + f);
      fs.writeFileSync(
        swPath,
        fs.readFileSync(swPath, 'utf8').replace("'__PRECACHE__'", JSON.stringify(assets))
      );
    },
  };
}

export default defineConfig({
  plugins: [reticle({ captureNetworkBodies: true }), react(), swPrecache()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
