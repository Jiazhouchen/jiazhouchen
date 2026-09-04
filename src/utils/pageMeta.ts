import { useEffect } from 'react'

const SITE_URL = 'https://jiazhouchen.com'

type PageMeta = {
  title: string
  description: string
  path: string
  noIndex?: boolean
}

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    const propertyMatch = selector.match(/meta\[property="(.+)"\]/)
    const nameMatch = selector.match(/meta\[name="(.+)"\]/)
    if (propertyMatch) element.setAttribute('property', propertyMatch[1])
    if (nameMatch) element.setAttribute('name', nameMatch[1])
    document.head.append(element)
  }
  element.setAttribute(attribute, value)
}

export function usePageMeta({ title, description, path, noIndex = false }: PageMeta) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`
    document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl)
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl
  }, [description, noIndex, path, title])
}
