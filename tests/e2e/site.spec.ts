import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('all primary routes load directly', async ({ page }) => {
  for (const [path, heading] of [
    ['/', 'Jiazhou Chen, PhD'],
    ['/cv/', 'Curriculum Vitae'],
    ['/research/', 'Research'],
    ['/connect/', 'Contact Information'],
  ]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  }
})

test('CV protects visible contact details and supports printing controls', async ({ page }) => {
  await page.goto('/cv/')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.getByText(/832.*330.*4733/)).toHaveCount(0)
  await expect(page.getByText('jiazhou.chen@nih.gov')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Email me' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Print CV' })).toBeVisible()

  const sectionNavigation = page.getByRole('navigation', { name: 'Curriculum Vitae sections' })
  await expect(sectionNavigation.getByRole('link')).toHaveCount(8)
  await expect(sectionNavigation).toHaveCSS('position', 'sticky')
  await expect(sectionNavigation).toHaveAttribute('data-pinned', 'false')
  await expect(sectionNavigation).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(sectionNavigation.getByRole('link', { name: 'Education' })).toHaveAttribute('aria-current', 'location')
  const awardsSection = page.locator('#awards')
  await expect(awardsSection.getByRole('heading', { name: 'Undergraduate Research Fund' })).toBeVisible()
  await expect(awardsSection.getByText('$2,000')).toBeVisible()
  await expect(awardsSection.getByText('University of Texas at Austin, Austin, TX, USA', { exact: true })).toBeVisible()
  await expect(page.locator('.cv-entry__lead').first()).toHaveCSS('font-weight', '500')
  await expect(page.locator('body')).toHaveCSS('font-family', 'Roboto, Arial, sans-serif')
  await expect(page.getByRole('heading', { name: 'Research Experience' })).toHaveCSS('font-family', '"Roboto Condensed", "Arial Narrow", sans-serif')
  await expect(page.locator('#presentations .citation').first().getByText('Chen, J.', { exact: true })).toHaveCSS('font-weight', '700')

  const researchEntryGap = Number.parseFloat(await page.locator('#research .cv-entry').nth(1).evaluate((element) => getComputedStyle(element).marginTop))
  const researchLocationGap = Number.parseFloat(await page.locator('#research .cv-subentry').nth(2).evaluate((element) => getComputedStyle(element).marginTop))
  expect(researchEntryGap).toBeGreaterThan(researchLocationGap)

  const sectionOrder = await page.locator('.cv-section').evaluateAll((sections) => sections.map(({ id }) => id))
  expect(sectionOrder).toEqual(['education', 'research', 'publications', 'presentations', 'teaching', 'awards', 'skills', 'additional'])

  if ((page.viewportSize()?.width ?? 0) <= 860) {
    await expect(sectionNavigation).toHaveCSS('overflow-x', 'auto')
    const navigationBox = await sectionNavigation.boundingBox()
    const firstLinkBox = await sectionNavigation.getByRole('link').first().boundingBox()
    expect(navigationBox).not.toBeNull()
    expect(firstLinkBox).not.toBeNull()
    expect(firstLinkBox!.x - navigationBox!.x).toBeGreaterThanOrEqual(30)
    const dimensions = await sectionNavigation.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth)
  }
  await sectionNavigation.getByRole('link', { name: 'Publications' }).click()
  await expect(page).toHaveURL(/#publications$/)
  await expect(sectionNavigation).toHaveAttribute('data-pinned', 'true')
  await expect(sectionNavigation.getByRole('link', { name: 'Publications' })).toHaveAttribute('aria-current', 'location')
  const publicationsHeading = page.getByRole('heading', { name: 'Publications', exact: true })
  await expect(publicationsHeading).toBeVisible()
  const headerBox = await page.locator('.site-header').boundingBox()
  const headingBox = await publicationsHeading.boundingBox()
  expect(headerBox).not.toBeNull()
  expect(headingBox).not.toBeNull()
  expect(headingBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height)

  const title = page.getByRole('heading', { name: 'Curriculum Vitae', exact: true })
  const screenFontSize = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
  await page.emulateMedia({ media: 'print' })
  const printFontSize = await title.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))
  await expect(sectionNavigation).toBeHidden()
  await expect(page.getByRole('button', { name: 'Print CV' })).toBeHidden()
  await expect(title).toHaveCSS('text-align', 'center')
  expect(printFontSize).toBeLessThan(screenFontSize)
})

