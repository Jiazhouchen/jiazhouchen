import { BookOpen, Github, GraduationCap, Mail } from 'lucide-react'
import { content } from '../content'

const icons = {
  github: Github,
  scholar: GraduationCap,
  researchgate: BookOpen,
} as const

export function ContactButtonRow() {
  return (
    <div className="contact-button-row" aria-label="Contact links">
      <a className="contact-button" href={`mailto:${content.contact.email}`} title="Send an email">
        <Mail size={20} aria-hidden="true" />
        <span>Email</span>
      </a>
      {content.contact.profiles.map((profile) => {
        const Icon = icons[profile.id as keyof typeof icons] ?? BookOpen
        return (
          <a
            className="contact-button"
            href={profile.url}
            target="_blank"
            rel="noreferrer"
            title={profile.description}
            key={profile.id}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{profile.label}</span>
          </a>
        )
      })}
    </div>
  )
}
