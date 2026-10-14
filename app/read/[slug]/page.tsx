import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChapterPager } from '@/components/book/chapter-pager'
import { chapterContent, chapterHeading, chapters, getChapter } from '@/content/chapters'

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
  const load = chapterContent[slug]
  if (!found || !load) notFound()

  const { chapter, prev, next } = found
  const { default: Content } = await load()

  return (
    <main className="px-5 py-12 sm:px-8 lg:py-20">
      <article className="mx-auto max-w-[750px]">
        <header className="mb-12 border-b pb-10">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {chapter.label}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
            {chapter.title ?? chapter.label}
          </h1>
        </header>
        <div className="manuscript">
          <Content />
        </div>
        <ChapterPager prev={prev} next={next} />
      </article>
    </main>
  )
}
