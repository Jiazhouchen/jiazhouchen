import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Globe2 } from 'lucide-react'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import world from 'world-atlas/land-110m.json'
import { content, type Experience, type ExperienceLocation } from '../content'

type Props = {
  selectedEventId: string
  onSelect: (eventId: string) => void
}

const width = 900
const height = 620
const focusedScale = 2.25
const initialFocusedPan = { x: -70, y: -410 }

function clampFocusedPan({ x, y }: { x: number; y: number }) {
  return {
    x: Math.min(width / 2, Math.max(width / 2 - width * focusedScale, x)),
    y: Math.min(height / 2, Math.max(height / 2 - height * focusedScale, y)),
  }
}

function newestExperienceAt(location: ExperienceLocation, experiences: Experience[]) {
  return experiences
    .filter((experience) => experience.locationId === location.id)
    .sort((a, b) => (
      (b.end === null ? '9999-12' : b.end).localeCompare(a.end === null ? '9999-12' : a.end)
      || (b.start ?? '').localeCompare(a.start ?? '')
    ))[0]
}

export function WorldExperienceMap({ selectedEventId, onSelect }: Props) {
  const { locations, experiences } = content.experiences
  const [viewMode, setViewMode] = useState<'focused' | 'whole'>('focused')
  const [pan, setPan] = useState(initialFocusedPan)
  const [isDragging, setIsDragging] = useState(false)
  const [isPointerFocused, setIsPointerFocused] = useState(false)
  const drag = useRef<{
    pointerId: number
    clientX: number
    clientY: number
    panX: number
    panY: number
    svgWidth: number
    svgHeight: number
    eventId?: string
  } | null>(null)
  const suppressClick = useRef(false)
  const previousSelectedEventId = useRef(selectedEventId)
  const selected = experiences.find(({ id }) => id === selectedEventId) ?? experiences[0]

  const geometry = useMemo(() => {
    const mappedLocationIds = new Set(experiences.map(({ locationId }) => locationId))
    const mappedLocations = locations.filter(({ id }) => mappedLocationIds.has(id))
    const focus = {
      type: 'MultiPoint' as const,
      coordinates: mappedLocations.map(({ longitude, latitude }) => [longitude, latitude] as [number, number]),
    }
    const projection = geoMercator()
      .fitExtent([[70, 55], [width - 70, height - 55]], focus)
    const topology = world as Topology
    const land = feature(topology, topology.objects.land)
    const path = geoPath(projection)

    const points = mappedLocations.map((location) => ({
      ...location,
      point: projection([location.longitude, location.latitude]) ?? [0, 0],
    }))

    const firstVisit = [...experiences].sort((a, b) => (
      (a.start ?? a.end ?? '0000-01').localeCompare(b.start ?? b.end ?? '0000-01')
    ))
    const visited = new Set<string>()
    const route = firstVisit
      .filter((event) => {
        if (visited.has(event.locationId)) return false
        visited.add(event.locationId)
        return true
      })
      .map((event) => points.find(({ id }) => id === event.locationId)?.point)
      .filter((point): point is [number, number] => Boolean(point))

    return {
      landPath: path(land),
      points,
      routePath: route.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
    }
  }, [experiences, locations])

  const centerOnExperience = useCallback((eventId: string) => {
    const experience = experiences.find(({ id }) => id === eventId)
    const location = geometry.points.find(({ id }) => id === experience?.locationId)
    if (!location) return
    const [x, y] = location.point
    setPan(clampFocusedPan({
      x: width / 2 - x * focusedScale,
      y: height / 2 - y * focusedScale,
    }))
  }, [experiences, geometry.points])

  useEffect(() => {
    const selectionChanged = previousSelectedEventId.current !== selectedEventId
    previousSelectedEventId.current = selectedEventId
    if (selectionChanged && viewMode === 'focused') centerOnExperience(selectedEventId)
  }, [centerOnExperience, selectedEventId, viewMode])

  const shownScale = viewMode === 'focused' ? focusedScale : 1
  const shownPan = viewMode === 'focused' ? pan : { x: 0, y: 0 }
  const mapTransform = `translate(${shownPan.x}px, ${shownPan.y}px) scale(${shownScale})`
  const toggleLabel = viewMode === 'focused' ? 'Show whole map' : 'Return to focused map view'

  const endDrag = (pointerEvent: ReactPointerEvent<SVGSVGElement>) => {
    if (drag.current?.pointerId !== pointerEvent.pointerId) return
    const eventId = drag.current.eventId
    const wasDragged = suppressClick.current
    if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
      pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId)
    }
    drag.current = null
    setIsDragging(false)
    if (eventId && !wasDragged) {
      centerOnExperience(eventId)
      onSelect(eventId)
    }
    window.setTimeout(() => { suppressClick.current = false }, 0)
  }

  return (
    <>
      <button
        className="map-view-toggle"
        type="button"
        aria-label={toggleLabel}
        aria-pressed={viewMode === 'whole'}
        title={toggleLabel}
        onClick={() => {
          drag.current = null
          setIsDragging(false)
          setViewMode((current) => current === 'focused' ? 'whole' : 'focused')
        }}
      >
        <Globe2 size={19} aria-hidden="true" />
      </button>
      <div className="map-wrap">
      <p className="visually-hidden" id="map-pan-help">
        In the focused view, drag the map or focus it and use the arrow keys to pan. The map scale is fixed.
      </p>
      <svg
        className={`experience-map ${viewMode === 'focused' ? 'is-pannable' : 'is-whole'} ${isDragging ? 'is-dragging' : ''} ${isPointerFocused ? 'is-pointer-focused' : ''}`}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        tabIndex={viewMode === 'focused' ? 0 : undefined}
        aria-label="Jiazhou Chen’s career experiences"
        aria-describedby="map-description map-pan-help"
        data-view-mode={viewMode}
        onBlur={() => setIsPointerFocused(false)}
        onPointerDown={(pointerEvent) => {
          if (viewMode !== 'focused' || pointerEvent.button !== 0) return
          setIsPointerFocused(true)
          const bounds = pointerEvent.currentTarget.getBoundingClientRect()
          const pin = (pointerEvent.target as Element).closest<SVGGElement>('[data-event-id]')
          drag.current = {
            pointerId: pointerEvent.pointerId,
            clientX: pointerEvent.clientX,
            clientY: pointerEvent.clientY,
            panX: pan.x,
            panY: pan.y,
            svgWidth: bounds.width,
            svgHeight: bounds.height,
            eventId: pin?.dataset.eventId,
          }
          suppressClick.current = false
          pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId)
          setIsDragging(true)
        }}
        onPointerMove={(pointerEvent) => {
          const currentDrag = drag.current
          if (!currentDrag || currentDrag.pointerId !== pointerEvent.pointerId) return
          const deltaX = (pointerEvent.clientX - currentDrag.clientX) * width / currentDrag.svgWidth
          const deltaY = (pointerEvent.clientY - currentDrag.clientY) * height / currentDrag.svgHeight
          if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) suppressClick.current = true
          setPan(clampFocusedPan({ x: currentDrag.panX + deltaX, y: currentDrag.panY + deltaY }))
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(keyboardEvent) => {
          if (viewMode !== 'focused' || keyboardEvent.target !== keyboardEvent.currentTarget) return
          const distance = 38
          const movement = {
            ArrowLeft: { x: -distance, y: 0 },
            ArrowRight: { x: distance, y: 0 },
            ArrowUp: { x: 0, y: -distance },
            ArrowDown: { x: 0, y: distance },
          }[keyboardEvent.key]
          if (keyboardEvent.key === 'Home') {
            keyboardEvent.preventDefault()
            setPan(initialFocusedPan)
          } else if (movement) {
            keyboardEvent.preventDefault()
            setPan((current) => clampFocusedPan({ x: current.x + movement.x, y: current.y + movement.y }))
          }
        }}
      >
        <desc id="map-description">A coastline-only map with fixed focused and whole-route views.</desc>
        <g className="experience-map__viewport" style={{ transform: mapTransform }}>
          <path className="experience-map__land" d={geometry.landPath ?? undefined} />
          <path className="experience-map__route" d={geometry.routePath} />
          {geometry.points.map((location, index) => {
            const [x, y] = location.point
            const isActive = selected?.locationId === location.id
            const event = newestExperienceAt(location, experiences)
            if (!event) return null

            return (
              <g
                className={`experience-map__pin experience-map__pin--${event.type} ${isActive ? 'is-active' : ''}`}
                key={location.id}
                data-location-id={location.id}
                data-event-id={event.id}
                style={{ '--pin-delay': `${340 + index * 75}ms` } as CSSProperties}
                onClick={() => {
                  if (viewMode !== 'whole') return
                  centerOnExperience(event.id)
                  setViewMode('focused')
                  onSelect(event.id)
                }}
              >
                <circle className="experience-map__target" cx={x} cy={y} r={24 / shownScale} />
                <circle className="experience-map__halo" cx={x} cy={y} r={(isActive ? 15 : 12) / shownScale} />
                <circle className="experience-map__dot" cx={x} cy={y} r={(isActive ? 8 : 6) / shownScale} />
              </g>
            )
          })}
        </g>
      </svg>
      </div>
    </>
  )
}
