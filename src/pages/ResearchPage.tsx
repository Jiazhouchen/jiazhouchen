import { CitationAuthors } from '../components/CitationAuthors'
import { PublicationItem } from '../components/PublicationItem'
import { SectionNavigation } from '../components/SectionNavigation'
import { content, type Presentation, type Publication } from '../content'
import { usePageMeta } from '../utils/pageMeta'

const publicationTypeLabels: Record<Publication['type'], string> = {
  article: 'Article',
  review: 'Review',
  'conference-proceedings': 'Conference proceedings',
  preprint: 'Preprint',
}

function PublicationDetails({ publication }: { publication: Publication }) {
  return (
    <details className="research-output">
      <summary>
        <span className="research-output__meta">{publicationTypeLabels[publication.type]} · {publication.year}</span>
        <span className="research-output__title">{publication.title}</span>
        <span className="research-output__toggle" aria-hidden="true">+</span>
      </summary>
      <div className="research-output__body">
        <p className="research-output__description">{publication.description}</p>
        <PublicationItem publication={publication} />
      </div>
    </details>
  )
}

function PresentationDetails({ presentation }: { presentation: Presentation }) {
  return (
    <details className="research-output">
      <summary>
        <span className="research-output__meta">{presentation.format} · {presentation.dateLabel}</span>
        <span className="research-output__title">{presentation.title}</span>
        <span className="research-output__toggle" aria-hidden="true">+</span>
      </summary>
      <div className="research-output__body">
        <p className="research-output__description">{presentation.description}</p>
        <p className="citation">
          <CitationAuthors authors={presentation.authors} />. {presentation.title}. {presentation.format} at the{' '}
          <em>{presentation.venue}</em> ({presentation.dateLabel}), {presentation.location}.
        </p>
      </div>
    </details>
  )
}

export function ResearchPage() {
  usePageMeta({
    title: 'Research · Jiazhou Chen',
    description: 'Research on emotion, affective dynamics, learning, decision-making, metacognition, and metareasoning.',
    path: '/research/',
  })

  const researchSections = content.researchAreas.map(({ id, navLabel }) => ({ id, label: navLabel }))

  return (
    <div className="page research-page">
      <header className="research-toolbar">
        <h1>Research</h1>
      </header>

      <SectionNavigation sections={researchSections} label="Research sections" className="research-section-nav" />

      <div className="research-document">
        {content.researchAreas.map((area) => {
          const publications = content.publications.filter(({ researchAreaIds }) => researchAreaIds.includes(area.id))
          const presentations = content.presentations.filter(({ researchAreaIds }) => researchAreaIds.includes(area.id))

          return (
            <section className="research-section" id={area.id} aria-labelledby={`${area.id}-heading`} key={area.id}>
              <h2 id={`${area.id}-heading`}>{area.title}</h2>
              <p className="research-section__intro">{area.description}</p>

              {publications.length > 0 && (
                <div className="research-output-group">
                  <h3>Publications</h3>
                  {publications.map((publication) => <PublicationDetails publication={publication} key={publication.id} />)}
                </div>
              )}

              {presentations.length > 0 && (
                <div className="research-output-group">
                  <h3>Posters & Presentations</h3>
                  {presentations.map((presentation) => <PresentationDetails presentation={presentation} key={presentation.id} />)}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
