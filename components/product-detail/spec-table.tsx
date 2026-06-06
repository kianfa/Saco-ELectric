interface SpecTableProps {
  specs: { label: string; value: string }[]
}

export function SpecTable({ specs }: SpecTableProps) {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
      {specs.map((spec, index) => (
        <div key={`${spec.label}-${index}`} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] border-b border-border last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:odd:border-l">
          <div className="bg-muted/45 px-4 py-3 text-sm font-bold leading-6 text-muted-foreground">{spec.label}</div>
          <div className="px-4 py-3 text-sm font-medium leading-6 text-foreground">{spec.value}</div>
        </div>
      ))}
    </div>
  )
}
