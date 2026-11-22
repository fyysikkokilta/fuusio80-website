'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { KeyboardEvent, PointerEvent } from 'react'
import { useRef } from 'react'

export interface PlaneSide {
  url: string
  alt: string
  blurDataUrl?: string
  width: number
  height: number
}

interface RotatablePlaneProps {
  front: PlaneSide
  back: PlaneSide
}

// Degrees of turn per pixel of horizontal drag
const DEG_PER_PX = 0.5
// Less movement than this counts as a click, which flips the plane
const CLICK_SLOP_PX = 5
const KEY_STEP_DEG = 30

// A flat plane with an image on each side. The angle lives in a CSS variable set straight on the
// element, so dragging never re-renders React. When released it turns to the nearest side.
export const RotatablePlane = ({ front, back }: RotatablePlaneProps) => {
  const t = useTranslations('rotatablePlane')
  const planeRef = useRef<HTMLDivElement>(null)
  const angle = useRef(0)
  const drag = useRef<{ startX: number; startAngle: number; moved: boolean } | null>(null)

  const apply = (value: number, dragging: boolean) => {
    angle.current = value
    const plane = planeRef.current
    if (!plane) return
    plane.dataset.dragging = String(dragging)
    plane.style.setProperty('--angle', `${value}deg`)
  }

  const snap = () => apply(Math.round(angle.current / 180) * 180, false)

  const handleDown = (event: PointerEvent<HTMLDivElement>) => {
    // Only the primary mouse button, a finger or a pen
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { startX: event.clientX, startAngle: angle.current, moved: false }
  }

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) return
    const dx = event.clientX - current.startX
    if (Math.abs(dx) > CLICK_SLOP_PX) current.moved = true
    if (current.moved) apply(current.startAngle + dx * DEG_PER_PX, true)
  }

  const handleUp = () => {
    const current = drag.current
    drag.current = null
    if (!current) return
    if (current.moved) {
      snap()
    } else {
      // A click or tap turns the plane over
      apply(Math.round(angle.current / 180) * 180 + 180, false)
    }
  }

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      apply(angle.current + (event.key === 'ArrowRight' ? KEY_STEP_DEG : -KEY_STEP_DEG), true)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      apply(Math.round(angle.current / 180) * 180 + 180, false)
    }
  }

  const face = 'absolute inset-0 backface-hidden'

  return (
    <div className="not-prose my-8 flex justify-center">
      <div
        className="w-full max-w-md perspective-distant"
        style={{ aspectRatio: `${front.width} / ${front.height}` }}
      >
        <div
          ref={planeRef}
          role="img"
          tabIndex={0}
          aria-label={front.alt ? `${t('label')}: ${front.alt}` : t('label')}
          aria-describedby="rotatable-plane-hint"
          className="relative size-full transform-[rotateY(var(--angle,0deg))] cursor-grab touch-pan-y rounded-lg transition-transform duration-500 ease-out select-none transform-3d focus-visible:outline-2 focus-visible:outline-offset-4 active:cursor-grabbing data-[dragging=true]:transition-none motion-reduce:transition-none"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onBlur={snap}
          onKeyDown={handleKey}
        >
          <div className={face}>
            <Image
              src={front.url}
              alt={front.alt}
              blurDataURL={front.blurDataUrl}
              placeholder={front.blurDataUrl ? 'blur' : 'empty'}
              fill
              unoptimized
              draggable={false}
              sizes="(max-width: 448px) 100vw, 448px"
              className="rounded-lg object-cover"
            />
          </div>
          <div className={`${face} transform-[rotateY(180deg)]`}>
            <Image
              src={back.url}
              alt={back.alt}
              blurDataURL={back.blurDataUrl}
              placeholder={back.blurDataUrl ? 'blur' : 'empty'}
              fill
              unoptimized
              draggable={false}
              sizes="(max-width: 448px) 100vw, 448px"
              className="rounded-lg object-cover"
            />
          </div>
        </div>
        <p id="rotatable-plane-hint" className="sr-only">
          {t('hint')}
        </p>
      </div>
    </div>
  )
}
