import Link from 'next/link'
import { PDF_PATH } from '@/content/chapters'

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-semibold tracking-tight">
          The Block Universe
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 font-sans text-sm text-muted-foreground">
          <Link href="/contents" className="hover:text-foreground">
            Contents
          </Link>
          <a href={PDF_PATH} download className="hover:text-foreground">
            PDF
          </a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-5 py-8 font-sans text-sm text-muted-foreground sm:px-8">
        The Block Universe
      </div>
    </footer>
  )
}
