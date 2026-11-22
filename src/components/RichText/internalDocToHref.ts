import { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import { Locale } from 'next-intl'

import { Page } from '@/payload-types'
import { HOME_PATH } from '@/utils/homePath'

export const internalDocToHref = (
  { linkNode }: { linkNode: SerializedLinkNode },
  locale: Locale
) => {
  const { doc } = linkNode.fields
  if (!doc || typeof doc !== 'object') {
    throw new Error('Expected value to be an object')
  }

  switch (doc.relationTo) {
    case 'pages':
      const page = doc.value as unknown as Page
      return page.path === HOME_PATH ? `/${locale}` : `/${locale}/${page.path}`
    default:
      const url = doc.value as unknown as { url?: string; path?: string }
      if (url.url) {
        return url.url
      }
      if (url.path) {
        return `/${locale}/${url.path}`
      }
      return ''
  }
}
