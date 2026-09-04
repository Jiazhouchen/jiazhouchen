export type Portrait = { key: string; url: string; rare: boolean }

export const rarePortraitProbability = 0.01

export function isRarePortraitKey(key: string): boolean {
  return /(?:^|\/)rare\d+\.(?:jpe?g|png|webp|avif)$/i.test(key)
}

const modules = import.meta.glob<string>('../../asset/portraits/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const portraits: Portrait[] = Object.entries(modules)
  .map(([key, url]) => ({ key, url, rare: isRarePortraitKey(key) }))
  .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))

export function selectPortrait<T extends { key: string; rare?: boolean }>(
  items: T[],
  previousKey: string | null,
  random: () => number = Math.random,
): T | null {
  if (items.length === 0) return null
  const candidates = items.length > 1 ? items.filter(({ key }) => key !== previousKey) : items
  const rareCandidates = candidates.filter(({ rare }) => rare === true)
  const regularCandidates = candidates.filter(({ rare }) => rare !== true)
  const pool = rareCandidates.length > 0 && regularCandidates.length > 0
    ? (random() < rarePortraitProbability ? rareCandidates : regularCandidates)
    : candidates
  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1)
  return pool[index] ?? pool[0] ?? null
}

let portraitForThisVisit: Portrait | null | undefined

export function getPortraitForVisit(): Portrait | null {
  if (portraitForThisVisit !== undefined) return portraitForThisVisit

  let previous: string | null = null
  try {
    previous = localStorage.getItem('jiazhou-last-portrait')
  } catch {
    // Random selection still works without storage.
  }

  portraitForThisVisit = selectPortrait(portraits, previous)
  if (portraitForThisVisit) {
    try {
      localStorage.setItem('jiazhou-last-portrait', portraitForThisVisit.key)
    } catch {
      // Persistence is an enhancement, not a requirement for rendering.
    }
  }
  return portraitForThisVisit
}
