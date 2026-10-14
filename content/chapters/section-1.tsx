import { Placeholder, Subsection } from '@/components/manuscript'

export default function Section1() {
  return (
    <>
      <Placeholder>
        <p>
          The authoritative text of Section 1 has not been added yet. Replace this block with the
          manuscript text in <code>content/chapters/section-1.tsx</code>.
        </p>
      </Placeholder>

      <Subsection number="1.1" title="[Placeholder subsection title]" />
      <Placeholder>
        <p>Subsection 1.1 text to be supplied.</p>
      </Placeholder>

      <Subsection number="1.2" title="[Placeholder subsection title]" />
      <Placeholder>
        <p>Subsection 1.2 text to be supplied.</p>
      </Placeholder>
    </>
  )
}
