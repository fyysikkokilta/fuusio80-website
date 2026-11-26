import Image from 'next/image'

import type { Media } from '@/payload-types'

interface NavbarBrandProps {
  LinkElement: React.ElementType
  logo?: Media | string | number | null
  title: string
  onClose?: () => void
}

export const NavbarBrand = ({ LinkElement, logo, title, onClose }: NavbarBrandProps) => (
  <LinkElement href="/" className="flex items-center gap-2 hover:no-underline" onClick={onClose}>
    {!!logo && typeof logo === 'object' && logo.url && (
      <Image
        priority
        src={logo.url}
        alt=""
        unoptimized
        width={48}
        height={48}
        // Exactly as tall as the navigation items (h-12); the width follows the image. Without this the
        // base styles make the height follow the width, and a portrait logo sticks out of the bar.
        className="brand-logo h-12 w-auto"
      />
    )}
    <span className="font-display text-glow text-2xl">{title}</span>
  </LinkElement>
)
