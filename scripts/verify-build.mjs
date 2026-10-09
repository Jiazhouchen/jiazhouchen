import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import { getLiveDocPath, readLiveDocs, siteUrl } from './live-doc-config.mjs'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const liveDocs = await readLiveDocs(root)
const cv = await readFile(resolve(dist, 'cv/index.html'), 'utf8')
const research = await readFile(resolve(dist, 'research/index.html'), 'utf8')
const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8')
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8')

const failures = []
if (!cv.includes('content="noindex, nofollow"')) failures.push('/cv/index.html is missing static noindex metadata')
if (/Disallow:\s*\/cv\/?/i.test(robots)) failures.push('robots.txt blocks /cv, preventing crawlers from seeing noindex')
if (sitemap.includes('/cv')) failures.push('sitemap.xml must omit /cv')
if (!sitemap.includes('/research/')) failures.push('sitemap.xml must include /research/')
if (sitemap.includes('/projects/')) failures.push('sitemap.xml must not include the retired /projects/ route')
if (!research.includes('https://jiazhouchen.com/research/')) failures.push('/research/index.html is missing canonical research metadata')

for (const liveDoc of liveDocs) {
  const path = getLiveDocPath(liveDoc)
  const html = await readFile(resolve(dist, path.slice(1)), 'utf8')
  if (!html.includes('content="noindex, nofollow"')) failures.push(`${path} is missing static noindex metadata`)
  if (!html.includes(`${siteUrl}${path}`)) failures.push(`${path} is missing its canonical metadata`)
  if (sitemap.includes(path)) failures.push(`sitemap.xml must omit hidden live document ${path}`)
}

const textExtensions = new Set(['.html', '.js', '.css', '.txt', '.xml', '.json'])
const files = []
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else files.push(path)
  }
}
await collect(dist)

for (const file of files) {
  const extension = extname(file)
  if (!textExtensions.has(extension)) continue
  const value = await readFile(file, 'utf8')
  if (value.includes('(832) 330-4733') || value.includes('8323304733')) failures.push(`Phone number leaked into ${file}`)
  if (/fonts\.googleapis\.com|unpkg\.com|cdn\.jsdelivr\.net/.test(value)) failures.push(`Runtime CDN reference found in ${file}`)
}

for (const liveDoc of liveDocs) {
  const sourceName = basename(liveDoc.content, '.pdf')
  if (!files.some((file) => {
    const outputName = basename(file)
    return extname(file) === '.pdf' && (outputName === `${sourceName}.pdf` || outputName.startsWith(`${sourceName}-`))
  })) {
    failures.push(`Bundled PDF is missing for ${liveDoc.content}`)
  }
}

if (failures.length) {
  throw new Error(`Build verification failed:\n- ${failures.join('\n- ')}`)
}

console.log(`Verified ${files.length} production files, route metadata, privacy, and local-only assets.`)
