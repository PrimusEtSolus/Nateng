export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 w-32 bg-muted rounded mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
        <div className="h-96 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}
