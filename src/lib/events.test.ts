import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildEvents,
  formatEventTime,
  getSignupState,
  ilmoEventSchema,
  slugFromLink,
  splitEvents
} from './events.ts'

const now = new Date('2027-03-13T12:00:00Z')

const ilmoEvent = (overrides: Record<string, unknown>) =>
  ilmoEventSchema.parse({
    id: 'a',
    title: 'Vuosijuhla',
    slug: 'vuosijuhla',
    date: '2027-03-13T15:00:00.000Z',
    category: 'Fuusio 80',
    location: 'Sali',
    languages: { en: { title: 'Annual ball', location: null } },
    ...overrides
  })

test('slugFromLink reads the slug from Finnish and English Ilmomasiina links', () => {
  assert.equal(slugFromLink('https://ilmo.fyysikkokilta.fi/events/vuosijuhla'), 'vuosijuhla')
  assert.equal(slugFromLink('https://ilmo.fyysikkokilta.fi/en/events/vuosijuhla?x=1'), 'vuosijuhla')
  assert.equal(slugFromLink('https://ilmo.fyysikkokilta.fi/'), null)
  assert.equal(slugFromLink('not a link'), null)
})

test('buildEvents takes dates from Ilmomasiina and text from the CMS entry', () => {
  const entries = [
    {
      id: 'x',
      title: 'Juhla',
      description: 'Kuvaus',
      link: 'https://ilmo.fyysikkokilta.fi/events/vuosijuhla'
    },
    { id: 'y', title: 'Muu', link: 'https://ilmo.fyysikkokilta.fi/events/puuttuu' }
  ]
  const [found, missing] = buildEvents(entries, [ilmoEvent({})], 'en')
  assert.equal(found.title, 'Juhla')
  assert.equal(found.description, 'Kuvaus')
  assert.equal(found.start, '2027-03-13T15:00:00.000Z')
  assert.equal(found.location, 'Sali')
  assert.equal(missing.start, null)
  assert.equal(buildEvents(entries, null, 'fi')[0].start, null)
})

test('buildEvents uses the manual details of an event without signup', () => {
  const [event] = buildEvents(
    [
      {
        title: 'Sitsit',
        noSignup: true,
        link: 'https://ilmo.fyysikkokilta.fi/events/vuosijuhla',
        startDate: '2027-03-12T16:00:00.000Z',
        location: 'Kiltahuone',
        price: 'Ilmainen'
      }
    ],
    [ilmoEvent({})],
    'fi'
  )
  assert.equal(event.link, null)
  assert.equal(event.start, '2027-03-12T16:00:00.000Z')
  assert.equal(event.location, 'Kiltahuone')
  assert.equal(event.price, 'Ilmainen')
  assert.equal(event.registrationStart, null)
})

test('splitEvents sorts upcoming soonest first and past latest first', () => {
  const events = [
    { id: 'old', start: '2027-01-10T16:00:00Z', end: null },
    { id: 'later', start: '2027-03-14T10:00:00Z', end: null },
    { id: 'older', start: '2026-11-01T16:00:00Z', end: null },
    { id: 'soon', start: '2027-03-13T16:00:00Z', end: null }
  ]
  const { upcoming, past } = splitEvents(events, now)
  assert.deepEqual(
    upcoming.map((event) => event.id),
    ['soon', 'later']
  )
  assert.deepEqual(
    past.map((event) => event.id),
    ['old', 'older']
  )
})

test('events without a date count as upcoming and go last', () => {
  const events = [
    { id: 'none', start: null, end: null },
    { id: 'soon', start: '2027-03-13T16:00:00Z', end: null }
  ]
  assert.deepEqual(
    splitEvents(events, now).upcoming.map((event) => event.id),
    ['soon', 'none']
  )
})

test('an ongoing event counts as upcoming until it ends', () => {
  const ongoing = { start: '2027-03-13T08:00:00Z', end: '2027-03-13T20:00:00Z' }
  assert.equal(splitEvents([ongoing], now).upcoming.length, 1)
  assert.equal(splitEvents([ongoing], new Date('2027-03-13T21:00:00Z')).past.length, 1)
})

test('getSignupState follows the registration window', () => {
  const window = {
    registrationStart: '2027-02-01T10:00:00Z',
    registrationEnd: '2027-03-01T10:00:00Z'
  }
  assert.equal(getSignupState({ registrationStart: null, registrationEnd: null }, now), 'none')
  assert.equal(getSignupState(window, new Date('2027-01-01T00:00:00Z')), 'notYetOpen')
  assert.equal(getSignupState(window, new Date('2027-02-10T00:00:00Z')), 'open')
  assert.equal(getSignupState(window, now), 'closed')
})

test('formatEventTime uses Helsinki time', () => {
  assert.match(
    formatEventTime({ start: '2027-03-13T15:00:00Z', end: null }, 'fi'),
    /13\.3\.2027.*17[.:]00/
  )
})
