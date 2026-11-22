import type { Locale } from 'next-intl'

import { PageBackground } from '@/components/PageBackground'
import { SiteHeader } from '@/components/Navigation'
import { PageBanner } from '@/components/PageBanner'
import { RichText } from '@/components/RichText'
import { TableOfContents } from '@/components/TableOfContents'
import type { Page } from '@/payload-types'

interface PageContentProps {
  page: Page
  locale: Locale
}

// The layout of every page, including the front page: a page background behind a center column,
// which has the banner on top and a flat colored area for the content below it.
export const PageContent = ({ page, locale }: PageContentProps) => (
  <main className="relative flex w-full flex-1 flex-col">
    {page.backgroundImage && typeof page.backgroundImage === 'object' && (
      <PageBackground
        image={page.backgroundImage}
        mirror={page.mirrorBackgroundHorizontally !== false}
      />
    )}
    <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col">
      <PageBanner page={page} />
      <SiteHeader />
      <section
        id="page-content"
        tabIndex={-1}
        className="bg-fuusio-night w-full flex-1 p-6 pb-12 outline-none"
      >
        <div className={!page.fullWidth ? 'lg:ml-[20%]' : ''}>
          <h1 className="font-display text-glow mb-8 w-fit pb-1 text-5xl wrap-break-word hyphens-auto">
            {page.title}
          </h1>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          {!page.fullWidth && (
            <TableOfContents show={page.showTableOfContents} richText={page.content} />
          )}
          <div className={!page.fullWidth ? 'lg:w-[80%]' : 'lg:w-full'}>
            <RichText data={page.content} locale={locale} />
          </div>
        </div>
      </section>
    </div>
  </main>
)
