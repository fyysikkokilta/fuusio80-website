// Pure helpers for events fetched from Ilmomasiina.
// No Next.js or Payload imports so that events.test.ts runs with plain node.
import { z } from 'zod'

const translationSchema = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  price: z.string().nullish()
})

// Only the fields this site shows. Ilmomasiina is an external service, so nothing is trusted unchecked.
export const ilmoEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  date: z.string().nullable(),
  endDate: z.string().nullish(),
  registrationStartDate: z.string().nullish(),
  registrationEndDate: z.string().nullish(),
  category: z.string().default(''),
  description: z.string().nullish(),
  location: z.string().nullish(),
  price: z.string().nullish(),
  languages: z.record(z.string(), translationSchema).default({})
})

export type IlmoEvent = z.infer<typeof ilmoEventSchema>

export interface EventImage {
  url: string
  alt: string
  blurDataUrl: string | null
}

/** An event entered in the CMS. The fields from Ilmomasiina are null when the event is not found there. */
export interface SiteEvent {
  id: string
  title: string
  description: string | null
  image: EventImage | null
  /** Ilmomasiina link. Null for events without signup. */
  link: string | null
  start: string | null
  end: string | null
  registrationStart: string | null
  registrationEnd: string | null
  location: string | null
  price: string | null
}

/** One entry of the events block, as saved by the CMS. */
export interface EventEntry {
  id?: string | null
  title: string
  description?: string | null
  noSignup?: boolean | null
  link?: string | null
  startDate?: string | null
  endDate?: string | null
  location?: string | null
  price?: string | null
  image?: number | { url?: string | null; alt?: string | null; blurDataUrl?: string | null } | null
}

const TIME_ZONE = 'Europe/Helsinki'
const intlLocale = (locale: string) => (locale === 'fi' ? 'fi-FI' : 'en-GB')
const time = (value: string) => new Date(value).getTime()

/** The Ilmomasiina slug of an event link such as https://ilmo.fyysikkokilta.fi/en/events/fuusio-80. */
export const slugFromLink = (link: string) => {
  try {
    const slug = new URL(link).pathname.match(/\/events\/([^/]+)/)?.[1]
    return slug ? decodeURIComponent(slug) : null
  } catch {
    return null
  }
}

/** Joins the CMS entries with the Ilmomasiina events behind their links. Pass null when Ilmomasiina is unreachable. */
export const buildEvents = (
  entries: readonly EventEntry[],
  ilmoEvents: readonly IlmoEvent[] | null,
  locale: string
): SiteEvent[] => {
  const bySlug = new Map((ilmoEvents ?? []).map((event) => [event.slug, event]))

  return entries.map((entry, index) => {
    const manual = !!entry.noSignup
    const slug = !manual && entry.link ? slugFromLink(entry.link) : null
    const ilmo = slug ? bySlug.get(slug) : undefined
    const translation = ilmo?.languages[locale]
    const media = typeof entry.image === 'object' && entry.image?.url ? entry.image : null

    return {
      id: entry.id ?? String(index),
      title: entry.title,
      description: entry.description || null,
      image: media?.url
        ? { url: media.url, alt: media.alt || '', blurDataUrl: media.blurDataUrl ?? null }
        : null,
      link: manual ? null : (entry.link ?? null),
      // Events without signup carry their own details, the others get them from Ilmomasiina
      start: manual ? (entry.startDate ?? null) : (ilmo?.date ?? null),
      end: manual ? (entry.endDate ?? null) : (ilmo?.endDate ?? null),
      registrationStart: ilmo?.registrationStartDate ?? null,
      registrationEnd: ilmo?.registrationEndDate ?? null,
      location: manual ? entry.location || null : translation?.location || ilmo?.location || null,
      price: manual ? entry.price || null : translation?.price || ilmo?.price || null
    }
  })
}

/**
 * Splits events into upcoming (soonest first) and past (latest first). An event is past once it has ended.
 * Events without a date (not found in Ilmomasiina) count as upcoming and go last.
 */
export const splitEvents = <T extends Pick<SiteEvent, 'start' | 'end'>>(
  events: readonly T[],
  now: Date
) => {
  const startTime = (event: T) => (event.start ? time(event.start) : Number.MAX_SAFE_INTEGER)
  const isPast = (event: T) => {
    const finish = event.end || event.start
    return finish !== null && time(finish) < now.getTime()
  }

  return {
    upcoming: events
      .filter((event) => !isPast(event))
      .toSorted((a, b) => startTime(a) - startTime(b)),
    past: events.filter(isPast).toSorted((a, b) => startTime(b) - startTime(a))
  }
}

export type SignupState = 'none' | 'notYetOpen' | 'open' | 'closed'

export const getSignupState = (
  event: Pick<SiteEvent, 'registrationStart' | 'registrationEnd'>,
  now: Date
): SignupState => {
  if (!event.registrationStart || !event.registrationEnd) return 'none'
  if (now.getTime() < time(event.registrationStart)) return 'notYetOpen'
  if (now.getTime() > time(event.registrationEnd)) return 'closed'
  return 'open'
}

export const formatDateTime = (value: string, locale: string) =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE
  }).format(new Date(value))

export const formatEventTime = (
  { start, end }: { start: string; end: string | null },
  locale: string
) =>
  end
    ? new Intl.DateTimeFormat(intlLocale(locale), {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIME_ZONE
      }).formatRange(new Date(start), new Date(end))
    : formatDateTime(start, locale)

export const formatShortDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    timeZone: TIME_ZONE
  }).format(new Date(value))
