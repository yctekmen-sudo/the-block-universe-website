import type { ComponentType } from 'react'

export type ChapterMeta = {
  slug: string
  /** Short label shown in navigation, e.g. "Section 2" */
  label: string
  /** Full title; null when the chapter has only a label */
  title: string | null
  /** Used for the page meta description */
  description: string
}

/**
 * Order here defines the table of contents and previous/next navigation.
 * Each chapter's text lives in its own file under content/chapters/.
 */
export const chapters: ChapterMeta[] = [
  {
    slug: 'introduction',
    label: 'Introduction',
    title: null,
    description: 'Introduction to The Block Universe.',
  },
  {
    slug: 'section-1',
    label: 'Section 1',
    title: null,
    description: 'Section 1 of The Block Universe.',
  },
  {
    slug: 'section-2',
    label: 'Section 2',
    title: 'The Block Universe and the Direction of the Flow of Time',
    description: 'Section 2 of The Block Universe: the block universe and the direction of the flow of time.',
  },
  {
    slug: 'section-3',
    label: 'Section 3',
    title: 'Static Laws of Physics in the Block Universe',
    description: 'Section 3 of The Block Universe: static laws of physics in the block universe.',
  },
  {
    slug: 'section-4',
    label: 'Section 4',
    title: 'The Block Universe and Quantum Mechanics',
    description: 'Section 4 of The Block Universe: the block universe and quantum mechanics.',
  },
  {
    slug: 'section-5',
    label: 'Section 5',
    title: 'The Block Universe and Free Will',
    description: 'Section 5 of The Block Universe: the block universe and free will.',
  },
  {
    slug: 'section-6',
    label: 'Section 6',
    title: 'The Block Universe and Time Travel',
    description: 'Section 6 of The Block Universe: the block universe and time travel.',
  },
  {
    slug: 'appendix-a',
    label: 'Appendix A',
    title: 'CHSH Analysis',
    description: 'Appendix A of The Block Universe: CHSH analysis.',
  },
]

export function chapterHeading(c: ChapterMeta) {
  return c.title ? `${c.label}: ${c.title}` : c.label
}

export function getChapter(slug: string) {
  const index = chapters.findIndex((c) => c.slug === slug)
  if (index === -1) return null
  return {
    chapter: chapters[index],
    index,
    prev: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
  }
}

export const chapterContent: Record<string, () => Promise<{ default: ComponentType }>> = {
  introduction: () => import('./chapters/introduction'),
  'section-1': () => import('./chapters/section-1'),
  'section-2': () => import('./chapters/section-2'),
  'section-3': () => import('./chapters/section-3'),
  'section-4': () => import('./chapters/section-4'),
  'section-5': () => import('./chapters/section-5'),
  'section-6': () => import('./chapters/section-6'),
  'appendix-a': () => import('./chapters/appendix-a'),
}

export const PDF_PATH = '/the-block-universe.pdf'
