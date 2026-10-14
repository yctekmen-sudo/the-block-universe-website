import Link from 'next/link'
import { ArrowLeft, ArrowRight, List } from 'lucide-react'
import type { ChapterMeta } from '@/content/chapters'

function PagerLink({ chapter, direction }: { chapter: ChapterMeta; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next'
  return (
    <Link
      href={`/read/${chapter.slug}`}
      rel={direction}
      className={`group flex flex-1 flex-col gap-1 rounded-md border p-4 transition-colors hover:border-brand/50 hover:bg-card ${isNext ? 'items-end text-right' : 'items-start'}`}
    >
      <span className="flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {!isNext && <ArrowLeft className="size-3.5" aria-hidden="true" />}
        {isNext ? 'Next chapter' : 'Previous chapter'}
        {isNext && <ArrowRight className="size-3.5" aria-hidden="true" />}
      </span>
      <span className="text-lg leading-snug group-hover:text-brand">
        {chapter.title ?? chapter.label}
      </span>
    </Link>
  )
}

export function ChapterPager({ prev, next }: { prev: ChapterMeta | null; next: ChapterMeta | null }) {
  return (
    <nav aria-label="Chapter navigation" className="mt-20 border-t pt-10">
      <div className="flex flex-col gap-3 sm:flex-row">
        {prev ? <PagerLink chapter={prev} direction="prev" /> : <div className="hidden flex-1 sm:block" />}
        {next ? <PagerLink chapter={next} direction="next" /> : <div className="hidden flex-1 sm:block" />}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/contents"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-brand"
        >
          <List className="size-4" aria-hidden="true" />
          Return to contents
        </Link>
      </div>
    </nav>
  )
}
