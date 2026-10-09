import { useEffect, useRef, useState, type FormEvent } from 'react'
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

type PrivatePrintContact = {
  email: string
  phone: string
  address: string
}

export function CvPage() {
  const printDialogRef = useRef<HTMLDialogElement>(null)
  const [privatePrintContact, setPrivatePrintContact] = useState<PrivatePrintContact | null>(null)

  usePageMeta({
    title: 'Curriculum Vitae · Jiazhou Chen',
    description: 'Education, research, publications, presentations, and skills.',
    path: '/cv/',
    noIndex: true,
  })

  useEffect(() => {
    const openPrivatePrintDialog = () => {
      if (!printDialogRef.current?.open) printDialogRef.current?.showModal()
    }
    const clearPrivatePrintContact = () => setPrivatePrintContact(null)

    window.addEventListener('open-private-cv-print', openPrivatePrintDialog)
    window.addEventListener('afterprint', clearPrivatePrintContact)
    return () => {
      window.removeEventListener('open-private-cv-print', openPrivatePrintDialog)
      window.removeEventListener('afterprint', clearPrivatePrintContact)
    }
  }, [])

  const printCv = (contact: PrivatePrintContact | null) => {
    setPrivatePrintContact(contact)
    window.setTimeout(() => window.print(), 0)
  }

  const printWithPrivateContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const contact = {
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      address: String(formData.get('address') ?? '').trim(),
    }

    printDialogRef.current?.close()
    form.reset()
    printCv(contact)
  }

  const privateContactLine = privatePrintContact
    ? [privatePrintContact.email, privatePrintContact.phone, privatePrintContact.address].filter(Boolean).join(' · ')
    : ''

  return (
    <div className="page cv-page">
      <header className="cv-toolbar">
        <h1>Curriculum Vitae</h1>
        <div className="cv-toolbar__actions no-print">
          <button className="button" type="button" onClick={() => printCv(null)}>
            <Printer size={18} aria-hidden="true" /> Print CV
          </button>
        </div>
      </header>

      <dialog
        className="private-print-dialog no-print"
        ref={printDialogRef}
        aria-labelledby="private-print-title"
        onClose={(event) => event.currentTarget.querySelector('form')?.reset()}
      >
        <form className="private-print-dialog__form" onSubmit={printWithPrivateContact}>
          <header>
            <p className="eyebrow">Private print details</p>
            <h2 id="private-print-title">Add contact information</h2>
            <p>These details are used only for this print and are not saved.</p>
          </header>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Current address
            <input name="address" type="text" autoComplete="street-address" />
          </label>
          <div className="private-print-dialog__actions">
            <button className="button" type="button" onClick={() => printDialogRef.current?.close()}>Cancel</button>
            <button className="button button--primary" type="submit">
              <Printer size={18} aria-hidden="true" /> Print
            </button>
          </div>
        </form>
      </dialog>

      <SectionNavigation sections={cvSections} label="Curriculum Vitae sections" className="cv-section-nav" />

      <div className="cv-document">
        <header className="cv-print-identity print-only">
          <h2>Jiazhou Chen</h2>
          {privateContactLine && <p>{privateContactLine}</p>}
        </header>

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
                <div className="cv-subentry" key={`${group.lab ?? group.department}-${group.location}`}>
                  {group.lab && <p className="cv-entry__lead">{group.lab} <span>({group.leadership})</span></p>}
                  <p className="cv-entry__department">
                    {group.department && <>{group.department}, </>}
                    {!group.lab && <><span>{group.leadership}</span>, </>}
                    {group.institution}, {group.location}
                  </p>
                </div>
              ))}
            </article>
          ))}
        </section>

        <section className="cv-section" id="publications" aria-labelledby="publications-heading">
          <h2 id="publications-heading">Publications</h2>
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
