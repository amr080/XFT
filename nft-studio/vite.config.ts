import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
// when making changes to this file start vite with --force flag
export default defineConfig({
  optimizeDeps: {
    // prebundle local libraries in workspace
    include: ['@centrifuge/centrifuge-js', '@centrifuge/fabric'],
  },
  envPrefix: 'REACT_APP_',
  build: {
    target: 'modules',
    outDir: 'build',
    commonjsOptions: {
      // ensure all packages are converted to ES6 for rollup bundle
      include: [/fabric/, /node_modules/],
    },
  },
  resolve: {
    // resolve every package version to the one in this projects package.json
    dedupe: ['styled-components', 'react', 'styled-system', '@polkadot/util-crypto', '@polkadot/api'],
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-styled-components'],
      },
    }),
  ],
})