import '../globals.css'

import { locale } from 'next/root-params'
import { NextIntlClientProvider } from 'next-intl'
import NextTopLoader from 'nextjs-toploader'

import { bodyFont, displayFont } from '@/app/fonts'
import { Footer } from '@/components/Footer'
import { NavigationProvider } from '@/components/Navigation/NavigationProvider'
import { Partners } from '@/components/Partners'
import { SiteBackdrop } from '@/components/SiteBackdrop'
import { SkipLink } from '@/components/SkipLink'
import { env } from '@/env'
import { routing } from '@/i18n/routing'
import { getFooter } from '@/lib/getFooter'
import { getMainNavigation } from '@/lib/getMainNavigation'
import { getPartners } from '@/lib/getPartners'

export const generateStaticParams = () => {
  // Skip generating static params if database is not available
  // This is needed for building without database access in CI
  if (!env.DATABASE_URI) {
    return []
  }
  return routing.locales.map((localeParam) => ({ locale: localeParam }))
}

export default async function RootLayout({ children }: LayoutProps<'/[locale]'>) {
  const curLocale = await locale()

  const navigation = await getMainNavigation(curLocale)
  const footer = await getFooter(curLocale)
  const partners = await getPartners(curLocale)

  return (
    <html
      lang={curLocale}
      className={`${bodyFont.variable} ${bodyFont.className} ${displayFont.variable} selection:bg-fuusio-gold selection:text-fk-black scrollbar scrollbar-thumb-fuusio-gold scrollbar-track-fk-black scroll-pt-16`}
    >
      <body className="bg-fuusio-darkblue text-fk-white flex min-h-dvh flex-1 shrink-0 flex-col items-center overflow-x-clip">
        <NextIntlClientProvider>
          <NextTopLoader color="#d8b435" showSpinner={false} showForHashAnchor={false} />
          <SkipLink />
          <NavigationProvider navigation={navigation}>
            <div className="relative isolate flex w-full flex-1 flex-col">
              <SiteBackdrop />
              {children}
            </div>
            {!!partners?.partners?.length && <Partners partnerData={partners} />}
            <Footer footer={footer} locale={curLocale} />
          </NavigationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
