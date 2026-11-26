'use client'

import { useEffect, useRef } from 'react'

interface SideGraphicProps {
  url: string
  /** Size of the image in pixels. It is drawn at this size, or smaller if the free space is narrower. */
  width: number
  height: number
}

// How fast the graphic scrolls compared to the page. 0.5 is half the speed.
const SCROLL_SPEED = 0.5

// The width of the center column (max-w-7xl). The graphic only uses the free space beside it.
const COLUMN_WIDTH = '80rem'
// Each side is as wide as the free space beside the center column, but never wider than the image
// itself. The image is scaled down to that width, keeping its proportions. On screens as narrow as
// the column there is no room for it.
const sideWidth = (imageWidth: number) =>
  `min(${imageWidth}px, max(0px, calc((100% - ${COLUMN_WIDTH}) / 2)))`

// A graphic tiled downwards along the very left edge of the page, and mirrored on the right edge.
// It sits above the page background and below the center column. While scrolling it moves at half
// the speed of the page, so it slides against the content and the background.
export const SideGraphic = ({ url, width, height }: SideGraphicProps) => {
  const sideRefs = useRef<(HTMLDivElement | null)[]>([])
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frame = 0
    const update = () => {
      frame = 0
      sideRefs.current.forEach((side, index) => {
        const track = trackRefs.current[index]
        if (!side || !track || side.clientWidth === 0) return
        // The image is scaled to the width of the side, so the height of one tile changes with it
        const tileHeight = (side.clientWidth * height) / width
        // The track starts one tile above the page area, so the shifted track always covers it
        track.style.top = `${-tileHeight}px`
        // The graphic is shifted down by a part of the scroll distance, so on screen it moves up slower
        // than the page. The shift wraps around after one tile, which looks the same since it tiles.
        const offset = reduceMotion ? 0 : (window.scrollY * SCROLL_SPEED) % tileHeight
        track.style.transform = `translate3d(0, ${offset}px, 0)`
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    // The sides change size with the window
    const resizeObserver = new ResizeObserver(schedule)
    for (const side of sideRefs.current) if (side) resizeObserver.observe(side)
    if (!reduceMotion) window.addEventListener('scroll', schedule, { passive: true })
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [width, height])

  const side = (position: 'left-0' | 'right-0', mirrored: boolean, index: number) => (
    <div
      ref={(element) => {
        sideRefs.current[index] = element
      }}
      className={`absolute inset-y-0 ${position} overflow-hidden`}
      style={{ width: sideWidth(width), transform: mirrored ? 'scaleX(-1)' : undefined }}
    >
      <div
        ref={(element) => {
          trackRefs.current[index] = element
        }}
        className="absolute inset-x-0 bottom-0 bg-repeat-y will-change-transform"
        style={{
          // Corrected in the effect once the real width of the side is known
          top: -height,
          backgroundImage: `url("${url}")`,
          // The whole image fits the width of the side, the height follows
          backgroundSize: '100% auto'
        }}
      />
    </div>
  )

  return (
    // Shown from the same width as the floating logo of the header (WIDE_QUERY in Navigation/index.tsx)
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden min-[1655px]:block"
      aria-hidden="true"
    >
      {side('left-0', false, 0)}
      {side('right-0', true, 1)}
    </div>
  )
}
