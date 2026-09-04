import { Mail } from 'lucide-react'
import { content } from '../content'

export function EmailButton({ className = '' }: { className?: string }) {
  return (
    <a className={`button button--primary email-button ${className}`.trim()} href={`mailto:${content.contact.email}`}>
      <Mail size={18} aria-hidden="true" />
      Email me
    </a>
  )
}
