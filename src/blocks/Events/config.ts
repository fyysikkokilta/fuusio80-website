import type { Block, DateFieldValidation, TextFieldSingleValidation } from 'payload'

export const EventsBlock: Block = {
  slug: 'events',
  interfaceName: 'EventsBlock',
  labels: {
    singular: 'Events',
    plural: 'Events'
  },
  fields: [
    {
      name: 'events',
      type: 'array',
      admin: {
        description:
          'Add the events by hand. Date, location, price and the signup state are read automatically from the Ilmomasiina event behind the link. Events are sorted into upcoming and past by that date, so the order here does not matter.'
      },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Shown as a square next to the description.' }
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          admin: { description: 'Short description. Line breaks are kept.' }
        },
        {
          name: 'noSignup',
          label: "Doesn't have signup",
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'For events that are not in Ilmomasiina. Instead of the link, you enter the date, location and price here.'
          }
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description:
              'Link to the event in Ilmomasiina, e.g. https://ilmo.fyysikkokilta.fi/events/fuusio-80',
            condition: (_data, siblingData) => !siblingData?.noSignup
          },
          validate: ((value, { siblingData }) => {
            if ((siblingData as { noSignup?: boolean } | undefined)?.noSignup) return true
            if (!value) return 'The link is required'
            try {
              const { protocol, pathname } = new URL(value)
              if (!/^https?:$/.test(protocol)) return 'The link must start with https://'
              if (!/\/events\/[^/]+/.test(pathname))
                return 'The link must point to an event, like https://ilmo.fyysikkokilta.fi/events/<event>'
            } catch {
              return 'Enter a full link, like https://ilmo.fyysikkokilta.fi/events/<event>'
            }
            return true
          }) satisfies TextFieldSingleValidation
        },
        {
          type: 'row',
          admin: { condition: (_data, siblingData) => !!siblingData?.noSignup },
          fields: [
            {
              name: 'startDate',
              label: 'Starts',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
              validate: ((value, { siblingData }) =>
                (siblingData as { noSignup?: boolean } | undefined)?.noSignup && !value
                  ? 'The start time is required'
                  : true) satisfies DateFieldValidation
            },
            {
              name: 'endDate',
              label: 'Ends (optional)',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayAndTime' } }
            }
          ]
        },
        {
          type: 'row',
          admin: { condition: (_data, siblingData) => !!siblingData?.noSignup },
          fields: [
            { name: 'location', type: 'text', localized: true },
            { name: 'price', type: 'text', localized: true }
          ]
        }
      ]
    },
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'list',
      options: [
        { label: 'List (cards under each other)', value: 'list' },
        { label: 'Tabs (one event visible at a time)', value: 'tabs' },
        { label: 'Calendar (month, week and day views)', value: 'calendar' }
      ],
      admin: {
        description:
          'Tabs keep the page short: the reader picks an event and sees only that one. Good for the Fuusio week.'
      }
    },
    {
      name: 'show',
      type: 'select',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'Upcoming and past (separated)', value: 'all' },
        { label: 'Only upcoming', value: 'upcoming' },
        { label: 'Only past', value: 'past' }
      ],
      admin: {
        condition: (_data, siblingData) => siblingData.layout === 'list'
      }
    }
  ]
}
