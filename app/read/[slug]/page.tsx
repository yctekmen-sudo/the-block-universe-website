import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChapterPager } from '@/components/book/chapter-pager'
import { chapterHeading, chapters, getChapter } from '@/content/chapters'
import { loadChapterHtml } from '@/content/load-chapter-html'

export const dynamicParams = false

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/read/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const found = getChapter(slug)
  if (!found) return {}
  const title = chapterHeading(found.chapter)
  return {
    title,
    description: found.chapter.description,
    alternates: { canonical: `/read/${slug}` },
    openGraph: { title: `${title} · The Block Universe`, description: found.chapter.description, type: 'article' },
  }
}

export default async function ChapterPage({ params }: PageProps<'/read/[slug]'>) {
  const { slug } = await params
  const found = getChapter(slug)
  if (!found) notFound()

  const { chapter, prev, next } = found
  const html = await loadChapterHtml(chapter)

  return (
    <main className="px-5 py-12 sm:px-8 lg:py-20">
      <article className="mx-auto max-w-[750px]">
        <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {chapter.label}
        </p>
        <div className="manuscript book-chapter" dangerouslySetInnerHTML={{ __html: html }} />
        <ChapterPager prev={prev} next={next} />
      </article>
    </main>
  )
}
