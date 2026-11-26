import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import type { Media, PartnerSection } from '@/payload-types'

interface PartnersProps {
  partnerData: PartnerSection
}

export const Partners = ({ partnerData }: PartnersProps) => {
  return (
    <section className="border-fuusio-gold/50 bg-fk-black text-fk-white w-full border-t py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display mb-10 text-center text-3xl">{partnerData.title}</h2>
        <div className="grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {partnerData.partners?.map(({ name, link, logo, id }) => (
            <Link
              key={id}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-[70px] w-full max-w-[160px]"
            >
              <Image
                src={(logo as Media).url || ''}
                alt={(logo as Media).alt || name}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-contain transition-transform duration-200 hover:scale-110"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
