export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-96 bg-gray-200 rounded mb-8" />
      <div className="flex gap-8">
        <div className="w-64 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
}
