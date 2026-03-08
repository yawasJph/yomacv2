import { useIsMobile } from "@/hooks/useIsMobile";

export const WalletSkeleton = () => {
  const isMobile = useIsMobile();
  return (
    <div className={`bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3 w-full ${isMobile ? "max-w-full" : "max-w-40"} `}>
      {/* Icono Skeleton */}
      <div className="skeleton w-8 h-8 rounded-lg shrink-0" />

      <div className="flex-1 space-y-2">
        {/* Label: "Tu Saldo" */}
        <div className="skeleton h-2 w-10 rounded" />

        {/* Cantidad: "1,000 CC" */}
        <div className="flex items-baseline gap-1">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-2 w-4 rounded" />
        </div>
      </div>
    </div>
  );
};
