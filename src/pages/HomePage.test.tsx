import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage experiences', () => {
  it('synchronizes timeline selection with the shared detail card', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const timeline = document.querySelector('.timeline') as HTMLElement
    const timelineEntries = within(timeline).getAllByRole('button')
    const phdIndex = timelineEntries.findIndex((entry) => entry.textContent?.includes('PhD in Computational Neuroscience'))
    const predoctoralIndex = timelineEntries.findIndex((entry) => entry.textContent?.includes('Predoctoral Fellow'))
    expect(phdIndex).toBeGreaterThanOrEqual(0)
    expect(phdIndex).toBeLessThan(predoctoralIndex)

    await user.click(within(timeline).getByRole('button', { name: /B\.S\. in Psychology and B\.A\. in Economics/i }))
    expect(screen.getByRole('heading', { name: 'B.S. in Psychology and B.A. in Economics' })).toBeInTheDocument()
    expect(screen.getByText('College of Liberal Arts')).toBeInTheDocument()
    expect(screen.getAllByText('University of Texas at Austin').length).toBeGreaterThan(0)
    expect(screen.getByText('University of Texas at Austin, Austin, TX, USA')).toBeInTheDocument()
  })
})
