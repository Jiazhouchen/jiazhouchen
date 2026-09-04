import { describe, expect, it } from 'vitest'
import { isRarePortraitKey, rarePortraitProbability, selectPortrait } from './portraits'

const items = [{ key: 'one' }, { key: 'two' }, { key: 'three' }]

describe('selectPortrait', () => {
  it('handles an empty folder', () => {
    expect(selectPortrait([], null)).toBeNull()
  })

  it('uses the only available portrait', () => {
    expect(selectPortrait([items[0]], 'one', () => 0)).toEqual(items[0])
  })

  it('excludes the previous portrait when alternatives exist', () => {
    expect(selectPortrait(items, 'one', () => 0)?.key).toBe('two')
    expect(selectPortrait(items, 'two', () => 0.99)?.key).not.toBe('two')
  })

  it('recognizes numbered rare portrait filenames across supported formats', () => {
    expect(isRarePortraitKey('../../asset/portraits/rare1.jpeg')).toBe(true)
    expect(isRarePortraitKey('../../asset/portraits/rare24.PNG')).toBe(true)
    expect(isRarePortraitKey('../../asset/portraits/rare.jpg')).toBe(false)
    expect(isRarePortraitKey('../../asset/portraits/notrare1.jpeg')).toBe(false)
  })

  it('selects from the collective rare pool only on the one-percent branch', () => {
    const weightedItems = [
      { key: 'normal-one', rare: false },
      { key: 'normal-two', rare: false },
      { key: 'rare-one', rare: true },
      { key: 'rare-two', rare: true },
    ]
    const sequence = (...values: number[]) => {
      let index = 0
      return () => values[index++] ?? 0
    }

    expect(rarePortraitProbability).toBe(0.01)
    expect(selectPortrait(weightedItems, null, sequence(0.009, 0.99))?.key).toBe('rare-two')
    expect(selectPortrait(weightedItems, null, sequence(0.01, 0))?.key).toBe('normal-one')
  })
})
