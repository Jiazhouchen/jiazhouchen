import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export const siteUrl = 'https://jiazhouchen.com'
const slugAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'

function generatedSlug({ vendor, content }) {
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

export function getLiveDocPath(liveDoc) {
  const configuredUrl = liveDoc.url.trim()
  if (!configuredUrl) return `/${generatedSlug(liveDoc)}.html`

  let parsedUrl
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
  if (!/^\/[a-z0-9_-]+\.html$/i.test(parsedUrl.pathname)) {
    throw new Error(`Live document URL must use a root-level .html path: "${liveDoc.url}"`)
  }
  if (['/index.html', '/404.html'].includes(parsedUrl.pathname.toLowerCase())) {
    throw new Error(`Live document URL is reserved: "${liveDoc.url}"`)
  }

  return parsedUrl.pathname
}

export async function readLiveDocs(root) {
  const value = JSON.parse(await readFile(resolve(root, 'src/content/liveDoc.json'), 'utf8'))
  if (!Array.isArray(value)) throw new Error('Invalid liveDoc config: expected a list')

  const paths = new Set()
  for (const [index, liveDoc] of value.entries()) {
    for (const field of ['vendor', 'vendor_color', 'content', 'url']) {
      if (typeof liveDoc?.[field] !== 'string') {
        throw new Error(`Invalid liveDoc config: entry ${index} has no string ${field}`)
      }
    }
    if (!liveDoc.vendor.trim()) throw new Error(`Invalid liveDoc config: entry ${index} has an empty vendor`)
    if (!/^#[\da-f]{6}$/i.test(liveDoc.vendor_color)) {
      throw new Error(`Invalid liveDoc config: entry ${index} must use a six-digit hex vendor_color`)
    }
    if (!/^asset\/pdfs\/[^/]+\.pdf$/i.test(liveDoc.content)) {
      throw new Error(`Invalid liveDoc config: entry ${index} must reference a PDF in asset/pdfs`)
    }
    try {
      await access(resolve(root, liveDoc.content))
    } catch {
      throw new Error(`Invalid liveDoc config: file not found "${liveDoc.content}"`)
    }
    const path = getLiveDocPath(liveDoc)
    if (paths.has(path)) throw new Error(`Invalid liveDoc config: duplicate URL path "${path}"`)
    paths.add(path)
  }

  return value
}
