import type { Media } from '@/payload-types'

interface PageBackgroundProps {
  image: Media
  /** Mirror every second copy sideways. When false, copies are repeated as they are. */
  mirror: boolean
}

// Widest screen the mirrored background is built to cover
const MAX_SCREEN_PX = 7680

// The background of a page. The image repeats downwards as it is, and sideways either as it is or
// with every second copy mirrored, so that the seams between copies line up. One copy always sits
// in the middle of the page and the rest extend to both sides, so the picture stays symmetric on
// any screen width. Copies are drawn at the image's own size.
export const PageBackground = ({ image, mirror }: PageBackgroundProps) => {
  const tileWidth = image.width
  if (!image.url || !tileWidth) return null

  const backgroundImage = `url("${image.url}")`
  const backgroundSize = `${tileWidth}px auto`

  // Plain repeat: CSS does it all, on any screen width and zoom level
  if (!mirror) {
    return (
      <div
        className="pointer-events-none absolute inset-0 bg-repeat"
        style={{ backgroundImage, backgroundSize, backgroundPosition: 'center top' }}
        aria-hidden="true"
      />
    )
  }

  // CSS cannot mirror every second copy, so draw a column per copy and flip the odd ones.
  const copiesPerSide = Math.max(0, Math.ceil((MAX_SCREEN_PX - tileWidth) / 2 / tileWidth))
  const offsets = Array.from({ length: copiesPerSide * 2 + 1 }, (_, i) => i - copiesPerSide)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2">
        {offsets.map((offset) => (
          <div
            key={offset}
            className="h-full shrink-0 bg-repeat-y"
            style={{
              width: tileWidth,
              backgroundImage,
              backgroundSize: '100% auto',
              // Copies at an odd distance from the middle one are mirrored
              transform: Math.abs(offset) % 2 === 1 ? 'scaleX(-1)' : undefined
            }}
          />
        ))}
      </div>
    </div>
  )
}
