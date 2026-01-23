import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Sparkles, Star, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import { formatCoins } from '@/lib/coins';

// Z-index constants for layering
const Z_INDEX_HUD = 120
const Z_INDEX_HUD_EXPANDED = 130 // Higher than event tracker (40)

interface CompactHUDProps {
  cash: number;
  netWorth: number;
  level: number;
  xp: number;
  xpToNext: number;
  rolls: number;
  stars?: number; // Add stars to the HUD
  coins?: number;
  seasonPoints?: number;
  cityLevel?: number; // Optional city level for backward compatibility
  spaceBackgroundEnabled?: boolean;
  onToggleSpaceBackground?: () => void;
  onOpenSettings?: () => void;
}

export function CompactHUD({
  cash,
  netWorth,
  level,
  xp,
  xpToNext,
  rolls,
  stars = 0,
  coins = 0,
  seasonPoints = 0,
  cityLevel = 1,
  spaceBackgroundEnabled = false,
  onToggleSpaceBackground = () => {},
  onOpenSettings = () => {},
}: CompactHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { muted, toggleMute } = useSound();
  const xpGoal = Math.max(xpToNext, 1);
  const xpProgress = Math.min((xp / xpGoal) * 100, 100);

  const expandedStats = useMemo(() => ({
    primary: [
      { label: 'Cash', value: `$${cash.toLocaleString()}`, icon: '💵', accent: 'text-green-500' },
      { label: 'Stars', value: stars.toLocaleString(), icon: '⭐', accent: 'text-yellow-400' },
      { label: 'Coins', value: formatCoins(coins), icon: '🪙', accent: 'text-amber-500' },
      { label: 'Season Points', value: `${seasonPoints.toLocaleString()} SP`, icon: '🏆', accent: 'text-purple-300' },
      { label: 'Rolls', value: rolls.toLocaleString(), icon: '🎲', accent: 'text-blue-300' },
    ],
    secondary: [
      { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, icon: '📈', accent: 'text-emerald-300' },
    ],
  }), [cash, coins, netWorth, rolls, seasonPoints, stars]);

  return (
    <div className={`fixed top-0 left-0 right-0 safe-top`} style={{ zIndex: Z_INDEX_HUD }}>
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

          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="p-1 rounded-md transition-colors hover:bg-accent/20 text-muted-foreground"
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={14} />
          </button>
          
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
        <div className="relative px-4 py-3 bg-background/98 backdrop-blur-md border-b shadow-lg space-y-2" style={{ zIndex: Z_INDEX_HUD_EXPANDED }}>
          <div className="grid gap-2 text-sm">
            {expandedStats.primary.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-base">{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
                <span className={`font-medium ${stat.accent}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-white/10 bg-muted/30 px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-medium">{xp} / {xpGoal}</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
          {expandedStats.secondary.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-base">{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
              <span className={`font-medium ${stat.accent}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
