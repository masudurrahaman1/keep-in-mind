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

export function CardSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant p-6 rounded-[24px] space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-3 opacity-50" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-4/5 h-3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-6 border-b border-outline-variant/30">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-24 h-3 opacity-50" />
      </div>
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-16 h-8 rounded-lg" />
    </div>
  );
}
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Skeleton className="w-64 h-12" />
        <Skeleton className="w-96 h-6 opacity-50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[450px]">
          <CardSkeleton />
        </div>
        <div className="h-[450px]">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function UserDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 px-4 md:px-0">
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
           <Skeleton className="w-12 h-12 rounded-2xl" />
           <div className="space-y-2">
              <Skeleton className="w-64 h-10" />
              <Skeleton className="w-48 h-4 opacity-50" />
           </div>
        </div>
        <Skeleton className="w-32 h-14 rounded-2xl" />
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-[32px] space-y-6">
           <div className="mx-auto w-32 h-32 rounded-3xl skeleton" />
           <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-32 h-4 opacity-50" />
           </div>
           <div className="pt-6 border-t border-outline-variant/30 space-y-4">
              <Skeleton className="w-full h-16 rounded-2xl opacity-60" />
              <Skeleton className="w-full h-16 rounded-2xl opacity-60" />
           </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-40 rounded-[28px]" />
              <Skeleton className="h-40 rounded-[28px]" />
           </div>
           <div className="glass p-8 rounded-[32px] space-y-4">
              <Skeleton className="w-48 h-6 mb-4" />
              <Skeleton className="w-full h-20 rounded-2xl" />
              <Skeleton className="w-full h-20 rounded-2xl" />
              <Skeleton className="w-full h-20 rounded-2xl" />
           </div>
        </div>
      </div>
    </div>
  );
}
