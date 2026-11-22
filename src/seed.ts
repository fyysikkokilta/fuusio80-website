// Fills an empty database with starter content so the site is not blank.
// Run once with: pnpm seed
// Everything created here is placeholder content meant to be edited in /admin.
import config from '@payload-config'
import { getPayload } from 'payload'

import { HOME_PATH } from '@/utils/homePath'

type Node = Record<string, unknown>

const text = (value: string): Node => ({
  type: 'text',
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1
})
const element = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra
})
const paragraph = (value: string) => element('paragraph', [text(value)], { textFormat: 0 })
const heading = (value: string) => element('heading', [text(value)], { tag: 'h2' })
const block = (fields: Node): Node => ({ type: 'block', format: '', version: 2, fields })
const richText = (...children: Node[]) => ({ root: element('root', children) }) as never

const eventsBlock = (categories: string[], layout: 'list' | 'tabs' | 'calendar', show = 'all') =>
  block({ blockType: 'events', categories, layout, show })

// Skip the Next.js cache revalidation hooks: there is no Next.js server in a script.
const context = { skipRevalidate: true }

const pages = [
  {
    fi: {
      title: 'Juhlavuosi',
      path: 'juhlavuosi',
      content: richText(
        paragraph(
          'Fyysikkokilta täyttää 80 vuotta. Juhlavuoden tapahtumat löytyvät tältä sivulta.'
        ),
        eventsBlock(['Juhlavuositapahtumat'], 'list')
      )
    },
    en: {
      title: 'Jubilee year',
      path: 'jubilee-year',
      content: richText(
        paragraph('The Guild of Physics turns 80. The events of the jubilee year are listed here.'),
        eventsBlock(['Juhlavuositapahtumat'], 'list')
      )
    }
  },
  {
    fi: {
      title: 'Fuusioviikko',
      path: 'fuusioviikko',
      content: richText(
        paragraph(
          'Fuusiota edeltävän juhlaviikon tapahtumat. Valitse tapahtuma nähdäksesi sen tiedot.'
        ),
        eventsBlock(['Fuusioviikko'], 'tabs')
      )
    },
    en: {
      title: 'Fuusio week',
      path: 'fuusio-week',
      content: richText(
        paragraph('Events of the week leading up to Fuusio. Pick an event to see its details.'),
        eventsBlock(['Fuusioviikko'], 'tabs')
      )
    }
  },
  {
    fi: {
      title: 'Fuusio',
      path: 'fuusio',
      content: richText(
        paragraph(
          'Fuusio 80 juhlitaan 13.3.2027. Viikonloppuun kuuluvat cocktailtilaisuus, pääjuhla, jatkot ja seuraavan päivän sillisaamiainen.'
        ),
        heading('Ilmoittautuminen'),
        eventsBlock(['Fuusio 80'], 'list', 'upcoming')
      )
    },
    en: {
      title: 'Fuusio',
      path: 'fuusio',
      content: richText(
        paragraph(
          'Fuusio 80 is celebrated on 13 March 2027. The weekend includes a cocktail event, the main party, an afterparty and a herring breakfast the next day.'
        ),
        heading('Registration'),
        eventsBlock(['Fuusio 80'], 'list', 'upcoming')
      )
    }
  },
  {
    fi: {
      title: 'Yhteystiedot',
      path: 'yhteystiedot',
      content: richText(
        paragraph('Fuusio 80:n järjestää juhlavuositoimikunta.'),
        block({
          blockType: 'team',
          members: [
            { name: 'Etunimi Sukunimi', role: 'Rooli (paikkamerkki)' },
            { name: 'Etunimi Sukunimi', role: 'Rooli (paikkamerkki)' }
          ]
        })
      )
    },
    en: { title: 'Contact', path: 'contact', content: null }
  }
]

const payload = await getPayload({ config })

const existing = await payload.count({ collection: 'pages' })
if (existing.totalDocs > 0) {
  payload.logger.error('Database already has pages. Seed only runs on an empty database.')
  process.exit(1)
}

const created: { id: number; fi: string; en: string }[] = []
let navigationRowIds: (string | undefined)[] = []
const sectionCardTexts = [
  { fi: 'Koko vuoden juhlatapahtumat', en: 'Celebrations throughout the year' },
  { fi: 'Juhlaviikon ohjelma päivä päivältä', en: 'The programme of the week, day by day' }
]
for (const { fi, en } of pages) {
  const page = await payload.create({
    collection: 'pages',
    locale: 'fi',
    data: { ...fi, fullWidth: true, _status: 'published' },
    context
  })
  await payload.update({
    collection: 'pages',
    id: page.id,
    locale: 'en',
    // Reuse the Finnish content when no English version is written yet.
    data: { ...en, content: en.content ?? fi.content, _status: 'published' },
    context
  })
  created.push({ id: page.id, fi: fi.title, en: en.title })
}

// The front page is a normal page with the path "home", shown at the site root
const homeContent = (locale: 'fi' | 'en') =>
  richText(
    block({
      blockType: 'section-cards',
      cards: created.slice(0, 2).map((page, index) => ({
        title: page[locale],
        description: sectionCardTexts[index][locale],
        page: page.id
      }))
    }),
    heading(locale === 'fi' ? 'Kalenteri' : 'Calendar'),
    eventsBlock(['Juhlavuositapahtumat', 'Fuusioviikko', 'Fuusio 80'], 'calendar')
  )
const home = await payload.create({
  collection: 'pages',
  locale: 'fi',
  data: {
    title: 'Fuusio 80',
    path: HOME_PATH,
    content: homeContent('fi'),
    fullWidth: true,
    _status: 'published'
  },
  context
})
await payload.update({
  collection: 'pages',
  id: home.id,
  locale: 'en',
  data: { title: 'Fuusio 80', content: homeContent('en'), _status: 'published' },
  context
})

for (const locale of ['fi', 'en'] as const) {
  const fi = locale === 'fi'

  const navigation = await payload.updateGlobal({
    slug: 'main-navigation',
    locale,
    data: {
      title: 'Fuusio 80',
      // On the English pass the rows exist already: reuse their ids so the Finnish labels are kept.
      items: created.map((page, index) => ({
        id: navigationRowIds[index],
        label: page[locale],
        type: 'page' as const,
        page: page.id
      })),
      _status: 'published'
    },
    context
  })
  navigationRowIds = navigation.items?.map((item) => item.id ?? undefined) ?? []

  await payload.updateGlobal({
    slug: 'footer',
    locale,
    data: {
      content: richText(paragraph('Fyysikkokilta ry, PL 69, 02151 Espoo')),
      socials: ['https://www.instagram.com/fyysikkokilta', 'https://t.me/fyysikkokilta']
    },
    context
  })

  await payload.updateGlobal({
    slug: 'partner-section',
    locale,
    data: { title: fi ? 'Yhteistyökumppanit' : 'Partners' },
    context
  })
}

payload.logger.info('Seed done.')
process.exit(0)
