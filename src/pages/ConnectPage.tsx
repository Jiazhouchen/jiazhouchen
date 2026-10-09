import { ContactButtonRow } from '../components/ContactButtonRow'
import { content } from '../content'
import { usePageMeta } from '../utils/pageMeta'
import { getVisiblePosts } from '../utils/posts'

export function ConnectPage() {
  usePageMeta({
    title: 'Connect · Jiazhou Chen',
    description: 'Contact Jiazhou Chen.',
    path: '/connect/',
  })

  const visiblePosts = getVisiblePosts(content.posts)

  return (
    <div className="page connect-page">
      <h1 className="visually-hidden">Connect</h1>

      <div className="connect-document">
        <section className="connect-section" id="contact-information" aria-labelledby="contact-information-heading">
          <h2 id="contact-information-heading">Contact Information</h2>
          <ContactButtonRow />
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
