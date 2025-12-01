export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-96 bg-gray-200 rounded mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
