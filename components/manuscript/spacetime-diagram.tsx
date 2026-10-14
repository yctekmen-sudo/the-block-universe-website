/** Simple Minkowski light-cone diagram used as a figure formatting example. */
export function LightConeDiagram() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="mx-auto h-auto w-full max-w-md font-sans text-foreground"
      role="img"
      aria-label="Spacetime diagram: a vertical time axis, a horizontal space axis, and two diagonal light-cone lines crossing at the origin event."
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
      </defs>
      <polygon points="200,150 70,20 330,20" fill="var(--brand)" opacity="0.08" />
      <polygon points="200,150 70,280 330,280" fill="var(--brand)" opacity="0.08" />
      <line x1="200" y1="285" x2="200" y2="15" stroke="currentColor" strokeWidth="1.25" markerEnd="url(#arrow)" />
      <line x1="30" y1="150" x2="375" y2="150" stroke="currentColor" strokeWidth="1.25" markerEnd="url(#arrow)" />
      <line x1="70" y1="280" x2="330" y2="20" stroke="var(--brand)" strokeWidth="1.25" strokeDasharray="5 4" />
      <line x1="70" y1="20" x2="330" y2="280" stroke="var(--brand)" strokeWidth="1.25" strokeDasharray="5 4" />
      <circle cx="200" cy="150" r="4" fill="currentColor" />
      <text x="210" y="22" fontSize="13" fontStyle="italic">ct</text>
      <text x="368" y="170" fontSize="13" fontStyle="italic">x</text>
      <text x="200" y="60" fontSize="12" textAnchor="middle" fill="var(--muted-foreground)">future</text>
      <text x="200" y="250" fontSize="12" textAnchor="middle" fill="var(--muted-foreground)">past</text>
      <text x="300" y="140" fontSize="12" textAnchor="middle" fill="var(--muted-foreground)">elsewhere</text>
    </svg>
  )
}
