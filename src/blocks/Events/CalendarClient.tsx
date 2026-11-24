'use client'

import { TZDate } from '@date-fns/tz'
import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enGB, fi } from 'date-fns/locale'
import { Locale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Event, EventProps, View, Views } from 'react-big-calendar'

// Calendar view from fk-web, fed with Ilmomasiina events instead of Google Calendar.

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string | null
  location: string | null
  url: string | null
}

interface BigCalendarEvent extends Event {
  id: string
  resource: CalendarEvent
}

interface CalendarClientProps {
  events: CalendarEvent[]
  initialDate: string
  locale: Locale
}

const TIME_ZONE = 'Europe/Helsinki'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { fi, en: enGB }
})

function EventElement({ event, title }: EventProps<BigCalendarEvent>) {
  return (
    <a
      className="text-fk-black flex h-full flex-col font-bold no-underline"
      href={event.resource.url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="leading-tight font-semibold">{title}</span>
      {event.resource.location && (
        <span className="text-sm leading-tight opacity-90">{event.resource.location}</span>
      )}
    </a>
  )
}

function MonthViewEventElement({ event, title }: EventProps<BigCalendarEvent>) {
  return (
    <a
      className="text-fk-black flex h-full flex-col font-bold no-underline"
      href={event.resource.url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
    >
      {title}
    </a>
  )
}

export const CalendarClient = ({ events, initialDate, locale }: CalendarClientProps) => {
  const t = useTranslations()
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(() => new Date(initialDate))
  const dateLocale = locale === 'fi' ? fi : enGB

  const calendarEvents: BigCalendarEvent[] = useMemo(
    () =>
      events.map((event) => {
        const start = new TZDate(event.start, TIME_ZONE)
        return {
          id: event.id,
          title: event.title,
          start,
          end: event.end ? new TZDate(event.end, TIME_ZONE) : start,
          resource: event
        }
      }),
    [events]
  )

  const messages = useMemo(
    () => ({
      date: t('calendar.date'),
      time: t('calendar.time'),
      event: t('calendar.event'),
      allDay: t('calendar.allDay'),
      week: t('calendar.week'),
      work_week: t('calendar.workWeek'),
      day: t('calendar.day'),
      month: t('calendar.month'),
      previous: t('calendar.previous'),
      next: t('calendar.next'),
      yesterday: t('calendar.yesterday'),
      tomorrow: t('calendar.tomorrow'),
      today: t('calendar.today'),
      agenda: t('calendar.agenda'),
      noEventsInRange: t('calendar.noEventsInRange'),
      showMore: (total: number) => `+${total} ${t('calendar.more')}`
    }),
    [t]
  )

  return (
    <div className="not-prose my-6 flex h-full min-h-150 w-full flex-col">
      <Calendar
        className="flex-1"
        view={view}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        onView={setView}
        date={date}
        onNavigate={setDate}
        culture={locale}
        popup
        showMultiDayTimes
        messages={messages}
        formats={{
          weekdayFormat: (weekday: Date) => format(weekday, 'cccccc', { locale: dateLocale }),
          monthHeaderFormat: (month: Date) => format(month, 'LLLL yyyy', { locale: dateLocale }),
          dayHeaderFormat: (day: Date) => format(day, 'cccc d.M.', { locale: dateLocale }),
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'd.M.', { locale: dateLocale })} - ${format(end, 'd.M.yyyy', { locale: dateLocale })}`
        }}
        components={{
          day: { event: EventElement },
          week: { event: EventElement },
          month: { event: MonthViewEventElement }
        }}
      />
    </div>
  )
}
