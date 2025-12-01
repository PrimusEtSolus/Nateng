export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded mb-2" />
      <div className="h-4 w-96 bg-muted rounded mb-8" />
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
