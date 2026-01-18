import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Star, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface CompactHUDProps {
  cash: number;
  netWorth: number;
  level: number;
  xp: number;
  xpToNext: number;
  rolls: number;
  stars?: number; // Add stars to the HUD
  cityLevel?: number; // Optional city level for backward compatibility
  spaceBackgroundEnabled?: boolean;
  onToggleSpaceBackground?: () => void;
}

export function CompactHUD({
  cash,
  netWorth,
  level,
  xp,
  xpToNext,
  rolls,
  stars = 0,
  cityLevel = 1,
  spaceBackgroundEnabled = false,
  onToggleSpaceBackground = () => {},
}: CompactHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { muted, toggleMute } = useSound();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-top">
      {/* Collapsed view - single row with all controls */}
      <div 
        className="flex items-center justify-between gap-2 px-3 py-2 bg-background/95 backdrop-blur-md border-b shadow-sm"
      >
        {/* Left side: Money, Level, Stars */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <span className="text-xs font-bold text-green-500 truncate">
            ${cash.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            Lv.{level}
          </span>
          {/* Stars display */}
          <div className="flex items-center gap-0.5">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium">{stars}</span>
          </div>
        </div>
        
        {/* Right side: Controls - Background, Sound, Dice, Expand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Background toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSpaceBackground();
            }}
            className={`p-1 rounded-md transition-colors ${spaceBackgroundEnabled ? 'bg-indigo-500/20 text-indigo-200' : 'hover:bg-accent/20 text-muted-foreground'}`}
            aria-label={spaceBackgroundEnabled ? 'Disable space background' : 'Enable space background'}
            aria-pressed={spaceBackgroundEnabled}
            title={spaceBackgroundEnabled ? 'Background on' : 'Background off'}
          >
            <Sparkles size={14} />
          </button>
          
          {/* Sound Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className={`p-1 rounded-md transition-colors ${!muted ? 'text-primary' : 'hover:bg-accent/20 text-muted-foreground'}`}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title={muted ? 'Sound off' : 'Sound on'}
          >
            {muted ? (
              <VolumeX size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>
          
          {/* Dice display */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10">
            <span className="text-xs">🎲</span>
            <span className="text-xs font-medium">{rolls}</span>
          </div>
          
          {/* Expand/Collapse arrow */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-accent/20 rounded-md transition-colors"
            aria-label={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded view - full stats - HIGHER Z-INDEX to overlay event tracker */}
      {isExpanded && (
        <div className="relative z-[60] px-4 py-3 bg-background/98 backdrop-blur-md border-b shadow-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Net Worth</span>
            <span className="font-medium">${netWorth.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">XP</span>
            <span className="font-medium">{xp} / {xpToNext}</span>
          </div>
          {/* XP progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(xp / xpToNext) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
