import manifest from './chapters.json'

export type ChapterMeta = {
  slug: string
  /** Short label shown in navigation, e.g. "Section 2" */
  label: string
  /** Full title; null when the chapter has only a label */
  title: string | null
  /** Used for the page meta description */
  description: string
  /** Path to the chapter HTML, relative to content/ */
  file: string
}

type ManifestEntry = { slug: string; title: string; file: string }

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function splitTitle(rawTitle: string): { label: string; title: string | null } {
  const full = normalize(rawTitle)
  const section = full.match(/^(\d+)\s+(.+)$/)
  if (section) return { label: `Section ${section[1]}`, title: section[2] }
  const appendix = full.match(/^Appendix\s+([A-Z])\.?\s*(.*)$/)
  if (appendix) return { label: `Appendix ${appendix[1]}`, title: appendix[2] || null }
  return { label: full, title: null }
}

/** Order comes from chapters.json and defines the table of contents and previous/next navigation. */
export const chapters: ChapterMeta[] = (manifest as ManifestEntry[]).map((entry) => {
  const { label, title } = splitTitle(entry.title)
  return {
    slug: entry.slug,
    label,
    title,
    description: title ? `${label} of The Block Universe: ${title}.` : `${label} to The Block Universe.`,
    file: entry.file,
  }
})

export function chapterHeading(c: ChapterMeta) {
  if (c.label.startsWith('Section ')) {
    return `${c.label.replace('Section ', '')}. ${c.title ?? ''}`.trim()
  }
  if (c.label.startsWith('Appendix ')) {
    return c.title ? `${c.label}: ${c.title}` : c.label
  }
  return c.title ?? c.label
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

export const PDF_PATH = "/The%20Block%20Universe.pdf"
