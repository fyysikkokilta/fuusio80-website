import { Mail, Send } from 'lucide-react'
import Image from 'next/image'

import type { TeamBlock as TeamBlockType } from '@/payload-types'

interface TeamProps {
  block: TeamBlockType
}

export const Team = ({ block }: TeamProps) => (
  <ul className="my-6 grid list-none! grid-cols-2 gap-4 pl-0! sm:grid-cols-3 lg:grid-cols-4">
    {block.members?.map(({ id, name, role, email, telegram, image }) => {
      const photo = typeof image === 'object' ? image : null
      const handle = telegram?.replace(/^@/, '')

      return (
        <li
          key={id}
          className="border-fuusio-gold/50 bg-fuusio-darkblue/70 my-0! overflow-hidden rounded-2xl border pl-0!"
        >
          <div className="bg-fuusio-darkblue/60 relative aspect-square w-full">
            {photo?.url ? (
              <Image
                src={photo.url}
                alt={photo.alt || ''}
                blurDataURL={photo.blurDataUrl}
                placeholder="blur"
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 25vw"
                className="my-0! rounded-none! object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="font-display text-glow flex h-full items-center justify-center text-7xl"
              >
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div className="p-3">
            <div className="font-bold">{name}</div>
            {role && <div className="text-fk-gray-lightest text-sm">{role}</div>}
            <div className="mt-2 flex flex-col gap-1 text-sm">
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 break-all">
                  <Mail size={16} aria-hidden="true" className="shrink-0" />
                  {email}
                </a>
              )}
              {handle && (
                <a
                  href={`https://t.me/${encodeURIComponent(handle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Send size={16} aria-hidden="true" className="shrink-0" />@{handle}
                </a>
              )}
            </div>
          </div>
        </li>
      )
    })}
  </ul>
)
