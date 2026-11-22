import Image from 'next/image'

import type { Page } from '@/payload-types'

interface PageBannerProps {
  page: Page
}

// The banner is expected to have a transparent background: it lies over the page background.
// It is as wide as the center column and keeps its own height, so it is never cropped.
export const PageBanner = ({ page }: PageBannerProps) => {
  const image = page.bannerImage

  if (!image || typeof image !== 'object' || !image.url || !image.width || !image.height) {
    return null
  }

  return (
    <Image
      priority
      src={image.url}
      alt={image.alt || page.title}
      width={image.width}
      height={image.height}
      unoptimized
      sizes="(max-width: 1280px) 100vw, 1280px"
      className="h-auto w-full"
    />
  )
}
