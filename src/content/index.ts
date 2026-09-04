import { z } from 'zod'

import additionalJson from './additional.json'
import awardsJson from './awards.json'
import contactJson from './contact.json'
import educationJson from './education.json'
import locationsJson from './locations.json'
import postJson from './post.json'
import profileJson from './profile.json'
import publicationsJson from './publications.json'
import researchAreasJson from './researchAreas.json'
import researchJson from './research.json'
import skillsJson from './skills.json'
import teachingJson from './teaching.json'
import presentationsJson from './presentations.json'

const id = z.string().min(1).regex(/^[a-z0-9-]+$/, 'Use lowercase kebab-case IDs')
const date = z.string().regex(/^\d{4}-\d{2}$/, 'Use an ISO year-month such as 2025-07')
const optionalDate = date.nullable()
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO date such as 2026-09-04')

const profileSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  role: z.string().min(1),
  unit: z.string().min(1),
  organization: z.string().min(1),
  branch: z.string().min(1),
  location: z.string().min(1),
  origin: z.object({
    locationId: id,
    end: date,
  }),
  intro: z.string().min(1),
})

const contactSchema = z.object({
  email: z.string().email(),
  profiles: z.array(z.object({
    id,
    label: z.string().min(1),
    url: z.string().url(),
    description: z.string().min(1),
  })).min(1),
})

const postsSchema = z.array(z.object({
  id,
  title: z.string().min(1),
  date: calendarDate,
  dateLabel: z.string().min(1),
  expiresAt: calendarDate.nullable(),
  body: z.string().min(1),
})).superRefine((posts, context) => {
  posts.forEach((post, index) => {
    if (post.expiresAt && post.expiresAt < post.date) {
      context.addIssue({
        code: 'custom',
        path: [index, 'expiresAt'],
        message: 'Expiration date cannot be earlier than the post date',
      })
    }
  })
})

const educationSchema = z.array(z.object({
  id,
  degree: z.string().min(1),
  program: z.string().min(1).nullable(),
  start: date,
  end: date.nullable(),
  dateLabel: z.string().min(1),
  experience: z.object({
    locationId: id,
    department: z.string().min(1),
    institutionIndex: z.number().int().nonnegative(),
  }),
  advisors: z.array(z.string().min(1)),
  institutions: z.array(z.object({
    name: z.string().min(1),
    location: z.string().min(1),
  })).min(1),
}))

const researchSchema = z.array(z.object({
  id,
  role: z.string().min(1),
  start: date,
  end: date.nullable(),
  dateLabel: z.string().min(1),
  experience: z.object({
    locationId: id,
    department: z.string().min(1),
    institution: z.string().min(1),
  }),
  groups: z.array(z.object({
    name: z.string().min(1),
    leadership: z.string().min(1),
    organization: z.string().min(1),
    location: z.string().min(1),
  })).min(1),
}))

const teachingSchema = z.array(z.object({
  id,
  role: z.string().min(1),
  institution: z.string().min(1),
  location: z.string().min(1),
  start: optionalDate,
  end: optionalDate,
  dateLabel: z.string().min(1).nullable(),
}))

const citationAuthorSchema = z.object({
  name: z.string().min(1),
  highlight: z.boolean(),
})

const authorSchema = citationAuthorSchema.extend({
  equalContribution: z.boolean(),
})

const publicationsSchema = z.array(z.object({
  id,
  authors: z.array(authorSchema).min(1),
  year: z.number().int().min(1900).max(2200),
  type: z.enum(['article', 'review', 'conference-proceedings', 'preprint']),
  title: z.string().min(1),
  researchAreaIds: z.array(id).min(1),
  description: z.string().min(1),
  venue: z.string().min(1),
  status: z.string().min(1).nullable(),
  volume: z.string().min(1).nullable(),
  issue: z.string().min(1).nullable(),
  pages: z.string().min(1).nullable(),
  doi: z.string().min(1).nullable(),
  pmid: z.string().min(1).nullable(),
  pmcid: z.string().min(1).nullable(),
}))

const presentationsSchema = z.array(z.object({
  id,
  authors: z.array(citationAuthorSchema).min(1),
  title: z.string().min(1),
  researchAreaIds: z.array(id).min(1),
  description: z.string().min(1),
  format: z.string().min(1),
  venue: z.string().min(1),
  date,
  dateLabel: z.string().min(1),
  location: z.string().min(1),
}))

const skillsSchema = z.array(z.object({
  id,
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
}))

const additionalSchema = z.array(z.object({
  id,
  label: z.string().min(1),
  value: z.string().min(1),
}))

const awardsSchema = z.array(z.object({
  id,
  description: z.string().min(1),
  amount: z.string().min(1),
  yearAwarded: z.number().int().min(1900).max(2200),
  awardingAgency: z.string().min(1),
}))

