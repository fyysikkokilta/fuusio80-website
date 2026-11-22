import type { Media, RotatablePlaneBlock as RotatablePlaneBlockType } from '@/payload-types'

import { RotatablePlane, type PlaneSide } from './RotatablePlane'

interface RotatablePlaneProps {
  block: RotatablePlaneBlockType
}

const toSide = (image: number | Media): PlaneSide | null =>
  typeof image === 'object' && image.url
    ? {
        url: image.url,
        alt: image.alt || '',
        blurDataUrl: image.blurDataUrl ?? undefined,
        width: image.width || 1,
        height: image.height || 1
      }
    : null

export const RotatablePlaneBlock = ({ block }: RotatablePlaneProps) => {
  const front = toSide(block.frontImage)
  const back = toSide(block.backImage)

  if (!front || !back) return null

  return <RotatablePlane front={front} back={back} />
}
