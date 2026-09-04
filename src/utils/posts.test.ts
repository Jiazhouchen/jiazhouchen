import { describe, expect, it } from 'vitest'
import { getVisiblePosts } from './posts'

const post = {
  id: 'test-post',
  title: 'Test post',
  date: '2026-09-01',
  dateLabel: 'September 1st 2026',
  body: 'Test body',
}

describe('getVisiblePosts', () => {
  it('keeps persistent posts and posts through their expiration date', () => {
    const today = new Date(2026, 8, 4, 12)
    expect(getVisiblePosts([
      { ...post, id: 'persistent', expiresAt: null },
      { ...post, id: 'expires-today', expiresAt: '2026-09-04' },
    ], today).map(({ id }) => id)).toEqual(['persistent', 'expires-today'])
  })

  it('removes posts after their expiration date', () => {
    const today = new Date(2026, 8, 5, 12)
    expect(getVisiblePosts([{ ...post, expiresAt: '2026-09-04' }], today)).toEqual([])
  })
})
