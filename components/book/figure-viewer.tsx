'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent, WheelEvent } from 'react'
import { Minus, Plus, RotateCcw, X } from 'lucide-react'

type Figure = { src: string; alt: string; label: string; caption: string }
type Point = { x: number; y: number }
type View = { scale: number; x: number; y: number }
type Gesture =
  | { mode: 'drag'; point: Point; view: View }
  | { mode: 'pinch'; midpoint: Point; distance: number; view: View }

const INITIAL_VIEW: View = { scale: 1, x: 0, y: 0 }
const MAX_ZOOM = 6
const FIGURE_LABEL = /Figure\s+(?:[A-Z]\.)?\d+(?:\.\d+)?/i

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * The manuscript is server-rendered HTML. This small client-side enhancement
 * adds accessible open controls to its figures without changing chapter files,
 * embedded SVG captions, or the existing article rendering pipeline.
 */
export function FigureViewer() {
  const [figure, setFigure] = useState<Figure | null>(null)
  const [view, setView] = useState<View>(INITIAL_VIEW)
  const viewRef = useRef<View>(INITIAL_VIEW)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLImageElement | null>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)

  const updateView = useCallback((next: View) => {
    const scale = Math.min(MAX_ZOOM, Math.max(1, next.scale))
    const stage = stageRef.current
    const image = imageRef.current
    const maxX = stage && image
      ? Math.max(0, (image.offsetWidth * scale - stage.clientWidth) / 2)
      : 0
    const maxY = stage && image
      ? Math.max(0, (image.offsetHeight * scale - stage.clientHeight) / 2)
      : 0
    const normalized = {
      scale,
      x: scale === 1 ? 0 : Math.max(-maxX, Math.min(maxX, next.x)),
      y: scale === 1 ? 0 : Math.max(-maxY, Math.min(maxY, next.y)),
    }
    viewRef.current = normalized
    setView(normalized)
  }, [])

  const reset = useCallback(() => updateView(INITIAL_VIEW), [updateView])

  const changeZoom = useCallback((factor: number) => {
    const current = viewRef.current
    updateView({ ...current, scale: current.scale * factor })
  }, [updateView])

  const openFigure = useCallback((image: HTMLImageElement) => {
    const alt = image.alt || 'Manuscript illustration'
    const caption = image.closest('.figure-container')?.querySelector('.figure-caption')?.textContent || ''
    const label = alt.match(FIGURE_LABEL)?.[0] || caption.match(FIGURE_LABEL)?.[0] || 'Illustration'
    openerRef.current = image
    pointers.current.clear()
    gesture.current = null
    viewRef.current = INITIAL_VIEW
    setView(INITIAL_VIEW)
    setFigure({ src: image.currentSrc || image.src, alt, label, caption })
  }, [])

  useEffect(() => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>('.manuscript.book-chapter .figure-container img'),
    )
    const cleanups = images.map((image) => {
      const previous = {
        role: image.getAttribute('role'),
        tabindex: image.getAttribute('tabindex'),
        label: image.getAttribute('aria-label'),
        title: image.getAttribute('title'),
      }
      const label = image.alt.match(FIGURE_LABEL)?.[0]
        || image.closest('.figure-container')?.querySelector('.figure-caption')?.textContent?.match(FIGURE_LABEL)?.[0]
        || 'illustration'
      image.setAttribute('role', 'button')
      image.setAttribute('tabindex', '0')
      image.setAttribute('aria-label', `Enlarge ${label}: ${image.alt}`)
      image.setAttribute('title', 'Enlarge figure')

      const onClick = () => openFigure(image)
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFigure(image)
        }
      }
      image.addEventListener('click', onClick)
      image.addEventListener('keydown', onKeyDown)
      return () => {
        image.removeEventListener('click', onClick)
        image.removeEventListener('keydown', onKeyDown)
        for (const [name, value] of Object.entries({
          role: previous.role,
          tabindex: previous.tabindex,
          'aria-label': previous.label,
          title: previous.title,
        })) {
          if (value === null) image.removeAttribute(name)
          else image.setAttribute(name, value)
        }
      }
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [openFigure])

  useEffect(() => {
    if (!figure) return
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [figure])

  function close() {
    dialogRef.current?.close()
  }

  function onClose() {
    setFigure(null)
    reset()
    pointers.current.clear()
    gesture.current = null
    openerRef.current?.focus()
  }

  function beginGesture() {
    const values = Array.from(pointers.current.values())
    if (values.length >= 2) {
      gesture.current = {
        mode: 'pinch',
        midpoint: midpoint(values[0], values[1]),
        distance: Math.max(1, distance(values[0], values[1])),
        view: viewRef.current,
      }
    } else if (values.length === 1) {
      gesture.current = { mode: 'drag', point: values[0], view: viewRef.current }
    } else {
      gesture.current = null
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    beginGesture()
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const currentGesture = gesture.current
    if (!currentGesture) return
    if (currentGesture.mode === 'drag') {
      if (viewRef.current.scale === 1) return
      const point = pointers.current.get(event.pointerId)!
      updateView({
        ...currentGesture.view,
        x: currentGesture.view.x + point.x - currentGesture.point.x,
        y: currentGesture.view.y + point.y - currentGesture.point.y,
      })
    } else {
      const points = Array.from(pointers.current.values())
      if (points.length < 2) return
      const center = midpoint(points[0], points[1])
      updateView({
        scale: currentGesture.view.scale * distance(points[0], points[1]) / currentGesture.distance,
        x: currentGesture.view.x + center.x - currentGesture.midpoint.x,
        y: currentGesture.view.y + center.y - currentGesture.midpoint.y,
      })
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    beginGesture()
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    // The modal locks background scrolling; React wheel listeners may be passive.
    changeZoom(event.deltaY < 0 ? 1.15 : 1 / 1.15)
  }

  function onDialogKeyDown(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key === '+' || event.key === '=') changeZoom(1.5)
    if (event.key === '-') changeZoom(1 / 1.5)
    if (event.key === '0') reset()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={figure ? `Enlarged ${figure.label}` : 'Figure viewer'}
      onClose={onClose}
      onKeyDown={onDialogKeyDown}
      className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden border-0 bg-slate-950/95 p-0 text-white backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col font-sans">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/20 px-3 py-2 sm:px-5">
          <h2 className="min-w-0 truncate text-sm font-semibold sm:text-base">
            {figure?.label || 'Figure'}
          </h2>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button type="button" aria-label="Zoom out" title="Zoom out" disabled={view.scale <= 1}
              onClick={() => changeZoom(1 / 1.5)}
              className="flex size-11 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40">
              <Minus size={21} aria-hidden="true" />
            </button>
            <span className="w-12 text-center text-xs tabular-nums sm:w-14 sm:text-sm">{Math.round(view.scale * 100)}%</span>
            <button type="button" aria-label="Zoom in" title="Zoom in" disabled={view.scale >= MAX_ZOOM}
              onClick={() => changeZoom(1.5)}
              className="flex size-11 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40">
              <Plus size={21} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Reset zoom" title="Reset zoom" onClick={reset}
              className="flex size-11 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <RotateCcw size={20} aria-hidden="true" />
            </button>
            <button ref={closeRef} type="button" aria-label="Close figure viewer" title="Close (Escape)"
              onClick={close}
              className="flex size-11 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <X size={23} aria-hidden="true" />
            </button>
          </div>
        </header>
        <div
          ref={stageRef}
          className="relative flex min-h-0 flex-1 select-none items-center justify-center overflow-hidden p-4 touch-none"
          style={{ cursor: view.scale > 1 ? 'grab' : 'zoom-in' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onWheel={onWheel}
          onDoubleClick={() => changeZoom(1.5)}
        >
          {figure && (
            <img
              ref={imageRef}
              src={figure.src}
              alt={figure.alt}
              draggable={false}
              onLoad={reset}
              className="max-h-full max-w-full pointer-events-none object-contain"
              style={{
                transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
                transformOrigin: 'center',
              }}
            />
          )}
        </div>
        <footer className="border-t border-white/20 px-4 py-3 text-center text-xs text-slate-300 sm:text-sm">
          {figure?.caption && <p className="mx-auto max-w-4xl pb-2 text-sm text-white">{figure.caption}</p>}
          Zoom with + / − or pinch; drag to pan; press 0 to reset and Escape to close.
        </footer>
      </div>
    </dialog>
  )
}
