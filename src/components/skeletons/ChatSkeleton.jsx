import { useIsMobile } from "@/hooks/useIsMobile";

const destockArray = [1, 2, 3, 4, 5, 6, 7];
const movileArray = [1, 2, 3, 4, 5];

export const ChatSkeleton = () => {
  const isMobile = useIsMobile();
  const array = isMobile ? movileArray : destockArray;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
      {array.map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}
        >
          <div className="flex flex-col gap-2 max-w-[70%]">
            {/* Burbuja del mensaje */}
            <div
              className={`skeleton h-12 rounded-2xl ${
                i % 2 === 0
                  ? "bg-indigo-100 dark:bg-indigo-900/20 w-48 rounded-br-none"
                  : "bg-zinc-100 dark:bg-zinc-800 w-64 rounded-bl-none"
              }`}
            />
            {/* Simulación de la hora/fecha */}
            <div
              className={`skeleton h-2 w-10 bg-zinc-200 dark:bg-zinc-800 rounded mx-2 ${i % 2 === 0 ? "self-end" : "self-start"}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
