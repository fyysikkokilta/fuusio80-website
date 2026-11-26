'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type CSSProperties, useEffect, useRef, useState } from 'react'

import type { MainNavigation } from '@/payload-types'

import { DesktopMenu } from './DesktopMenu'
import { MobileMenu } from './MobileMenu'
import { useNavigation } from './NavigationProvider'

// Scrolling this far after the header was brought back with the logo hides it again
const HIDE_AFTER_SCROLL_PX = 80
// Ignore scroll movements smaller than this when deciding whether the user scrolls up or down
const DIRECTION_SLOP_PX = 6
// From this width on there is room for the logo beside the center column (max-w-7xl)
const WIDE_QUERY = '(min-width: 1655px)'

// The floating logo flies between its resting place (in the middle of the free space left of the
// center column, near the top of the window) and the place of the logo in the header. While it
// flies it stays fully opaque, so it looks like the header's own logo travelling. Its box is always
// LOGO_PX wide; at the header it is scaled down to the header logo's height.
const LOGO_PX = 100
const REST_TOP_PX = 16
const HEADER_LOGO_HEIGHT_PX = 48
// Space above the logo in the header: the top line (1px) and the padding below it (4px)
const HEADER_LOGO_TOP_PX = 5
// NOTE: the flight assumes the header's logo fills the full height of the navigation bar: 48px
// tall (h-12, width follows the image; see NavbarBrand), at the very top, with its left edge
// HEADER_LOGO_INSET_PX in from the column edge. If the header logo image has empty space around it,
// the floating logo will not line up with it at the swap. The same applies when the floating logo
// is a different image than the header logo.
// The center column (max-w-7xl) and the left padding of the header menu inside it (xl:px-12)
const COLUMN_PX = 1280
// The header menus stop at the same points as the content below them (the p-6 of the page content)
const HEADER_SIDE_BUFFER_PX = 24
const HEADER_LOGO_INSET_PX = HEADER_SIDE_BUFFER_PX + 48
const FLIGHT_MS = 600
const FLIGHT_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const FADE_MS = 400

/**
 * Where the floating logo is in its life:
 * - away: not shown; waits at the header logo's place, ready to fly out when the header docks
 * - rest: shown at its resting place
 * - toHeader: flying to the header, which slides in as it goes
 * - atHeader: arrived; the header's own logo takes over and the floating one is hidden
 * - fading: the header came back into the page, so the logo just fades out where it is
 */
type LogoPhase = 'away' | 'rest' | 'toHeader' | 'atHeader' | 'fading'

// px-6 matches the p-6 of the page content, so the lines of the menu start and end where the content
// does. A docked header gets the same buffer from its own, narrower width, so it passes buffer={false}.
const HeaderMenus = ({
  navigation,
  buffer = true
}: {
  navigation: MainNavigation
  buffer?: boolean
}) => (
  <div className={buffer ? 'px-6' : undefined}>
    <DesktopMenu navigation={navigation} />
    <MobileMenu navigation={navigation} />
  </div>
)

/** A plain bar that stays at the top of the window. Used where there is no page layout (404, errors). */
export const PlainHeader = () => {
  const navigation = useNavigation()

  return (
    <header className="bg-fuusio-darkblue/85 text-fk-white sticky top-0 z-50 w-full backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl">
        <HeaderMenus navigation={navigation} />
      </div>
    </header>
  )
}

/**
 * The header of a page. It sits in the page, as wide as its column. Once scrolled past it is
 * docked: it leaves the page flow, hides above the window, and comes back
 * - on wide screens by hovering or clicking the logo that appears left of the center column,
 *   and goes away again after a little scrolling
 * - on other screens by scrolling up, and goes away again when scrolling down.
 * Scroll state lives in refs and is only copied to React state when something changes.
 */
