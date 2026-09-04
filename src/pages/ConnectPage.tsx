import { BookOpen, Github, GraduationCap, Mail } from 'lucide-react'
import { content } from '../content'
import { usePageMeta } from '../utils/pageMeta'
import { getVisiblePosts } from '../utils/posts'

const icons = {
  github: Github,
  scholar: GraduationCap,
  researchgate: BookOpen,
} as const

export function ConnectPage() {
  usePageMeta({
    title: 'Connect · Jiazhou Chen',
    description: 'Contact Jiazhou Chen and read current research and hiring posts.',
    path: '/connect/',
  })

  const visiblePosts = getVisiblePosts(content.posts)

  return (
    <div className="page connect-page">
      <h1 className="visually-hidden">Connect</h1>

      <div className="connect-document">
        <section className="connect-section" id="contact-information" aria-labelledby="contact-information-heading">
          <h2 id="contact-information-heading">Contact Information</h2>
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
        </section>

        <section className="connect-section" id="news" aria-labelledby="news-heading">
          <h2 id="news-heading">News</h2>
          <div className="post-feed" role="region" tabIndex={0} aria-label="Current news">
            {visiblePosts.length > 0 ? visiblePosts.map((post) => (
              <article className="post-entry" key={post.id}>
                <time dateTime={post.date}>{post.dateLabel}</time>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
              </article>
            )) : <p className="post-feed__empty">There are no current posts.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
