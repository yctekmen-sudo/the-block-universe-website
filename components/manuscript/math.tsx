import katex from 'katex'

function render(tex: string, displayMode: boolean) {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
  })
}

/** Inline math, e.g. <M>{String.raw`E = mc^2`}</M> */
export function M({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={{ __html: render(children, false) }} />
}

/**
 * Display equation with an optional number and anchor id.
 * Reference it elsewhere with <a href="#eq-1-1">(1.1)</a>.
 */
export function Equation({
  children,
  number,
  id,
}: {
  children: string
  number?: string
  id?: string
}) {
  return (
    <div
      id={id}
      className="relative my-6 flex items-center gap-4"
      role="math"
      aria-label={children}
    >
      <div
        className="min-w-0 flex-1"
        dangerouslySetInnerHTML={{ __html: render(children, true) }}
      />
      {number ? (
        <span className="shrink-0 font-sans text-sm tabular-nums text-muted-foreground">
          ({number})
        </span>
      ) : null}
    </div>
  )
}
