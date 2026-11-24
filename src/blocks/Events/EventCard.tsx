import { CalendarDays, ExternalLink, MapPin, Ticket } from 'lucide-react'
import Image from 'next/image'
import type { Locale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { formatDateTime, formatEventTime, getSignupState, type SiteEvent } from '@/lib/events'

interface EventCardProps {
  event: SiteEvent
  locale: Locale
  now: Date
  dimmed?: boolean
}

export const EventCard = async ({ event, locale, now, dimmed }: EventCardProps) => {
  const t = await getTranslations('events')
  const signupState = getSignupState(event, now)
  // Past events are dimmed, but not the image: fading it would let the yellowish card show through.
  const dim = dimmed ? 'opacity-70' : ''

  return (
    <article className="border-fk-yellow/50 bg-fuusio-surface/70 my-4 rounded-2xl border p-5">
      <h3 className={`mt-0! mb-3! no-underline ${dim}`}>{event.title}</h3>
      {(event.start || event.location || event.price) && (
        <p className={`text-fk-yellow my-2! flex flex-wrap gap-x-6 gap-y-1 font-bold ${dim}`}>
          {event.start && (
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={18} aria-hidden="true" />
              <time dateTime={event.start}>
                {formatEventTime({ ...event, start: event.start }, locale)}
              </time>
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={18} aria-hidden="true" />
              {event.location}
            </span>
          )}
          {event.price && (
            <span className="inline-flex items-center gap-2">
              <Ticket size={18} aria-hidden="true" />
              {event.price}
            </span>
          )}
        </p>
      )}
      {(event.image || event.description) && (
        // Image and text split 1:4 from the sm breakpoint up, image above the text on phones.
        // Without an image the text takes the whole width.
        <div
          className={`my-3 grid items-start gap-4 ${event.image ? 'sm:grid-cols-[1fr_4fr]' : ''}`}
        >
          {event.image && (
            <div className="relative aspect-square w-full max-w-64 overflow-hidden rounded-xl sm:max-w-none">
              <Image
                src={event.image.url}
                alt={event.image.alt}
                {...(event.image.blurDataUrl
                  ? { placeholder: 'blur', blurDataURL: event.image.blurDataUrl }
                  : {})}
                fill
                unoptimized
                sizes="(max-width: 640px) 256px, (max-width: 1024px) 20vw, 15vw"
                className="my-0! rounded-none! object-cover"
              />
            </div>
          )}
          {event.description && (
            <p className={`my-0! whitespace-pre-line ${dim}`}>{event.description}</p>
          )}
        </div>
      )}
      {event.link && (
        <div className={`mt-4 flex flex-wrap items-center gap-4 ${dim}`}>
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-glow hover:text-fk-black inline-flex items-center gap-2 rounded-full px-6 py-2 font-bold no-underline transition-transform hover:scale-105"
          >
            {signupState === 'open' ? t('signup') : t('moreInfo')}
            <ExternalLink size={18} aria-hidden="true" />
          </a>
          {signupState === 'notYetOpen' && event.registrationStart && (
            <span>
              {t('signupOpens', { date: formatDateTime(event.registrationStart, locale) })}
            </span>
          )}
          {signupState === 'closed' && <span>{t('signupClosed')}</span>}
        </div>
      )}
    </article>
  )
}
