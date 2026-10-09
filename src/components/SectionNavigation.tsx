import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

type SectionLink = {
  id: string
  label: string
}

export function SectionNavigation({ sections, label, className = '' }: {
  sections: SectionLink[]
  label: string
  className?: string
}) {
  const navigationRef = useRef<HTMLElement>(null)
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>())
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isPinned, setIsPinned] = useState(false)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const displayedId = hoveredId ?? activeId

  const positionIndicator = useCallback(() => {
    const link = linkRefs.current.get(displayedId)
    if (link) setIndicator({ left: link.offsetLeft, width: link.offsetWidth })
  }, [displayedId])

  useLayoutEffect(positionIndicator, [positionIndicator, sections])

  useEffect(() => {
    const updateActiveSection = () => {
      const stickyOffset = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-current-height')) || 74
      const navigationTop = navigationRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      setIsPinned(window.scrollY > 0 && navigationTop <= stickyOffset + 1)
      const threshold = stickyOffset + (navigationRef.current?.offsetHeight ?? 0) + 24
      let current = sections[0]?.id ?? ''

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= threshold) current = section.id
      }
      setActiveId(current)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [sections])

  useEffect(() => {
    const navigation = navigationRef.current
    const activeLink = linkRefs.current.get(activeId)
    if (!navigation || !activeLink) return

    const linkCenter = activeLink.offsetLeft + activeLink.offsetWidth / 2
    navigation.scrollTo({
      left: Math.max(0, linkCenter - navigation.clientWidth / 2),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [activeId])

  useEffect(() => {
    const navigation = navigationRef.current
    if (!navigation) return
    const resizeObserver = new ResizeObserver(positionIndicator)
    resizeObserver.observe(navigation)
    return () => resizeObserver.disconnect()
  }, [positionIndicator])

  return (
    <nav
      ref={navigationRef}
      className={`section-nav no-print ${isPinned ? 'is-pinned' : ''} ${className}`.trim()}
      aria-label={label}
      data-pinned={isPinned}
      onPointerLeave={() => setHoveredId(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoveredId(null)
      }}
    >
      <span
        className="section-nav__indicator"
        aria-hidden="true"
        style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
      />
      {sections.map(({ id, label: sectionLabel }) => (
        <a
          ref={(element) => {
            if (element) linkRefs.current.set(id, element)
            else linkRefs.current.delete(id)
          }}
          className={activeId === id ? 'is-active' : undefined}
          href={`#${id}`}
          aria-current={activeId === id ? 'location' : undefined}
          key={id}
          onClick={() => setActiveId(id)}
          onPointerEnter={() => setHoveredId(id)}
          onFocus={() => setHoveredId(id)}
        >
          {sectionLabel}
        </a>
      ))}
    </nav>
  )
}
