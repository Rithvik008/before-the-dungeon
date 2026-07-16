import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

await build({
  entryPoints: [resolve(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: resolve(__dirname, '../dist/server/index.js'),
  external: [],
  define: {
    'globalThis.enableWebbitBundlingHack': 'false',
  },
})

console.log('Server built → dist/server/index.js')
