import type { Content } from '../content'

type Post = Content['posts'][number]

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getVisiblePosts(posts: Post[], today = new Date()) {
  const currentDate = localIsoDate(today)
  return posts
    .filter(({ expiresAt }) => expiresAt === null || expiresAt >= currentDate)
    .sort((a, b) => b.date.localeCompare(a.date))
}
