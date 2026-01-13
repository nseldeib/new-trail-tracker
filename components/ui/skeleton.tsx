import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
        "bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

function SkeletonStat() {
  return (
    <div className="rounded-lg border p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="rounded-lg border p-6">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="space-y-2">
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonStat, SkeletonChart }
