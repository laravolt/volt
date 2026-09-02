import { createAssetServer } from 'remix/assets'
import { loadConfig } from 'remix/cli'
import { uiHmr } from 'remix/ui-hmr/assets'

const nodeEnv = process.env.NODE_ENV ?? 'development'
const isDevelopment = nodeEnv === 'development'
const isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR)

const config = await loadConfig(import.meta.dirname)
if (config.assets === undefined) throw new Error('Missing assets configuration in remix.json')

// In production, set BUILD_ID (e.g. the git SHA) per deployment: assets get fingerprinted URLs
// with `Cache-Control: public, max-age=31536000, immutable`. Without it, URLs are stable + ETag.
const buildId = process.env.BUILD_ID

export const assets = createAssetServer({
  ...config.assets,
  sourceMaps: isDevelopment ? 'external' : undefined,
  minify: !isDevelopment,
  watch: isDevelopment,
  fingerprint: !isDevelopment && buildId ? { buildId } : undefined,
  hmr: isHmr
    ? async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel()
    : undefined,
  scripts: { loaders: isHmr ? [uiHmr()] : undefined },
})

const entry = 'app/actions/public/entry.ts'

export const entryHref = await assets.getHref(entry)
export const entryPreloads = await assets.getPreloads(entry)
