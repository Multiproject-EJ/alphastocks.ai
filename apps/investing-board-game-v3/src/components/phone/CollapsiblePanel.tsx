import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsiblePanelProps {
  children: ReactNode;
  side: 'left' | 'right';
  title: string;
}

export function CollapsiblePanel({ children, side, title }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isLeft = side === 'left';
  const Icon = isOpen 
    ? (isLeft ? ChevronLeft : ChevronRight)
    : (isLeft ? ChevronRight : ChevronLeft);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed top-1/2 -translate-y-1/2 z-30',
          'w-8 h-16 rounded-r-lg',
          'bg-background/90 backdrop-blur-sm border',
          'flex items-center justify-center',
          isLeft ? 'left-0 rounded-l-none' : 'right-0 rounded-r-none',
        )}
        aria-label={`${isOpen ? 'Close' : 'Open'} ${title}`}
      >
        <Icon size={20} />
      </button>

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 bottom-14 z-20',
          'w-64 bg-background border-r',
          'transition-transform duration-300 ease-out',
          'safe-top safe-bottom',
          'overflow-y-auto',
          isLeft ? 'left-0' : 'right-0 border-l border-r-0',
          isOpen 
            ? 'translate-x-0' 
            : isLeft ? '-translate-x-full' : 'translate-x-full',
        )}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg mb-4">{title}</h2>
          {children}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