const locationSchema = z.object({
  id,
  name: z.string().min(1),
  region: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

const researchAreasSchema = z.array(z.object({
  id,
  title: z.string().min(1),
  navLabel: z.string().min(1),
  description: z.string().min(1),
}))

function parse<T>(label: string, schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${label}.${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid content:\n${details}`)
  }
  return result.data
}

function ensureUnique(label: string, values: Array<{ id: string }>) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value.id)) throw new Error(`Invalid content: duplicate ${label} id "${value.id}"`)
    seen.add(value.id)
  }
}

function ensureReferences(label: string, refs: string[], known: Set<string>) {
  for (const ref of refs) {
    if (!known.has(ref)) throw new Error(`Invalid content: ${label} references unknown id "${ref}"`)
  }
}

export function validateAllContent() {
  const profile = parse('profile', profileSchema, profileJson)
  const contact = parse('contact', contactSchema, contactJson)
  const posts = parse('post', postsSchema, postJson)
  const education = parse('education', educationSchema, educationJson)
  const research = parse('research', researchSchema, researchJson)
  const teaching = parse('teaching', teachingSchema, teachingJson)
  const publications = parse('publications', publicationsSchema, publicationsJson)
  const presentations = parse('presentations', presentationsSchema, presentationsJson)
  const skills = parse('skills', skillsSchema, skillsJson)
  const additional = parse('additional', additionalSchema, additionalJson)
  const awards = parse('awards', awardsSchema, awardsJson)
  const locations = parse('locations', z.array(locationSchema).min(1), locationsJson)
  const researchAreas = parse('researchAreas', researchAreasSchema, researchAreasJson)

  const collections = {
    'contact profile': contact.profiles,
    post: posts,
    education,
    research,
    teaching,
    publications,
    presentations,
    skills,
    additional,
    awards,
    location: locations,
    'research area': researchAreas,
  }

  Object.entries(collections).forEach(([label, values]) => ensureUnique(label, values))

  const researchAreaIds = new Set(researchAreas.map(({ id: value }) => value))
  const locationIds = new Set(locations.map(({ id: value }) => value))

  ensureReferences('profile.origin.locationId', [profile.origin.locationId], locationIds)
  education.forEach((entry) => ensureReferences(`education ${entry.id}.experience.locationId`, [entry.experience.locationId], locationIds))
  research.forEach((entry) => ensureReferences(`research ${entry.id}.experience.locationId`, [entry.experience.locationId], locationIds))

  const educationExperiences = education.map((entry) => {
    const institution = entry.institutions[entry.experience.institutionIndex]
    if (!institution) {
      throw new Error(`Invalid content: education ${entry.id}.experience.institutionIndex is out of range`)
    }
    return {
      id: entry.id,
      locationId: entry.experience.locationId,
      type: 'education' as const,
      degree: entry.degree,
      position: null,
      label: null,
      department: entry.experience.department,
      institution: institution.name,
      start: entry.start,
      end: entry.end,
      dateLabel: entry.dateLabel,
    }
  })

  const researchExperiences = research.map((entry) => ({
    id: entry.id,
    locationId: entry.experience.locationId,
    type: 'research' as const,
    degree: null,
    position: entry.role,
    label: null,
    department: entry.experience.department,
    institution: entry.experience.institution,
    start: entry.start,
    end: entry.end,
    dateLabel: entry.dateLabel,
  }))

  const originLocation = locations.find(({ id: value }) => value === profile.origin.locationId)!
  const experiences = {
    locations,
    experiences: [
      ...researchExperiences,
      ...educationExperiences,
      {
        id: 'guangzhou-home',
        locationId: profile.origin.locationId,
        type: 'home' as const,
        degree: null,
        position: null,
        label: originLocation.name,
        department: null,
        institution: null,
        start: null,
        end: profile.origin.end,
        dateLabel: null,
      },
    ],
  }
  ensureUnique('experience', experiences.experiences)

  publications.forEach((publication) => ensureReferences(`publication ${publication.id}.researchAreaIds`, publication.researchAreaIds, researchAreaIds))
  presentations.forEach((presentation) => ensureReferences(`presentation ${presentation.id}.researchAreaIds`, presentation.researchAreaIds, researchAreaIds))

  return { profile, contact, posts, education, research, teaching, publications, presentations, skills, additional, awards, experiences, researchAreas }
}

export const content = validateAllContent()

export type Content = typeof content
export type Publication = Content['publications'][number]
export type Presentation = Content['presentations'][number]
export type Experience = Content['experiences']['experiences'][number]
export type ExperienceLocation = Content['experiences']['locations'][number]
