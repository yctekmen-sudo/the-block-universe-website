import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ChapterMeta } from './chapters'

/**
 * Returns the inner markup of the chapter's <article> unchanged.
 * The HTML is trusted editorial content from the manuscript package, never visitor input.
 */
export async function loadChapterHtml(chapter: ChapterMeta) {
  const source = await readFile(path.join(process.cwd(), 'content', chapter.file), 'utf8')
  const article = source.match(/<article[^>]*>([\s\S]*)<\/article>/i)
  if (article) return article[1]
  const body = source.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  return body ? body[1] : source
}
