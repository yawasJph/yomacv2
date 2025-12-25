
const ConnectionsSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-1/4" />
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>
    ))}
  </div>
  )
}

export default ConnectionsSkeleton