import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/cv', label: 'CV', end: false },
  { to: '/research', label: 'Research', end: false },
  { to: '/connect', label: 'Connect', end: false },
]

export function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const cvBrandClickCountRef = useRef(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const activeIndex = pathname.startsWith('/cv')
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
    <div className="site-shell">
      <header ref={headerRef} className="site-header no-print">
        <NavLink className="site-brand" to="/" aria-label="Jiazhou Chen, home" onClick={handleBrandClick}>
          Jiazhou Chen
        </NavLink>
        <nav
          className="site-nav"
          aria-label="Primary navigation"
          data-active-index={activeIndex}
          data-indicator-index={indicatorIndex}
          onPointerLeave={() => setHoveredIndex(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoveredIndex(null)
          }}
        >
          <span className="site-nav__indicator" aria-hidden="true" />
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
