import { describe, expect, it } from 'vitest'
import { content, validateAllContent } from './index'

describe('content', () => {
  it('validates every JSON collection and cross-reference', () => {
    expect(() => validateAllContent()).not.toThrow()
    expect(content.researchAreas).toHaveLength(3)
    expect(content.posts).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'ucdn-postdoctoral-fellow-2026', expiresAt: null }),
    ]))
    expect(new Set(content.publications.map(({ type }) => type))).toEqual(new Set(['article', 'review', 'conference-proceedings', 'preprint']))
    expect(content.publications.every(({ researchAreaIds, description }) => researchAreaIds.length > 0 && description.length > 0)).toBe(true)
    expect(content.presentations.every(({ researchAreaIds, description }) => researchAreaIds.length > 0 && description.length > 0)).toBe(true)
    expect(content.awards).toEqual(expect.arrayContaining([
      expect.objectContaining({ description: 'Undergraduate Research Fund', amount: '$2,000', yearAwarded: 2017 }),
    ]))
    expect(content.experiences.locations.map(({ id }) => id)).toEqual(expect.arrayContaining(['guangzhou', 'austin', 'pittsburgh', 'london', 'bethesda']))
    expect(content.experiences.locations.find(({ id }) => id === 'guangzhou')).toMatchObject({ region: 'Guangdong, China' })
    expect(content.experiences.experiences.find(({ id }) => id === 'guangzhou-home')).toMatchObject({ start: null, dateLabel: null })
    expect(content.experiences.experiences.find(({ id }) => id === 'ut-austin-bachelors')).toMatchObject({
      degree: 'B.S. in Psychology and B.A. in Economics',
      department: 'College of Liberal Arts',
      institution: 'University of Texas at Austin',
    })
  })

  it('keeps private phone data out of public JSON', () => {
    expect(JSON.stringify(content)).not.toMatch(/832.{0,4}330.{0,4}4733/)
  })
})
