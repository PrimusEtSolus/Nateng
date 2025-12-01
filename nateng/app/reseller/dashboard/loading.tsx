export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-5 w-96 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl" />
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
}
