const ProfileEditSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-black animate-pulse">
    {/* Header Skeleton */}
    <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
      <div className="w-24 h-9 bg-gray-200 dark:bg-gray-800 rounded-full" />
    </div>

    {/* Images Skeleton */}
    <div className="relative">
      <div className="h-40 bg-gray-200 dark:bg-gray-800 w-full" />
      <div className="absolute -bottom-12 left-6">
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-black bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>

    {/* Form Skeleton */}
    <div className="px-6 mt-16 space-y-8">
      <div className="space-y-2">
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="w-full h-24 bg-gray-100 dark:bg-gray-900 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-gray-100 dark:bg-gray-900 rounded-xl" />
        <div className="h-12 bg-gray-100 dark:bg-gray-900 rounded-xl" />
      </div>
      <div className="space-y-4">
        <div className="w-32 h-5 bg-gray-200 dark:bg-gray-800 rounded" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 bg-gray-50 dark:bg-gray-900 rounded-xl"
          />
        ))}
      </div>
    </div>
  </div>
);

export default ProfileEditSkeleton