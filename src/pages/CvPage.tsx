import { Printer } from 'lucide-react'
import { content } from '../content'
import { CitationAuthors } from '../components/CitationAuthors'
import { PublicationItem } from '../components/PublicationItem'
import { SectionNavigation } from '../components/SectionNavigation'
import { usePageMeta } from '../utils/pageMeta'

const cvSections = [
  { id: 'education', label: 'Education' },
  { id: 'research', label: 'Research' },
  { id: 'publications', label: 'Publications' },
  { id: 'presentations', label: 'Presentations' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'awards', label: 'Awards and Funds' },
  { id: 'skills', label: 'Skills' },
  { id: 'additional', label: 'Additional' },
]

export function CvPage() {
  usePageMeta({
    title: 'Curriculum Vitae · Jiazhou Chen',
    description: 'Education, research, publications, presentations, and skills of computational neuroscientist Jiazhou Chen.',
    path: '/cv/',
    noIndex: true,
  })

  return (
    <div className="page cv-page">
      <header className="cv-toolbar">
        <h1>Curriculum Vitae</h1>
        <div className="cv-toolbar__actions no-print">
          <button className="button" type="button" onClick={() => window.print()}>
            <Printer size={18} aria-hidden="true" /> Print CV
          </button>
        </div>
      </header>

      <SectionNavigation sections={cvSections} label="Curriculum Vitae sections" className="cv-section-nav" />

      <div className="cv-document">
        <section className="cv-section" id="education" aria-labelledby="education-heading">
          <h2 id="education-heading">Education</h2>
          {content.education.map((entry) => (
            <article className="cv-entry" key={entry.id}>
              <div className="cv-entry__heading">
                <h3>{entry.degree}</h3>
                <span>{entry.dateLabel}</span>
              </div>
              {entry.program && <p className="cv-entry__lead">{entry.program}</p>}
              {entry.advisors.length > 0 && <p>Supervised by {entry.advisors.join(', ')}</p>}
              {entry.institutions.map((institution) => (
                <p key={institution.name}>{institution.name}, {institution.location}</p>
              ))}
            </article>
          ))}
        </section>

        <section className="cv-section" id="research" aria-labelledby="research-heading">
          <h2 id="research-heading">Research Experience</h2>
          {content.research.map((entry) => (
            <article className="cv-entry" key={entry.id}>
              <div className="cv-entry__heading">
                <h3>{entry.role}</h3>
                <span>{entry.dateLabel}</span>
              </div>
              {entry.groups.map((group) => (
                <div className="cv-subentry" key={group.name}>
                  <p className="cv-entry__lead">{group.name} <span>({group.leadership})</span></p>
                  <p>{group.organization}, {group.location}</p>
                </div>
              ))}
            </article>
          ))}
        </section>

        <section className="cv-section" id="publications" aria-labelledby="publications-heading">
          <h2 id="publications-heading">Publications</h2>
          <p className="equal-contribution"><strong><sup>*</sup> Equal contribution</strong></p>
          <div className="output-list">
            {content.publications.map((publication) => <PublicationItem publication={publication} key={publication.id} />)}
          </div>
        </section>

        <section className="cv-section" id="presentations" aria-labelledby="presentations-heading">
          <h2 id="presentations-heading">Posters & Presentations</h2>
          <div className="output-list">
            {content.presentations.map((presentation) => (
              <article className="output-item" id={`presentation-${presentation.id}`} key={presentation.id}>
                <p className="citation">
                  <CitationAuthors authors={presentation.authors} />. {presentation.title}. {presentation.format} at the{' '}
                  <em>{presentation.venue}</em> ({presentation.dateLabel}), {presentation.location}.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="cv-section" id="teaching" aria-labelledby="teaching-heading">
          <h2 id="teaching-heading">Teaching Experience</h2>
          {content.teaching.map((entry) => (
            <article className="cv-entry" key={entry.id}>
              <div className="cv-entry__heading">
                <h3>{entry.role}</h3>
                {entry.dateLabel && <span>{entry.dateLabel}</span>}
              </div>
              <p>{entry.institution}, {entry.location}</p>
            </article>
          ))}
        </section>

        <section className="cv-section" id="awards" aria-labelledby="awards-heading">
          <h2 id="awards-heading">Awards and Funds</h2>
          {content.awards.map((award) => (
            <article className="award-entry" key={award.id}>
              <div className="award-entry__heading">
                <h3>{award.description}</h3>
                <span>{award.amount}</span>
                <time dateTime={String(award.yearAwarded)}>{award.yearAwarded}</time>
              </div>
              <p>{award.awardingAgency}</p>
            </article>
          ))}
        </section>

        <section className="cv-section" id="skills" aria-labelledby="skills-heading">
          <h2 id="skills-heading">Skills</h2>
          <div className="skill-groups">
            {content.skills.map((group) => (
              <article key={group.id}>
                <h3>{group.label}</h3>
                <p>{group.items.join(' · ')}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cv-section" id="additional" aria-labelledby="additional-heading">
          <h2 id="additional-heading">Additional Information</h2>
          <dl className="additional-list">
            {content.additional.map((item) => (
              <div key={item.id}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
