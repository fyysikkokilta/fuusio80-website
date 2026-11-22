import type { CollectionConfig, FieldHook, FieldHookArgs } from 'payload'

import { publishedOrSignedIn } from '@/access/published-or-signed-in'
import { env } from '@/env'
import { revalidateCollection } from '@/hooks/revalidateCollection'
import { revalidateDeletedCollection } from '@/hooks/revalidateDeletedCollection'
import { HOME_PATH } from '@/utils/homePath'
import { slugify } from '@/utils/slugify'

import { signedIn } from '../access/signed-in'

const formatPath: FieldHook = async ({ value, data, req: { payload } }: FieldHookArgs) => {
  const title = data?.title as string
  if (!title || !payload.config?.localization) {
    payload.logger.error('No title found for page')
    return
  }

  // If there's no value, generate from title
  // Since the title is localized and path is not, this is set based on the first locale's title
  if (!value) {
    return slugify(title)
  }

  // Clean up the value
  if (value) {
    return value.toLowerCase().replace(/^\/+|\/+$/g, '')
  }

  return value
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  // This cuts down HUGELY on the amount of data that is populated each page
  defaultPopulate: {
    path: true,
    title: true
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path'],
    listSearchableFields: ['title', 'path'],
    preview: (doc, { req }) => {
      if (!doc?.path) return null
      const baseUrl = env.NEXT_PUBLIC_SERVER_URL
      const locale = typeof req.query?.locale === 'string' ? req.query.locale : req.locale || 'fi'
      return `${baseUrl}/api/draft?slug=/${locale}${doc.path === HOME_PATH ? '' : `/${doc.path}`}`
    },
    group: 'Pages',
    description: 'Manage website pages'
  },
  access: {
    read: publishedOrSignedIn,
    create: signedIn,
    update: signedIn,
    delete: signedIn
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          description: 'Content of the page',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true
            },
            {
              name: 'bannerImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Banner image of the page. It should have a transparent background, since it is placed over the page background. It is scaled to the width of the center column and never cropped.'
              }
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Background of the page, shown on both sides of the center column. It repeats downwards as it is, so it must tile seamlessly top to bottom. Sideways it repeats too, mirrored or not depending on the option below. It is drawn at its own pixel size.'
              }
            },
            {
              name: 'mirrorBackgroundHorizontally',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                condition: (data) => !!data?.backgroundImage,
                description:
                  'Mirror every second copy of the background sideways, so the edges of neighbouring copies match. Turn off if the image already tiles seamlessly sideways or must not be mirrored.'
              }
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              localized: true
            }
          ]
        }
      ]
    },
    {
      name: 'path',
      type: 'text',
      index: true,
      unique: true,
      required: true,
      localized: true,
      hooks: {
        beforeValidate: [formatPath]
      },
      admin: {
        position: 'sidebar',
        description:
          'The URL path for this page. This will be auto-generated from the title if left empty. Please prefer flat paths, for example "/about" instead of "/about/index".'
      }
    },
    {
      name: 'showTableOfContents',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        condition: (data) => !data?.fullWidth,
        description:
          'Show a table of contents for the page. This will be shown in the left sidebar or above the content on mobile.'
      }
    },
    {
      name: 'fullWidth',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Make the page full width (no table of contents column). Good for pages with event tabs or team photos.'
      }
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Prevent the page from being indexed by search engines.'
      }
    }
  ],
  versions: {
    maxPerDoc: env.NODE_ENV === 'production' ? 100 : 20,
    drafts: {
      autosave: {
        interval: 1000
      }
    }
  },
  hooks: {
    afterChange: [revalidateCollection('pages')],
    afterDelete: [revalidateDeletedCollection('pages')]
  }
}