test('Research derives expandable outputs from research-area fields', async ({ page }) => {
  await page.goto('/research/')
  const sectionNavigation = page.getByRole('navigation', { name: 'Research sections' })
  await expect(sectionNavigation).toHaveCSS('position', 'sticky')
  await expect(sectionNavigation).toHaveAttribute('data-pinned', 'false')
  await expect(sectionNavigation.getByRole('link')).toHaveCount(3)
  await expect(page.locator('.research-section')).toHaveCount(3)

  const firstArea = page.locator('#emotion-llm-neuroimaging')
  const output = firstArea.locator('details').filter({ hasText: 'NPPR—On the computational nature of emotions' })
  await output.locator('summary').click()
  await expect(output).toHaveAttribute('open', '')
  await expect(output.getByText(/metareasoning and transformer-based models/)).toBeVisible()
  await expect(page.getByText('NPPR—On the computational nature of emotions: insights from metareasoning and transformers', { exact: true })).toHaveCount(2)

  await sectionNavigation.getByRole('link', { name: 'Learning and Decision-making' }).click()
  await expect(page).toHaveURL(/#learning-decision-meta-level-modeling$/)
  await expect(sectionNavigation).toHaveAttribute('data-pinned', 'true')
  await expect(sectionNavigation.getByRole('link', { name: 'Learning and Decision-making' })).toHaveAttribute('aria-current', 'location')
  const headerBox = await page.locator('.site-header').boundingBox()
  const navigationBox = await sectionNavigation.boundingBox()
  expect(headerBox).not.toBeNull()
  expect(navigationBox).not.toBeNull()
  expect(navigationBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 2)
})

test('Connect shows editable contact information and current news', async ({ page }) => {
  await page.goto('/connect/')
  await expect(page.getByRole('navigation', { name: 'Connect sections' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'News' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Email', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /GitHub/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The Unit on Computational Decision Neuroscience is hiring a new postdoctoral fellow' })).toBeVisible()
  await expect(page.getByText('September 4th 2026')).toBeVisible()
  await expect(page.getByText(/cover letter, CV and a list of recommenders/)).toBeVisible()
  const postFeed = page.getByRole('region', { name: 'Current news' })
  await expect(postFeed).toHaveCSS('overflow-y', 'auto')
  if ((page.viewportSize()?.width ?? 0) > 860) {
    const contactBox = await page.locator('#contact-information').boundingBox()
    const postsBox = await page.locator('#news').boundingBox()
    expect(contactBox).not.toBeNull()
    expect(postsBox).not.toBeNull()
    expect(postsBox!.y).toBeGreaterThan(contactBox!.y + contactBox!.height - 2)
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(page.viewportSize()!.height)
  } else {
    await expect(postFeed).toHaveCSS('height', '360px')
  }
})

test('theme and experience controls are interactive', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Switch to dark theme/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 11, 9)')
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(220, 199, 183)')

  const austinEntry = page.locator('.timeline').getByRole('button', { name: /B\.S\. in Psychology and B\.A\. in Economics/ })
  await austinEntry.click()
  await expect(page.getByRole('heading', { name: 'B.S. in Psychology and B.A. in Economics' })).toBeVisible()
  await expect(page.getByText('College of Liberal Arts')).toBeVisible()
  await expect(austinEntry.getByText('University of Texas at Austin')).toBeVisible()
  await expect(austinEntry.getByText('Austin, TX, USA')).toBeVisible()
  await expect(austinEntry.locator('.timeline-item__institution')).toHaveCSS('white-space', 'normal')
})

test('map switches between locked views and supports bounded panning', async ({ page, isMobile }) => {
  await page.goto('/')
  const map = page.getByRole('group', { name: 'Jiazhou Chen’s career experiences' })
  const viewport = map.locator('.experience-map__viewport')

  await expect(map).toHaveAttribute('data-view-mode', 'focused')
  await expect(viewport).toHaveAttribute('style', /scale\(2\.25\)/)
  await expect(page.getByRole('button', { name: 'Show whole map' })).toBeVisible()

  const startingTransform = await viewport.getAttribute('style')
  await map.focus()
  await expect(map).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('ArrowLeft')
  await expect(viewport).not.toHaveAttribute('style', startingTransform ?? '')
  await expect(viewport).toHaveAttribute('style', /scale\(2\.25\)/)

  if (!isMobile) {
    const beforeDrag = await viewport.getAttribute('style')
    const mapBox = await map.boundingBox()
    expect(mapBox).not.toBeNull()
    await page.mouse.move(mapBox!.x + 65, mapBox!.y + 65)
    await page.mouse.down()
    await page.mouse.move(mapBox!.x + 30, mapBox!.y + 90, { steps: 3 })
    await page.mouse.up()
    await expect(viewport).not.toHaveAttribute('style', beforeDrag ?? '')
    await expect(viewport).toHaveAttribute('style', /scale\(2\.25\)/)
    await expect(map).toHaveCSS('outline-style', 'none')
  }

  const beforeWheel = await viewport.getAttribute('style')
  await map.hover({ position: { x: 80, y: 80 } })
  await page.mouse.wheel(0, -500)
  await expect(viewport).toHaveAttribute('style', beforeWheel ?? '')

  await page.getByRole('button', { name: 'Show whole map' }).click()
  await expect(map).toHaveAttribute('data-view-mode', 'whole')
  await expect(viewport).toHaveAttribute('style', /scale\(1\)/)
  await expect(page.getByRole('button', { name: 'Return to focused map view' })).toBeVisible()
})

