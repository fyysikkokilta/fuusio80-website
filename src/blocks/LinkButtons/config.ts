import type { Block } from 'payload'

export const LinkButtonsBlock: Block = {
  slug: 'link-buttons',
  interfaceName: 'LinkButtonsBlock',
  labels: {
    singular: 'Link Buttons',
    plural: 'Link Buttons'
  },
  fields: [
    {
      name: 'buttons',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description:
          'Buttons that open external sites. They sit side by side when there is room and stack on narrow screens.'
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { description: 'Remember to provide all locales.' }
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: { description: 'Full address of the external site, starting with https://' },
              validate: (value: string | null | undefined) =>
                value && /^https?:\/\/\S+$/.test(value)
                  ? true
                  : 'Enter a full URL starting with http:// or https://'
            }
          ]
        }
      ]
    }
  ]
}
