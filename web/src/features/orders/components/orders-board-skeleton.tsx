const cards = Array.from({ length: 4 }, (_, index) => index);

export default function OrdersBoardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-10 w-72 rounded-md bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-40 rounded-md bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {cards.map((card) => (
            <div key={card} className="h-28 rounded-lg border bg-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
