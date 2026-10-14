import { Equation, Placeholder, Subsection } from '@/components/manuscript'

export default function AppendixA() {
  return (
    <>
      <Placeholder>
        <p>
          The authoritative text of Appendix A has not been added yet. The equation below is a
          formatting example of a multi-line aligned expression only; it is not manuscript text.
        </p>
      </Placeholder>

      <Subsection number="A.1" title="[Formatting example] Aligned equations" />
      <Equation number="A.1" id="eq-a-1">
        {String.raw`\begin{aligned} S &= E(a,b) - E(a,b') + E(a',b) + E(a',b') \\ |S| &\le 2 \end{aligned}`}
      </Equation>
    </>
  )
}
