import type { ReactNode } from 'react'

/** Numbered subsection heading, e.g. <Subsection number="2.1" title="..." /> */
export function Subsection({
  number,
  title,
  level = 2,
}: {
  number: string
  title: string
  level?: 2 | 3
}) {
  const id = `s-${number.replace(/\./g, '-')}`
  const Tag = level === 2 ? 'h2' : 'h3'
  return (
    <Tag id={id} className="group scroll-mt-24">
      <span className="mr-3 font-sans text-[0.75em] font-medium tabular-nums text-brand">
        {number}
      </span>
      {title}
      <a
        href={`#${id}`}
        className="ml-2 font-sans text-[0.7em] no-underline opacity-0 transition-opacity group-hover:opacity-60 focus:opacity-60"
        aria-label={`Link to section ${number}`}
      >
        #
      </a>
    </Tag>
  )
}

/** Superscript footnote marker linking to the matching <Footnotes> entry. */
export function FootnoteRef({ n }: { n: number }) {
  return (
    <sup id={`fnref-${n}`} className="font-sans text-[0.7em] leading-none">
      <a href={`#fn-${n}`} aria-describedby="footnotes-label" className="!no-underline">
        {n}
      </a>
    </sup>
  )
}

export function Footnotes({ items }: { items: { n: number; content: ReactNode }[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="footnotes-label" className="mt-16 border-t pt-8">
      <h2 id="footnotes-label" className="!mt-0 font-sans !text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Notes
      </h2>
      <ol className="mt-4 space-y-3 text-base leading-relaxed">
        {items.map((item) => (
          <li key={item.n} id={`fn-${item.n}`} className="scroll-mt-24">
            {item.content}{' '}
            <a href={`#fnref-${item.n}`} aria-label={`Back to reference ${item.n}`} className="font-sans text-sm !no-underline">
              {'↩'}
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Bracketed citation linking to the matching <References> entry. */
export function Cite({ n }: { n: number }) {
  return (
    <a href={`#ref-${n}`} className="font-sans text-[0.85em] !no-underline">
      [{n}]
    </a>
  )
}

export function References({ items }: { items: { n: number; content: ReactNode }[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="references-label" className="mt-12 border-t pt-8">
      <h2 id="references-label" className="!mt-0 font-sans !text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        References
      </h2>
      <ol className="mt-4 !list-none space-y-3 !pl-0 text-base leading-relaxed">
        {items.map((item) => (
          <li key={item.n} id={`ref-${item.n}`} className="flex scroll-mt-24 gap-3">
            <span className="shrink-0 font-sans text-sm tabular-nums text-muted-foreground">[{item.n}]</span>
            <span>{item.content}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Figure({
  id,
  number,
  caption,
  children,
}: {
  id?: string
  number: string
  caption: ReactNode
  children: ReactNode
}) {
  return (
    <figure id={id} className="my-10 scroll-mt-24">
      <div className="rounded-md border bg-card p-6">{children}</div>
      <figcaption className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Figure {number}.</span> {caption}
      </figcaption>
    </figure>
  )
}

/** Clearly labeled stand-in for manuscript text that has not been supplied yet. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-brand/40 bg-brand/[0.04] px-5 py-4">
      <p className="font-sans text-xs font-semibold uppercase tracking-widest text-brand">
        Placeholder
      </p>
      <div className="mt-2 font-sans text-base leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}
