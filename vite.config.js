import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function pwaServiceWorker() {
  let base = '/'

  return {
    name: 'weather-board-pwa-service-worker',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    async generateBundle(_options, bundle) {
      const basePath = base === '/' ? '' : base.replace(/\/$/, '')
      const toUrl = (file) => `${basePath}/${file}`
      const builtAssets = Object.values(bundle)
        .filter((item) =>
          item.type === 'chunk' ||
          (item.type === 'asset' && /\.(?:css|woff2?|png|jpe?g|svg|webp)$/.test(item.fileName))
        )
        .map((item) => toUrl(item.fileName))
      const precacheUrls = [
        toUrl('index.html'),
        toUrl('manifest.webmanifest'),
        toUrl('pwa-icon.svg'),
        toUrl('favicon.svg'),
        ...builtAssets,
      ]
      const uniquePrecacheUrls = [...new Set(precacheUrls)]
      const buildId = createHash('sha256')
        .update(JSON.stringify(uniquePrecacheUrls))
        .digest('hex')
        .slice(0, 12)
      const templatePath = fileURLToPath(
        new URL('./pwa/sw-template.js', import.meta.url)
      )
      const template = await readFile(templatePath, 'utf8')
      const source = template
        .replace('__BUILD_ID__', buildId)
        .replace(
          'const PRECACHE_URLS = [];',
          `const PRECACHE_URLS = ${JSON.stringify(uniquePrecacheUrls)};`
        )
      const serviceWorkerPath = `${basePath}/sw.js`.replace(/^\//, '')

      this.emitFile({
        type: 'asset',
        fileName: serviceWorkerPath,
        source,
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pwaServiceWorker(),
  ],
})