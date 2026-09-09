import { createAssetServer } from 'remix/assets'
import { loadConfig } from 'remix/cli'
import { uiHmr } from 'remix/ui-hmr/assets'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const isDevelopment = nodeEnv === 'development'
const isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR)

const config = await loadConfig(import.meta.dirname)
if (config.assets === undefined) throw new Error('Missing assets configuration in remix.json')

export const assets = createAssetServer({
  ...config.assets,
  sourceMaps: isDevelopment ? 'external' : undefined,
  minify: !isDevelopment,
  watch: isDevelopment,
  // Fingerprints hash the final emitted bytes, so no BUILD_ID is needed. Fingerprinted URLs are
  // served with `Cache-Control: public, max-age=31536000, immutable`; watch mode keeps stable URLs.
  fingerprint: !isDevelopment,
  hmr: isHmr
    ? {
        channel: async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel(),
        // Browsers without support for multiple import maps load updates through this polyfill.
        moduleImporter: 'remix/multiple-import-maps-polyfill',
      }
    : undefined,
  scripts: { loaders: isHmr ? [uiHmr()] : undefined },
})

const entry = 'app/actions/public/entry.ts'

// href + preloads + import map for the client entry (replaces getHref/getPreloads).
export const scriptEntry = await assets.getScriptEntry(entry)
