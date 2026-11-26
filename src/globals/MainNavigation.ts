import type { Field, GlobalConfig } from 'payload'

import { signedIn } from '@/access/signed-in'
import { env } from '@/env'
import { revalidateGlobal } from '@/hooks/revalidateGlobal'

const fields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
    localized: true,
    admin: {
      description: 'The label of the navigation item. Remember to provide all locales.'
    }
  },
  {
    name: 'type',
    type: 'select',
    options: [
      { value: 'page', label: 'Page' },
      { value: 'external', label: 'External' },
      { value: 'menu', label: 'Menu' }
    ],
    required: true,
    defaultValue: 'page',
    admin: {
      description:
        'The type of the navigation item. If the item is a menu, it will be shown as a dropdown menu.'
    }
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    required: true,
    hasMany: false,
    admin: {
      condition: (_data, siblingData) => {
        return siblingData.type === 'page'
      }
    }
  },
  {
    name: 'url',
    type: 'text',
    required: true,
    localized: true,
    admin: {
      condition: (_data, siblingData) => {
        return siblingData.type === 'external'
      },
      description: 'The URL of the external link. Remember to provide all locales.'
    },
    validate: (value: string | null | undefined) => {
      if (!value) return 'URL is required'
      const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([^\s]*)\/?$/
      if (!regex.test(value)) {
        return 'URL is invalid'
      }
      return true
    }
  }
]

export const MainNavigation: GlobalConfig = {
  slug: 'main-navigation',
  access: {
    read: () => true,
    update: signedIn
  },
  admin: {
    group: 'Globals',
    description: 'Main navigation menu items.'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'The title of the website. This will be shown in the header of the website.'
      }
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'The header logo of the website. This will be shown in the header of the website.'
      }
    },
    {
      name: 'floatingLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Logo that appears near the top of the free space left of the center column on wide screens (1655px and wider) when the header has been scrolled out of view. Hovering or clicking it brings the header back. If empty, the header logo is used.'
      }
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        ...fields,
        {
          name: 'children',
          type: 'array',
          required: true,
          admin: {
            condition: (_data, siblingData) => {
              return siblingData.type === 'menu'
            }
          },
          // One dropdown level is enough for a site this small
          fields: fields.map((field) =>
            'name' in field && field.name === 'type' && field.type === 'select'
              ? {
                  ...field,
                  options: field.options.filter(
                    (option) => typeof option === 'object' && option.value !== 'menu'
                  )
                }
              : field
          )
        }
      ]
    }
  ],
  versions: {
    max: env.NODE_ENV === 'production' ? 100 : 20,
    drafts: {
      validate: true
    }
  },
  hooks: {
    afterChange: [revalidateGlobal()]
  }
}
