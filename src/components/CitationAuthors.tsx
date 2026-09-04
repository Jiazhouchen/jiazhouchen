import { Fragment } from 'react'

type CitationAuthor = {
  name: string
  highlight: boolean
  equalContribution?: boolean
}

export function CitationAuthors({ authors }: { authors: CitationAuthor[] }) {
  return authors.map((author, index) => {
    const last = index === authors.length - 1
    const separator = index === 0 ? '' : last ? (authors.length === 2 ? ' & ' : ', & ') : ', '

    return (
      <Fragment key={`${index}-${author.name}`}>
        {separator}
        {author.highlight ? <strong>{author.name}</strong> : author.name}
        {author.equalContribution && <sup aria-label="equal contribution">*</sup>}
      </Fragment>
    )
  })
}
