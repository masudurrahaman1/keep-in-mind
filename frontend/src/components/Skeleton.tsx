import { cn } from "../lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("skeleton h-4 w-full", className)}
        />
      ))}
    </>
  );
}

export function NoteSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-[24px] space-y-3">
      <Skeleton className="w-3/4 h-5" />
      <div className="space-y-2">
        <Skeleton className="w-full h-3 opacity-60" />
        <Skeleton className="w-full h-3 opacity-60" />
        <Skeleton className="w-1/2 h-3 opacity-60" />
      </div>
      <div className="pt-4 flex justify-between items-center">
        <Skeleton className="w-20 h-3 opacity-40" />
        <Skeleton className="w-8 h-8 rounded-full opacity-40" />
      </div>
    </div>
  );
}
