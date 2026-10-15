
import Link from 'next/link'
import { chapters } from '@/content/chapters'
import { cn } from '@/lib/utils'

export function TocList({
  activeSlug,
  variant = 'full',
  onNavigate,
}: {
  activeSlug?: string
  variant?: 'full' | 'compact'
  onNavigate?: () => void
}) {
  if (variant === 'compact') {
    return (
      <ol className="space-y-0.5">
        {chapters.map((c) => {
          const active = c.slug === activeSlug
          return (
            <li key={c.slug}>
              <Link
                href={`/read/${c.slug}`}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-md border-l-2 px-3 py-2 font-sans text-sm leading-snug transition-colors',
                  active
                    ? 'border-brand bg-accent text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                )}
              >
                <span className="block font-medium">{c.label}</span>
                {c.title ? (
                  <span className="mt-0.5 block text-[0.8rem] opacity-80">
                    {c.title}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className="divide-y border-y">
      {chapters.map((c) => {
        const isSection = /^Section \d+$/.test(c.label)
        const isAppendix = /^Appendix [A-Z]$/.test(c.label)
        const sectionNumber = isSection ? c.label.replace('Section ', '') : ''

        const title = isSection
          ? `${sectionNumber}. ${c.title ?? ''}`
          : isAppendix
            ? `${c.label}${c.title ? `: ${c.title}` : ''}`
            : c.title ?? c.label

        return (
          <li key={c.slug}>
            <Link
              href={`/read/${c.slug}`}
              className="group flex items-baseline gap-3 py-5 transition-colors hover:text-brand"
            >
              <span className="flex-1">
                <span className="block text-xl leading-snug text-pretty">
                  {title}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="font-sans text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand"
              >
                {'→'}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
