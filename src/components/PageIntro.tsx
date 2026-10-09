import type { ReactNode } from 'react'

export function PageIntro({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="page-intro__copy">{children}</div>
      </div>
      {actions && <div className="page-intro__actions no-print">{actions}</div>}
    </header>
  )
}
