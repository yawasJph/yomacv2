const UserProfileSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-black animate-pulse">
    {/* Header */}
    <div className="h-[57px] border-b border-gray-100 dark:border-gray-800" />
    {/* Banner */}
    <div className="h-32 md:h-48 bg-gray-200 dark:bg-gray-800" />
    {/* Avatar & Button */}
    <div className="px-4 flex justify-between items-start">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 dark:bg-gray-700 -mt-12 border-4 border-white dark:border-black" />
      <div className="w-24 h-9 bg-gray-200 dark:bg-gray-800 rounded-full mt-4" />
    </div>
    {/* Info */}
    <div className="px-4 mt-6 space-y-4">
      <div className="space-y-2">
        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="w-32 h-4 bg-gray-100 dark:bg-gray-900 rounded" />
      </div>
      <div className="w-full h-16 bg-gray-50 dark:bg-gray-900 rounded-lg" />
      <div className="flex gap-4">
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  </div>
);

export default UserProfileSkeleton;
