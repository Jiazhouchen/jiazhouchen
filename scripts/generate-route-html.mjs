import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getLiveDocPath, readLiveDocs, siteUrl } from './live-doc-config.mjs'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const source = await readFile(resolve(dist, 'index.html'), 'utf8')
const liveDocs = await readLiveDocs(root)

const routes = [
  {
    path: 'cv',
    title: 'Curriculum Vitae · Jiazhou Chen',
    description: 'Education, research, publications, presentations, and skills of computational neuroscientist Jiazhou Chen.',
    robots: 'noindex, nofollow',
  },
  {
    path: 'research',
    title: 'Research · Jiazhou Chen',
    description: 'Research on emotion, affective dynamics, learning, decision-making, metacognition, and metareasoning.',
    robots: 'index, follow',
  },
  {
    path: 'connect',
    title: 'Connect · Jiazhou Chen',
    description: 'Contact Jiazhou Chen and read current research and hiring posts.',
    robots: 'index, follow',
  },
  ...liveDocs.map((liveDoc) => ({
    path: getLiveDocPath(liveDoc).slice(1),
    title: `${liveDoc.vendor} · Jiazhou Chen`,
    description: `Conference document presented by Jiazhou Chen at ${liveDoc.vendor}.`,
    robots: 'noindex, nofollow',
  })),
]

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function pageHtml(route) {
  const canonical = escapeHtml(`${siteUrl}/${route.path}/`)
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  return source
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${route.robots}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
}

for (const route of routes) {
  const directory = resolve(dist, route.path)
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), pageHtml(route))
}

const notFound = source
  .replace(/<title>[^<]*<\/title>/, '<title>Page not found · Jiazhou Chen</title>')
  .replace(/<meta name="robots" content="[^"]*"\s*\/>/, '<meta name="robots" content="noindex, nofollow" />')
await writeFile(resolve(dist, '404.html'), notFound)
