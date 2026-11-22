import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import type { SectionCardsBlock as SectionCardsBlockType } from '@/payload-types'
import { pageHref } from '@/utils/homePath'

import { TiltCard } from './TiltCard'

interface SectionCardsProps {
  block: SectionCardsBlockType
}

// The card leans toward the cursor (see TiltCard) and its text floats above the surface.
// No tilt for people who asked for reduced motion.
export const SectionCards = ({ block }: SectionCardsProps) => (
  <div className="not-prose my-8 grid gap-6 sm:grid-cols-2">
    {block.cards?.map(({ id, title, description, page, image }) => {
      if (typeof page !== 'object') return null
      const background = typeof image === 'object' ? image : null

      return (
        <Link key={id} href={pageHref(page.path)} className="group block rounded-3xl no-underline">
          <TiltCard className="border-fk-yellow/60 bg-fuusio-surface group-hover:shadow-fuusio-orange/40 relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl border-2 p-6 shadow-xl group-hover:shadow-2xl">
            {background?.url ? (
              <>
                <Image
                  src={background.url}
                  alt=""
                  blurDataURL={background.blurDataUrl}
                  placeholder="blur"
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="from-fuusio-deep absolute inset-0 bg-linear-to-t to-transparent" />
              </>
            ) : (
              <div className="hero-glow absolute inset-0 opacity-60" aria-hidden="true" />
            )}
            <div className="relative translate-z-12 motion-reduce:transform-none">
              <h2 className="font-display text-glow w-fit pb-1 text-4xl no-underline">{title}</h2>
              {description && (
                <p className="text-fk-white mt-2 text-lg font-normal">{description}</p>
              )}
              <ArrowRight
                aria-hidden="true"
                className="text-fk-yellow mt-4 transition-transform duration-300 group-hover:translate-x-2"
                size={28}
              />
            </div>
          </TiltCard>
        </Link>
      )
    })}
  </div>
)