test('map circles select experiences without becoming focusable', async ({ page }) => {
  await page.goto('/')
  const pittsburgh = page.locator('[data-location-id="pittsburgh"]')

  await expect(pittsburgh).not.toHaveAttribute('tabindex')
  await pittsburgh.click({ force: true })
  await expect(page.getByRole('heading', { name: 'Research Programmer / Analyst' })).toBeVisible()
  await expect.poll(async () => {
    const mapBox = await page.locator('.experience-map').boundingBox()
    const pinBox = await pittsburgh.locator('.experience-map__target').boundingBox()
    if (!mapBox || !pinBox) return Number.POSITIVE_INFINITY
    return Math.max(
      Math.abs(pinBox.x + pinBox.width / 2 - (mapBox.x + mapBox.width / 2)),
      Math.abs(pinBox.y + pinBox.height / 2 - (mapBox.y + mapBox.height / 2)),
    )
  }).toBeLessThan(2)
  await expect(page.locator('.experience-map')).toHaveCSS('outline-style', 'none')
  await expect(page.locator('.experience-map__label')).toHaveCount(0)
})

test('conference entries and experience icons are excluded from the Home experience', async ({ page }) => {
  await page.goto('/')
  const map = page.getByRole('group', { name: 'Jiazhou Chen’s career experiences' })

  await expect(map.locator('[data-location-id="tubingen"], [data-location-id="chicago"], [data-location-id="hollywood"]')).toHaveCount(0)
  await expect(page.locator('.timeline').getByRole('button', { name: /Computational Psychiatry Conference|Society of Biological Psychiatry|Neuropsychopharmacology/ })).toHaveCount(0)
  await expect(page.locator('.timeline svg, .experience-detail svg')).toHaveCount(0)
})

