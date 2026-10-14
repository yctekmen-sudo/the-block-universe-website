'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Download, Menu, X } from 'lucide-react'
import { TocList } from './toc-list'
import { PDF_PATH } from '@/content/chapters'

function useActiveSlug() {
  const pathname = usePathname()
  return pathname.split('/')[2]
}

export function DesktopSidebar() {
  const activeSlug = useActiveSlug()
  return (
    <aside className="hidden w-72 shrink-0 border-r lg:block">
      <div className="sticky top-0 flex h-dvh flex-col overflow-y-auto px-5 py-8">
        <Link href="/" className="px-3 text-lg font-semibold tracking-tight">
          The Block Universe
        </Link>
        <nav aria-label="Table of contents" className="mt-8 flex-1">
          <p className="mb-2 px-3 font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Contents
          </p>
          <TocList variant="compact" activeSlug={activeSlug} />
        </nav>
        <a
          href={PDF_PATH}
          download
          className="mt-6 flex items-center gap-2 rounded-md px-3 py-2 font-sans text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Download className="size-4" aria-hidden="true" />
          Download complete PDF
        </a>
      </div>
    </aside>
  )
}

export function MobileHeader() {
  const activeSlug = useActiveSlug()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          The Block Universe
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-toc"
          className="flex items-center gap-2 rounded-md px-3 py-2 font-sans text-sm hover:bg-accent"
        >
          {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          Contents
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-toc"
          aria-label="Table of contents"
          className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t bg-background px-3 pb-6 pt-3"
        >
          <TocList variant="compact" activeSlug={activeSlug} onNavigate={() => setOpen(false)} />
          <a
            href={PDF_PATH}
            download
            className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 font-sans text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Download className="size-4" aria-hidden="true" />
            Download complete PDF
          </a>
        </nav>
      ) : null}
    </header>
  )
}
