import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')
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
  const extension = file.slice(file.lastIndexOf('.'))
  if (!textExtensions.has(extension)) continue
  const value = await readFile(file, 'utf8')
  if (value.includes('(832) 330-4733') || value.includes('8323304733')) failures.push(`Phone number leaked into ${file}`)
  if (/fonts\.googleapis\.com|unpkg\.com|cdn\.jsdelivr\.net/.test(value)) failures.push(`Runtime CDN reference found in ${file}`)
}

if (failures.length) {
  throw new Error(`Build verification failed:\n- ${failures.join('\n- ')}`)
}

console.log(`Verified ${files.length} production files, route metadata, privacy, and local-only assets.`)