test('Guangzhou appears as end-only history and the detail placement is responsive', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.getByRole('group', { name: 'Jiazhou Chen’s career experiences' }).locator('[data-location-id="guangzhou"]')).toHaveCount(1)
  await expect(page.locator('.timeline-item').filter({ hasText: /Guangzhou.*Guangdong, China/i })).toHaveCount(1)
  await expect(page.getByText('Until 2012')).toHaveCount(0)

  const mapBox = await page.locator('.map-wrap').boundingBox()
  const detailBox = await page.locator('.experience-detail').boundingBox()
  expect(mapBox).not.toBeNull()
  expect(detailBox).not.toBeNull()

  if ((page.viewportSize()?.width ?? 0) <= 680) {
    const portraitBox = await page.locator('.portrait-frame').boundingBox()
    const profileNameBox = await page.locator('#profile-name').boundingBox()
    expect(portraitBox).not.toBeNull()
    expect(profileNameBox).not.toBeNull()
    expect(portraitBox!.width).toBeLessThanOrEqual(125)
    expect(portraitBox!.x + portraitBox!.width).toBeLessThan(profileNameBox!.x)

    await expect.poll(async () => {
      const settledMapBox = await page.locator('.map-wrap').boundingBox()
      const settledDetailBox = await page.locator('.experience-detail').boundingBox()
      if (!settledMapBox || !settledDetailBox) return Number.POSITIVE_INFINITY
      return Math.max(
        Math.abs(settledDetailBox.y - (settledMapBox.y + 12)),
        Math.max(0, settledDetailBox.y + settledDetailBox.height - settledMapBox.y - settledMapBox.height),
      )
    }).toBeLessThanOrEqual(1)
    const settledDetailBox = await page.locator('.experience-detail').boundingBox()
    const globeBox = await page.getByRole('button', { name: 'Show whole map' }).boundingBox()
    const timelineToggle = page.getByRole('button', { name: 'Show experience timeline' })
    const timelineToggleBox = await timelineToggle.boundingBox()
    const timeline = page.locator('#experience-timeline')
    expect(settledDetailBox).not.toBeNull()
    expect(globeBox).not.toBeNull()
    expect(timelineToggleBox).not.toBeNull()
    expect(globeBox!.y).toBeGreaterThanOrEqual(settledDetailBox!.y - 1)
    expect(globeBox!.y + globeBox!.height).toBeLessThanOrEqual(settledDetailBox!.y + settledDetailBox!.height + 1)
    expect(settledDetailBox!.x + settledDetailBox!.width).toBeLessThan(globeBox!.x)
    expect(Math.abs(globeBox!.x - timelineToggleBox!.x)).toBeLessThanOrEqual(1)
    expect(timelineToggleBox!.y).toBeGreaterThan(globeBox!.y + globeBox!.height)
    await expect(timeline).toHaveCSS('visibility', 'hidden')
    await timelineToggle.click()
    await expect(timeline).toHaveCSS('visibility', 'visible')
    await expect(page.getByRole('complementary', { name: 'Career timeline' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Hide experience timeline' })).toHaveAttribute('aria-expanded', 'true')
    await expect(timeline.getByRole('button', { name: /Guangzhou.*Guangdong, China/i })).toBeVisible()
  } else {
    await expect(page.locator('.timeline-toggle')).toBeHidden()
    expect(detailBox!.y).toBeLessThan(mapBox!.y + mapBox!.height)
  }

  if ((page.viewportSize()?.width ?? 0) > 860) {
    const profileBox = await page.locator('.home-profile').boundingBox()
    const explorerBox = await page.locator('.experience-explorer').boundingBox()
    expect(profileBox).not.toBeNull()
    expect(explorerBox).not.toBeNull()
    expect(Math.abs(profileBox!.height - explorerBox!.height)).toBeLessThan(2)
  }
})

test('the glass navigation indicator follows hover and returns to the active route', async ({ page }) => {
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' })
  const indicator = navigation.locator('.site-nav__indicator')
  const homeBox = await indicator.boundingBox()

  await navigation.getByRole('link', { name: 'Research' }).hover()
  await expect(navigation).toHaveAttribute('data-active-index', '0')
  await expect(navigation).toHaveAttribute('data-indicator-index', '2')
  await page.waitForTimeout(600)
  const researchHoverBox = await indicator.boundingBox()

  await page.locator('main').hover({ position: { x: 2, y: 2 } })
  await expect(navigation).toHaveAttribute('data-indicator-index', '0')
  await page.waitForTimeout(600)
  const returnedHomeBox = await indicator.boundingBox()

  await navigation.getByRole('link', { name: 'CV' }).click()
  await expect(page).toHaveURL(/\/cv\/?$/)
  await expect(navigation).toHaveAttribute('data-active-index', '1')
  await expect(navigation).toHaveAttribute('data-indicator-index', '1')
  await page.waitForTimeout(600)
  const cvBox = await indicator.boundingBox()

  expect(homeBox).not.toBeNull()
  expect(researchHoverBox).not.toBeNull()
  expect(returnedHomeBox).not.toBeNull()
  expect(cvBox).not.toBeNull()
  expect(researchHoverBox!.x).toBeGreaterThan(homeBox!.x)
  expect(Math.abs(returnedHomeBox!.x - homeBox!.x)).toBeLessThan(2)
  expect(cvBox!.x).toBeGreaterThan(homeBox!.x)
})

test('portrait is square and changes on the next full visit', async ({ page }) => {
  await page.goto('/')
  const portrait = page.locator('.portrait-frame img')
  const firstSource = await portrait.getAttribute('src')
  const box = await portrait.boundingBox()
  expect(box).not.toBeNull()
  expect(Math.abs((box?.width ?? 0) - (box?.height ?? 0))).toBeLessThan(2)

  await page.reload()
  await expect(page.locator('.portrait-frame img')).not.toHaveAttribute('src', firstSource ?? '')
})

test('primary pages have no detectable WCAG A or AA violations', async ({ page }) => {
  for (const path of ['/', '/cv/', '/research/', '/connect/']) {
    await page.goto(path)
    await page.evaluate(() => localStorage.setItem('jiazhou-theme', 'light'))
    await page.reload()
    const lightResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(lightResults.violations, `${path} light: ${lightResults.violations.map(({ id }) => id).join(', ')}`).toEqual([])

    await page.evaluate(() => localStorage.setItem('jiazhou-theme', 'dark'))
    await page.reload()
    const darkResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(darkResults.violations, `${path} dark: ${darkResults.violations.map(({ id }) => id).join(', ')}`).toEqual([])
  }
})

test('footer contains only the copyright line', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('.site-footer')
  await expect(footer).toHaveText('Jiazhou Chen · © 2026')
  await expect(footer.locator('span')).toHaveCount(1)
})
