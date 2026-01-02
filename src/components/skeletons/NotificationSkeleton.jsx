
const NotificationSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-24 h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
              <div className="w-12 h-2 bg-gray-100 dark:bg-neutral-800 rounded" />
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-neutral-800 rounded" />
            <div className="w-3/4 h-3 bg-gray-100 dark:bg-neutral-800 rounded border-l-2 border-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
