const rows = Array.from({ length: 6 }, (_, index) => index);

type Props = {
  columns: number;
};

export default function TableSkeleton({ columns }: Props) {
  const cells = Array.from({ length: columns }, (_, index) => index);
  return (
    <div className="animate-pulse overflow-x-auto rounded-lg border bg-card shadow-xs">
      <table className="w-full border-collapse">
        <thead className="border-b bg-muted/60">
          <tr>
            {cells.map((cell) => (
              <th key={cell} className="px-4 py-3">
                <div className="h-3 w-20 rounded-md bg-border" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-t">
              {cells.map((cell) => (
                <td key={cell} className="px-4 py-3">
                  <div className="h-5 w-24 rounded-md bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
