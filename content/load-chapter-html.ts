
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ChapterMeta } from './chapters'

/**
 * Returns the chapter's article markup, with normalized
 * top-level section numbering for website presentation.
 */
export async function loadChapterHtml(chapter: ChapterMeta) {
  const source = await readFile(
    path.join(process.cwd(), 'content', chapter.file),
    'utf8',
  )

  const article = source.match(/<article[^>]*>([\s\S]*)<\/article>/i)
  const body = source.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const html = article ? article[1] : body ? body[1] : source

  if (!/^Section \d+$/.test(chapter.label)) {
    return html
  }

  const sectionNumber = chapter.label.replace('Section ', '')
  const heading = `${sectionNumber}. ${chapter.title ?? ''}`.trim()

  return html.replace(
    /<h1\b([^>]*)>[\s\S]*?<\/h1>/i,
    (_match, attributes: string) =>
      `<h1${attributes}><strong>${heading}</strong></h1>`,
  )
}
