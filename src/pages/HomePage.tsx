import { useEffect, useMemo, useState } from 'react'
import { List, MapPin, X } from 'lucide-react'
import { content } from '../content'
import { WorldExperienceMap } from '../components/WorldExperienceMap'
import { getPortraitForVisit, portraits } from '../utils/portraits'
import { usePageMeta } from '../utils/pageMeta'

export function HomePage() {
  usePageMeta({
    title: 'Jiazhou Chen',
    description: 'Jiazhou Chen is a computational neuroscientist studying decision-making, emotion, and mental health.',
    path: '/',
  })

  const experiences = useMemo(() => {
    const typePriority = { education: 0, research: 1, home: 2 }
    return [...content.experiences.experiences].sort((a, b) => (
      (b.end === null ? '9999-12' : b.end).localeCompare(a.end === null ? '9999-12' : a.end)
      || (b.start ?? '').localeCompare(a.start ?? '')
      || typePriority[a.type] - typePriority[b.type]
    ))
  }, [])
  const [selectedId, setSelectedId] = useState(experiences[0]?.id ?? '')
  const [timelineOpen, setTimelineOpen] = useState(false)
  const selected = experiences.find(({ id }) => id === selectedId) ?? experiences[0]
  const selectedLocation = content.experiences.locations.find(({ id }) => id === selected?.locationId)
  const selectedHeading = selected?.degree ?? selected?.position ?? selected?.label
  const portrait = getPortraitForVisit()
  const [displayedPortrait, setDisplayedPortrait] = useState(portrait)
  const [isPortraitShuffling, setIsPortraitShuffling] = useState(false)

  useEffect(() => {
    if (!portrait || portraits.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedPortrait(portrait)
      return
    }

    const candidates = portraits.filter(({ key, rare }) => key !== portrait.key && (!rare || portrait.rare))
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]]
    }
    const frames = candidates.slice(0, 6)
    if (frames.length === 0) {
      setDisplayedPortrait(portrait)
      return
    }
    const frameDuration = Math.max(90, Math.floor(720 / (frames.length + 1)))
    let frame = 0
    let timer = 0

    setIsPortraitShuffling(true)
    const showNext = () => {
      if (frame < frames.length) {
        setDisplayedPortrait(frames[frame])
        frame += 1
        timer = window.setTimeout(showNext, frameDuration)
      } else {
        setDisplayedPortrait(portrait)
        setIsPortraitShuffling(false)
      }
    }
    timer = window.setTimeout(showNext, 60)

    return () => window.clearTimeout(timer)
  }, [portrait])

  return (
    <div className="page home-page">
      <section className="home-profile card card--profile" aria-labelledby="profile-name">
        <div className={`portrait-frame ${isPortraitShuffling ? 'is-shuffling' : ''}`}>
          {displayedPortrait ? (
            <img key={displayedPortrait.key} src={displayedPortrait.url} alt="Jiazhou Chen" width="700" height="700" fetchPriority="high" />
          ) : (
            <div className="portrait-fallback" role="img" aria-label="Jiazhou Chen">{content.profile.shortName}</div>
          )}
        </div>
        <h1 id="profile-name">{content.profile.name}</h1>
        <p className="profile-role">{content.profile.role}</p>
        <p className="profile-unit">{content.profile.unit}<br />{content.profile.organization}</p>
        <p className="location-line"><MapPin size={18} aria-hidden="true" /> {content.profile.location}</p>
      </section>

      <section className="experience-panel" id="experiences" aria-label="Career experiences">
        <div className="card experience-explorer">
          <WorldExperienceMap selectedEventId={selected?.id ?? ''} onSelect={setSelectedId} />

          <button
            className="timeline-toggle"
            type="button"
            aria-controls="experience-timeline"
            aria-expanded={timelineOpen}
            aria-label={timelineOpen ? 'Hide experience timeline' : 'Show experience timeline'}
            title={timelineOpen ? 'Hide timeline' : 'Show timeline'}
            onClick={() => setTimelineOpen((open) => !open)}
          >
            {timelineOpen ? <X size={19} aria-hidden="true" /> : <List size={19} aria-hidden="true" />}
          </button>

          {selected && selectedLocation && (
            <article
              key={selected.id}
              id="experience-detail"
              className={`experience-detail experience-detail--${selected.type}`}
              aria-live="polite"
            >
              <div>
                {selected.dateLabel && <p className="eyebrow">{selected.dateLabel}</p>}
                <h3>{selectedHeading}</h3>
                {selected.department && <p className="experience-detail__department">{selected.department}</p>}
                <p className="experience-detail__institution">
                  {selected.institution ? `${selected.institution}, ` : ''}{selectedLocation.name}, {selectedLocation.region}
                </p>
              </div>
            </article>
          )}

          <aside
            className={`timeline-wrap ${timelineOpen ? 'is-open' : ''}`}
            id="experience-timeline"
            aria-label="Career timeline"
          >
            <ol className="timeline">
              {experiences.map((event) => {
                const location = content.experiences.locations.find(({ id }) => id === event.locationId)
                const active = event.id === selected?.id
                const title = event.degree ?? event.position ?? event.label
                return (
                  <li key={event.id}>
                    <button
                      className={`timeline-item timeline-item--${event.type} ${active ? 'is-active' : ''}`}
                      type="button"
                      aria-controls="experience-detail"
                      aria-expanded={active}
                      aria-pressed={active}
                      onClick={() => {
                        setSelectedId(event.id)
                        setTimelineOpen(false)
                      }}
                    >
                      <span className="timeline-item__marker" aria-hidden="true" />
                      <span className="timeline-item__copy">
                        {event.dateLabel && <span className="timeline-item__date">{event.dateLabel}</span>}
                        <span className="timeline-item__line timeline-item__title"><strong>{title}</strong></span>
                        {event.institution && <span className="timeline-item__line timeline-item__institution">{event.institution}</span>}
                        {location && <span className="timeline-item__line timeline-item__location">{location.name}, {location.region}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </aside>
        </div>
      </section>
    </div>
  )
}
