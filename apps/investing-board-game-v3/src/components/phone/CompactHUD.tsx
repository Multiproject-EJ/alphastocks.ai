import { useState } from 'react';
import { ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

interface CompactHUDProps {
  cash: number;
  netWorth: number;
  level: number;
  xp: number;
  xpToNext: number;
  rolls: number;
  cityLevel?: number; // Optional city level for backward compatibility
}

export function CompactHUD({ cash, netWorth, level, xp, xpToNext, rolls, cityLevel = 1 }: CompactHUDProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { enabled: notificationsEnabled, toggleNotifications } = useNotificationPreferences();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-top">
      {/* Collapsed view - single row */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-background/90 backdrop-blur-sm border-b"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-green-500">
            ${cash.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            Lv.{level}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notification Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNotifications();
            }}
            className="p-1.5 rounded-md hover:bg-accent/20 transition-colors"
            aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            title={notificationsEnabled ? 'Notifications on' : 'Notifications off'}
          >
            {notificationsEnabled ? (
              <Bell size={16} className="text-primary" />
            ) : (
              <BellOff size={16} className="text-muted-foreground" />
            )}
          </button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">🎲</span>
            <span className="text-sm font-medium">{rolls}</span>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
            aria-label={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded view - full stats */}
      {isExpanded && (
        <div className="px-4 py-3 bg-background/95 backdrop-blur-sm border-b space-y-2">
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
