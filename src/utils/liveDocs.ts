const siteUrl = 'https://jiazhouchen.com'
const slugAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'

type LiveDocRouteConfig = {
  vendor: string
  content: string
  url: string
}

function generatedSlug({ vendor, content }: LiveDocRouteConfig) {
  let state = 2166136261
  const seed = `${vendor}\0${content}`

  for (let index = 0; index < seed.length; index += 1) {
    state = Math.imul(state ^ seed.charCodeAt(index), 16777619)
  }

  let slug = ''
  for (let index = 0; index < 20; index += 1) {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    slug += slugAlphabet[((value ^ (value >>> 14)) >>> 0) % slugAlphabet.length]
  }
  return slug
}

export function getLiveDocPath(liveDoc: LiveDocRouteConfig) {
  const configuredUrl = liveDoc.url.trim()
  if (!configuredUrl) return `/${generatedSlug(liveDoc)}`

  let parsedUrl: URL
  try {
    if (configuredUrl.startsWith('/')) {
      parsedUrl = new URL(configuredUrl, siteUrl)
    } else if (/^[a-z][a-z\d+.-]*:\/\//i.test(configuredUrl)) {
      parsedUrl = new URL(configuredUrl)
    } else if (configuredUrl.includes('/')) {
      parsedUrl = new URL(`https://${configuredUrl}`)
    } else {
      parsedUrl = new URL(`/${configuredUrl}`, siteUrl)
    }
  } catch {
    throw new Error(`Invalid live document URL "${liveDoc.url}"`)
  }

  if (!['jiazhouchen.com', 'www.jiazhouchen.com'].includes(parsedUrl.hostname)) {
    throw new Error(`Live document URL must use jiazhouchen.com: "${liveDoc.url}"`)
  }
  if (!/^\/[a-z0-9_-]+$/i.test(parsedUrl.pathname)) {
    throw new Error(`Live document URL must use a root-level path: "${liveDoc.url}"`)
  }
  if (['/index', '/404', '/assets', '/cv', '/research', '/connect', '/projects'].includes(parsedUrl.pathname.toLowerCase())) {
    throw new Error(`Live document URL is reserved: "${liveDoc.url}"`)
  }

  return parsedUrl.pathname
}

const pdfModules = import.meta.glob<string>('../../asset/pdfs/*.pdf', {
  eager: true,
  query: '?url',
  import: 'default',
})

const pdfUrls = new Map(
  Object.entries(pdfModules).map(([path, url]) => [path.replace(/^\.\.\/\.\.\//, ''), url]),
)

export function getLiveDocAsset(contentPath: string) {
  const normalizedPath = contentPath.replace(/^\/+/, '')
  const assetUrl = pdfUrls.get(normalizedPath)
  if (!assetUrl) throw new Error(`Live document asset not found: "${contentPath}"`)
  return assetUrl
}
