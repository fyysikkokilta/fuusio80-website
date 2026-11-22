import configPromise from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { env } from '@/env'
import { routing } from '@/i18n/routing'
import { HOME_PATH } from '@/utils/homePath'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({
    config: configPromise
  })

  const pages = await payload.find({
    collection: 'pages',
    select: {
      path: true,
      updatedAt: true
    },
    where: {
      _status: {
        equals: 'published'
      }
    },
    depth: 0,
    locale: 'all',
    limit: 0
  })

  // The home page is served at the site root, not under its own path
  const pageUrl = (locale: string, localizedPath: string) =>
    localizedPath === HOME_PATH
      ? `${env.NEXT_PUBLIC_SERVER_URL}/${locale}`
      : `${env.NEXT_PUBLIC_SERVER_URL}/${locale}/${localizedPath}`

  const pageEntries = pages.docs
    .map((page) => {
      // Payload types are f*cked up :D
      const path = page.path as unknown as Record<string, string>
      return routing.locales
        .map((locale) => {
          const localizedPath = path[locale] ?? path[routing.defaultLocale]
          if (!localizedPath) {
            return null
          }

          return {
            url: pageUrl(locale, localizedPath),
            lastModified: page.updatedAt,
            changeFrequency: 'daily' as const,
            priority: localizedPath === HOME_PATH ? 1 : 0.7,
            alternates: {
              languages: Object.fromEntries(
                routing.locales
                  .map((innerLocale) => {
                    const innerLocalizedPath = path[innerLocale] ?? path[routing.defaultLocale]

                    if (!innerLocalizedPath) {
                      return null
                    }

                    return [innerLocale, pageUrl(innerLocale, innerLocalizedPath)]
                  })
                  .filter((item) => !!item)
              )
            }
          }
        })
        .filter((item) => !!item)
    })
    .flat()

  return pageEntries
}
