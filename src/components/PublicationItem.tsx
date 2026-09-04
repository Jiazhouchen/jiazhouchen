import { ExternalLink } from 'lucide-react'
import type { Publication } from '../content'
import { CitationAuthors } from './CitationAuthors'

export function PublicationItem({ publication, compact = false }: { publication: Publication; compact?: boolean }) {
  const details = [
    publication.volume ? `${publication.volume}${publication.issue ? `(${publication.issue})` : ''}` : null,
    publication.pages,
  ].filter(Boolean).join(', ')

  return (
    <article className={compact ? 'output-item output-item--compact' : 'output-item'} id={`publication-${publication.id}`}>
      <p className="citation">
        <CitationAuthors authors={publication.authors} /> ({publication.year}). {publication.title}.{' '}
        <em>{publication.venue}</em>{details ? `, ${details}` : ''}.{publication.status ? ` ${publication.status}.` : ''}
      </p>
      {!compact && (publication.doi || publication.pmid || publication.pmcid) && (
        <div className="citation-links no-print">
          {publication.doi && (
            <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noreferrer">
              DOI <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
          {publication.pmid && (
            <a href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}/`} target="_blank" rel="noreferrer">PMID</a>
          )}
          {publication.pmcid && (
            <a href={`https://pmc.ncbi.nlm.nih.gov/articles/${publication.pmcid}/`} target="_blank" rel="noreferrer">PMCID</a>
          )}
        </div>
      )}
    </article>
  )
}
