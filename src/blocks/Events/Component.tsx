import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-styles.css'

import type { Locale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { buildEvents, formatShortDate, type SiteEvent, splitEvents } from '@/lib/events'
import { getEvents } from '@/lib/getEvents'
import type { EventsBlock as EventsBlockType } from '@/payload-types'

import { CalendarClient } from './CalendarClient'
import { EventCard } from './EventCard'
import { EventTabs } from './EventTabs'

interface EventsProps {
  block: EventsBlockType
  locale: Locale
}

export const Events = async ({ block, locale }: EventsProps) => {
  const t = await getTranslations('events')
  const entries = block.events ?? []

  if (entries.length === 0) {
    return <p>{t('noEvents')}</p>
  }

  // If Ilmomasiina is down the cards still show what is in the CMS, just without dates.
  const events = buildEvents(entries, await getEvents(), locale)

  // The page is re-rendered at least hourly (see `revalidate` in the page files), so "now" stays fresh enough.
  // oxlint-disable-next-line react/purity -- server component, renders once per request
  const now = new Date()
  const { upcoming, past } = splitEvents(events, now)

  const card = (event: SiteEvent, dimmed = false) => (
    <EventCard key={event.id} event={event} locale={locale} now={now} dimmed={dimmed} />
  )

  if (block.layout === 'calendar') {
    return (
      <CalendarClient
        locale={locale}
        // Open on the month of the next event, so the calendar is not empty at first sight
        initialDate={(upcoming.find((event) => event.start) ?? past[0])?.start ?? now.toISOString()}
        events={events.flatMap((event) =>
          event.start
            ? [
                {
                  id: event.id,
                  title: event.title,
                  start: event.start,
                  end: event.end,
                  location: event.location,
                  url: event.link
                }
              ]
            : []
        )}
      />
    )
  }

  if (block.layout === 'tabs') {
    const chronological = [...past.toReversed(), ...upcoming]

    return (
      <EventTabs
        label={t('title')}
        defaultValue={(upcoming[0] ?? chronological[0]).id}
        tabs={chronological.map((event) => ({
          id: event.id,
          date: event.start ? formatShortDate(event.start, locale) : '',
          title: event.title,
          content: card(event)
        }))}
      />
    )
  }

  const showUpcoming = block.show !== 'past'
  const showPast = block.show !== 'upcoming' && past.length > 0

  return (
    <div className="my-6">
      {showUpcoming && (
        <section>
          {block.show === 'all' && <h2>{t('upcoming')}</h2>}
          {upcoming.length > 0 ? upcoming.map((event) => card(event)) : <p>{t('noUpcoming')}</p>}
        </section>
      )}
      {showPast && (
        <section>
          {block.show === 'all' && <h2>{t('past')}</h2>}
          {past.map((event) => card(event, true))}
        </section>
      )}
    </div>
  )
}
