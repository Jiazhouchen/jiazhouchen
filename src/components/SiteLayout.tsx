import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { content } from '../content'
import { getLiveDocPath } from '../utils/liveDocs'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/cv', label: 'CV', end: false },
  { to: '/research', label: 'Research', end: false },
  { to: '/connect', label: 'Connect', end: false },
]

export function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const headerRef = useRef<HTMLElement>(null)
  const cvBrandClickCountRef = useRef(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const liveDoc = content.liveDocs.find((entry) => getLiveDocPath(entry) === normalizedPathname)
  const activeIndex = liveDoc
    ? links.length
    : pathname.startsWith('/cv')
      ? 1
      : pathname.startsWith('/research')
        ? 2
        : pathname.startsWith('/connect')
          ? 3
          : 0
  const indicatorIndex = hoveredIndex ?? activeIndex

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    cvBrandClickCountRef.current = 0
  }, [pathname])

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!pathname.startsWith('/cv')) return

    event.preventDefault()
    cvBrandClickCountRef.current += 1
    if (cvBrandClickCountRef.current >= 10) {
      cvBrandClickCountRef.current = 0
      window.dispatchEvent(new Event('open-private-cv-print'))
    }
  }

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const updateHeight = () => document.documentElement.style.setProperty('--site-header-current-height', `${header.offsetHeight}px`)
    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(header)
    updateHeight()
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className={liveDoc ? 'site-shell site-shell--live-doc' : 'site-shell'}>
      <header ref={headerRef} className="site-header no-print">
        <NavLink className="site-brand" to="/" aria-label="Jiazhou Chen, home" onClick={handleBrandClick}>
          Jiazhou Chen
        </NavLink>
        <nav
          className={liveDoc ? 'site-nav site-nav--live-doc' : 'site-nav'}
          aria-label="Primary navigation"
          data-active-index={activeIndex ?? undefined}
          data-indicator-index={indicatorIndex ?? undefined}
          style={liveDoc ? { '--live-doc-vendor-color': liveDoc.vendor_color } as CSSProperties : undefined}
          onPointerLeave={() => setHoveredIndex(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoveredIndex(null)
          }}
        >
          {indicatorIndex === null ? null : <span className="site-nav__indicator" aria-hidden="true" />}
          {links.map(({ to, label, end }, index) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? 'site-nav__link is-active' : 'site-nav__link'}
              onPointerEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
            >
              {label}
            </NavLink>
          ))}
          {liveDoc ? (
            <span
              className="site-nav__link site-nav__vendor is-active"
              aria-current="page"
              onPointerEnter={() => setHoveredIndex(links.length)}
            >
              {liveDoc.vendor}
            </span>
          ) : null}
        </nav>
        <ThemeToggle />
      </header>

      <main id="main-content">{children}</main>

      <footer className="site-footer no-print">
        <span>Jiazhou Chen · © 2026</span>
      </footer>
    </div>
  )
}
