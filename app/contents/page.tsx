import type { Metadata } from 'next'
import { Download } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/book/site-header'
import { TocList } from '@/components/book/toc-list'
import { PDF_PATH } from '@/content/chapters'

export const metadata: Metadata = {
  title: 'Contents',
  description: 'Table of contents for The Block Universe.',
  alternates: { canonical: '/contents' },
}

export default function ContentsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:py-24">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          The Block Universe
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Contents</h1>
        <div className="mt-12">
          <TocList />
        </div>
        <a
          href={PDF_PATH}
          download
          className="mt-10 inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-brand"
        >
          <Download className="size-4" aria-hidden="true" />
          Download complete PDF
        </a>
      </main>
      <SiteFooter />
    </>
  )
}
