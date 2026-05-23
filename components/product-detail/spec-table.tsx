interface SpecTableProps {
  specs: { label: string; value: string }[]
}

export function SpecTable({ specs }: SpecTableProps) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <table className="w-full">
        <tbody>
          {specs.map((spec, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-muted/30" : "bg-card"
              } hover:bg-muted/50 transition-colors`}
            >
              <td className="px-4 py-3 text-muted-foreground font-medium border-l border-border w-1/3">
                {spec.label}
              </td>
              <td className="px-4 py-3 text-foreground">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