export const SiteHeader = () => {
  const navigation = useNavigation()
  const t = useTranslations('mainNavigation')
  const slotRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const dockedRef = useRef(false)
  const shownRef = useRef(false)
  const revealRef = useRef<(() => void) | null>(null)
  const [height, setHeight] = useState<number>()
  const [docked, setDocked] = useState(false)
  const [shown, setShown] = useState(false)
  const [phase, setPhase] = useState<LogoPhase>('away')
  // Width of the window without the scrollbar, which is what the page is laid out in
  const [viewportWidth, setViewportWidth] = useState(1655)

  useEffect(() => {
    const slot = slotRef.current
    const header = headerRef.current
    if (!slot || !header) return

    // The slot keeps the header's height while the header itself is docked, so the page does not jump
    const observer = new ResizeObserver(() => setHeight(header.offsetHeight))
    observer.observe(header)

    const measure = () => setViewportWidth(document.documentElement.clientWidth)
    measure()
    window.addEventListener('resize', measure)

    const wide = window.matchMedia(WIDE_QUERY)
    let lastY = window.scrollY
    let revealedAt = 0
    let frame = 0

    let logoPhase: LogoPhase = 'away'
    let phaseTimer: number | undefined
    const goTo = (next: LogoPhase, afterMs?: number, then?: LogoPhase) => {
      window.clearTimeout(phaseTimer)
      logoPhase = next
      setPhase(next)
      if (afterMs !== undefined && then) {
        phaseTimer = window.setTimeout(() => {
          logoPhase = then
          setPhase(then)
        }, afterMs)
      }
    }

    const update = (nextDocked: boolean, nextShown: boolean) => {
      const wasDocked = dockedRef.current
      const wasShown = shownRef.current

      if (nextDocked && !wasDocked) {
        // At the moment of docking the header is still at the top of the window: do not animate it
        // sliding out.
        header.style.transition = 'none'
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            header.style.transition = ''
          })
        )
      }
      if (nextDocked !== wasDocked) {
        dockedRef.current = nextDocked
        setDocked(nextDocked)
      }
      if (nextShown !== wasShown) {
        shownRef.current = nextShown
        setShown(nextShown)
      }

      if (nextDocked && !wasDocked) {
        goTo('rest')
      } else if (!nextDocked && wasDocked) {
        // Back in the page, where the header is not at the top of the window: only fade the logo
        if (logoPhase === 'rest') goTo('fading', FADE_MS, 'away')
        else goTo('away')
      } else if (nextDocked && nextShown && !wasShown) {
        goTo('toHeader', FLIGHT_MS, 'atHeader')
      } else if (nextDocked && !nextShown && wasShown) {
        goTo('rest')
      }
    }

    revealRef.current = () => {
      if (!dockedRef.current || shownRef.current) return
      revealedAt = window.scrollY
      update(true, true)
    }

    const check = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      const { top, bottom } = slot.getBoundingClientRect()

      if (!dockedRef.current) {
        // Dock once the header has scrolled completely out of view
        if (bottom <= 0) update(true, false)
      } else if (top >= 0) {
        // Back at the header's place in the page
        update(false, false)
      } else if (wide.matches) {
        if (shownRef.current && Math.abs(y - revealedAt) > HIDE_AFTER_SCROLL_PX) {
          update(true, false)
        }
      } else if (Math.abs(delta) >= DIRECTION_SLOP_PX) {
        update(true, delta < 0)
      }

      if (Math.abs(delta) >= DIRECTION_SLOP_PX) lastY = y
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // The page may open already scrolled down
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      window.clearTimeout(phaseTimer)
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const logo = [navigation.floatingLogo, navigation.logo].find(
    (image) => typeof image === 'object' && image?.url
  )
  const logoImage = typeof logo === 'object' ? logo : null

  const logoAspect = logoImage?.width && logoImage.height ? logoImage.height / logoImage.width : 1
  // Positions in pixels, measured from the left edge of the window
  const restLeft = (viewportWidth - COLUMN_PX) / 4 - LOGO_PX / 2
  const headerLogoLeft = (viewportWidth - COLUMN_PX) / 2 + HEADER_LOGO_INSET_PX
  const atRest: CSSProperties = { translate: '0px 0px', scale: 1 }
  const atHeader: CSSProperties = {
    translate: `${headerLogoLeft - restLeft}px ${HEADER_LOGO_TOP_PX - REST_TOP_PX}px`,
    // The floating logo is as tall as the header logo at the header: a box LOGO_PX wide is
    // LOGO_PX * aspect tall (aspect = height / width of its image)
    scale: HEADER_LOGO_HEIGHT_PX / (LOGO_PX * logoAspect)
  }
  const flight = `translate ${FLIGHT_MS}ms ${FLIGHT_EASING}, scale ${FLIGHT_MS}ms ${FLIGHT_EASING}, opacity 0s`
  // A transition belongs to the state the logo moves into
  const logoStyles: Record<LogoPhase, CSSProperties> = {
    away: { ...atHeader, opacity: 0, transition: 'none' },
    rest: { ...atRest, opacity: 1, transition: flight },
    toHeader: { ...atHeader, opacity: 1, transition: flight },
    atHeader: { ...atHeader, opacity: 0, transition: 'none' },
    fading: { ...atRest, opacity: 0, transition: `opacity ${FADE_MS}ms ease-out` }
  }

  return (
    <>
      <div ref={slotRef} className="w-full" style={{ minHeight: height }}>
        <div
          className={
            docked
              ? 'pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center'
              : undefined
          }
        >
          <header
            ref={headerRef}
            // Tabbing into a hidden header brings it into view
            onFocusCapture={() => revealRef.current?.()}
            className={`text-fk-white ${
              // The docked background stops at the same points as the menu lines: 3rem is the
              // buffer (px-6) on both sides
              docked ? 'w-[calc(100%-3rem)] max-w-[calc(80rem-3rem)]' : 'w-full max-w-7xl'
            } ${
              docked
                ? `bg-fuusio-darkblue/90 pointer-events-auto shadow-lg backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    shown ? 'translate-y-0' : '-translate-y-full'
                  }`
                : ''
            } ${
              // On wide screens the floating logo stands in for the header's logo while it is
              // away from the header
              docked && phase !== 'atHeader' ? 'min-[1655px]:[&_.brand-logo]:invisible' : ''
            }`}
          >
            <HeaderMenus navigation={navigation} buffer={!docked} />
          </header>
        </div>
      </div>

      {/* Resting place: centered sideways in the free space left of the center column, near the
          top of the window. Above the docked header (z-50), so the logo is not hidden behind it
          while it flies to and from the header. */}
      <div
        className="pointer-events-none fixed z-60 hidden min-[1655px]:block"
        style={{ left: restLeft, top: REST_TOP_PX, width: LOGO_PX }}
      >
        <button
          type="button"
          aria-label={t('showMenu')}
          inert={phase !== 'rest'}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') revealRef.current?.()
          }}
          onClick={() => revealRef.current?.()}
          className={`block w-full origin-top-left cursor-pointer motion-reduce:transition-none! ${
            phase === 'rest' ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={logoStyles[phase]}
        >
          {logoImage?.url && logoImage.width && logoImage.height ? (
            <Image
              src={logoImage.url}
              alt=""
              unoptimized
              width={logoImage.width}
              height={logoImage.height}
              className="h-auto w-full drop-shadow-lg"
            />
          ) : (
            <span className="bg-fuusio-darkblue/85 font-display text-glow block rounded-full px-4 py-2 text-center text-2xl backdrop-blur-md">
              {navigation.title}
            </span>
          )}
        </button>
      </div>
    </>
  )
}
