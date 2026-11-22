import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locale } from 'next/root-params'

import { DraftModeBanner } from '@/components/DraftModeBanner'
import { PageContent } from '@/components/PageContent'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'
import { env } from '@/env'
import { getMainNavigation } from '@/lib/getMainNavigation'
import { getPage } from '@/lib/getPage'
import { isDraftMode } from '@/utils/draftMode'
import { HOME_PATH } from '@/utils/homePath'

// Event blocks sort events into upcoming and past by the current time, so re-render at least hourly.
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const curLocale = await locale()
  const { page } = await getPage(HOME_PATH, curLocale)
  const siteName = (await getMainNavigation(curLocale)).title

  const image =
    page?.bannerImage && typeof page.bannerImage === 'object'
      ? {
          url: page.bannerImage.url || '',
          width: page.bannerImage.width || 100,
          height: page.bannerImage.height || 100,
          alt: page.bannerImage.alt || ''
        }
      : null

  return {
    title: page?.title ?? siteName,
    metadataBase: new URL(env.NEXT_PUBLIC_SERVER_URL || ''),
    openGraph: {
      title: page?.title ?? siteName,
      images: image || [],
      url: `${env.NEXT_PUBLIC_SERVER_URL}/${curLocale}`,
      siteName,
      locale: curLocale,
      type: 'website'
    },
    verification: {
      google: env.GOOGLE_SITE_VERIFICATION
    }
  }
}

export default async function HomePage() {
  const curLocale = await locale()

  const isDraft = await isDraftMode()
  const { page } = await getPage(HOME_PATH, curLocale)

  // Unpublished pages are visible only in draft mode
  if (!page || (!isDraft && page._status !== 'published')) {
    notFound()
  }

  return (
    <>
      <DraftModeBanner pageId={page.id.toString()} isDraft={isDraft} />
      {isDraft ? <RefreshRouteOnSave /> : null}
      <PageContent page={page} locale={curLocale} />
    </>
  )
}
