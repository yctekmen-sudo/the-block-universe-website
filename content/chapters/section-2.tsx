import {
  Cite,
  Equation,
  Figure,
  FootnoteRef,
  Footnotes,
  LightConeDiagram,
  M,
  Placeholder,
  References,
  Subsection,
} from '@/components/manuscript'

export default function Section2() {
  return (
    <>
      <Placeholder>
        <p>
          The authoritative text of Section 2 has not been added yet. The material below is a
          formatting example only &mdash; it demonstrates numbered subsections, equations,
          footnotes, citations, and figures. It is not manuscript text.
        </p>
      </Placeholder>

      <Subsection number="2.1" title="[Formatting example] Equations" />
      <p>
        Inline math is written as <M>{String.raw`ds^2`}</M>, and display equations can be numbered
        and linked, as in equation <a href="#eq-2-1">(2.1)</a>
        <FootnoteRef n={1} />:
      </p>
      <Equation number="2.1" id="eq-2-1">
        {String.raw`ds^2 = -c^2\,dt^2 + dx^2 + dy^2 + dz^2`}
      </Equation>
      <p>
        Citations appear in brackets and link to the reference list at the end of the chapter{' '}
        <Cite n={1} />.
      </p>

      <Subsection number="2.2" title="[Formatting example] Figures" />
      <Figure number="2.1" id="fig-2-1" caption="Formatting example of a spacetime diagram with a light cone.">
        <LightConeDiagram />
      </Figure>

      <Subsection number="2.2.1" title="[Formatting example] Nested subsection" level={3} />
      <Placeholder>
        <p>Subsection text to be supplied.</p>
      </Placeholder>

      <Footnotes
        items={[{ n: 1, content: 'Example footnote. Replace with the manuscript’s footnote text.' }]}
      />
      <References
        items={[{ n: 1, content: 'Example reference entry. Replace with the manuscript’s citation.' }]}
      />
    </>
  )
}
