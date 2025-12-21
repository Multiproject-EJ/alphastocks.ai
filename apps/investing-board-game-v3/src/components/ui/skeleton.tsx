import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rectangular' && 'rounded-md',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-shimmer',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

// Board skeleton for loading state
export function BoardSkeleton() {
  return (
    <div className="board-skeleton flex items-center justify-center h-full">
      <div className="relative w-64 h-64">
        {/* Corner tiles */}
        {[0, 1, 2, 3].map((corner) => (
          <Skeleton
            key={corner}
            className="absolute w-16 h-16"
            style={{
              top: corner < 2 ? 0 : 'auto',
              bottom: corner >= 2 ? 0 : 'auto',
              left: corner % 2 === 0 ? 0 : 'auto',
              right: corner % 2 === 1 ? 0 : 'auto',
            }}
          />
        ))}
        {/* Center */}
        <Skeleton className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24" />
      </div>
    </div>
  );
}

// HUD skeleton
export function HUDSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" width={80} />
        <Skeleton variant="text" width={40} />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={30} />
      </div>
    </div>
  );
}
