export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-96 bg-gray-200 rounded mb-8" />
      <div className="h-12 w-full bg-gray-200 rounded mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
