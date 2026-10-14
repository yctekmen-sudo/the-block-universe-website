import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/book/site-header'
import { TocList } from '@/components/book/toc-list'
import { LightConeDiagram } from '@/components/manuscript'
import { PDF_PATH } from '@/content/chapters'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              A scientific &amp; philosophical manuscript
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl">
              The Block Universe
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-muted-foreground text-pretty">
              An exploration of relativity and the block universe, the direction of time, quantum
              mechanics, free will, and time travel.
            </p>
            <div className="mt-10 flex flex-col gap-4 font-sans sm:flex-row sm:items-center">
              <Link
                href="/read/introduction"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Start Reading
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={PDF_PATH}
                download
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border px-6 text-sm font-medium transition-colors hover:border-brand/50 hover:text-brand"
              >
                <Download className="size-4" aria-hidden="true" />
                Download Complete PDF
              </a>
            </div>
          </div>
          <div className="hidden md:block" aria-hidden="true">
            <div className="rounded-md border bg-card p-8 opacity-90">
              <LightConeDiagram />
            </div>
          </div>
        </section>

        <section id="contents" aria-labelledby="contents-heading" className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
          <h2 id="contents-heading" className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Contents
          </h2>
          <TocList />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
