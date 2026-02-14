/**
 * UI Mode State Machine
 * 
 * Centralized state machine for managing UI modes and transitions.
 * Defines valid UI modes and their allowed transitions.
 */

export type UIMode = 
  | 'board'           // Main game board (playing)
  | 'stockExchangeBuilder'     // Building/upgrading exchanges
  | 'gallery'         // Net worth gallery view
  | 'portfolio'       // Portfolio management
  | 'hub'             // Hub/navigation view
  | 'shop'            // Shop interface
  | 'casino'          // Casino mini-game
  | 'biasSanctuary'   // Bias sanctuary
  | 'challenges'      // Challenges view
  | 'leaderboard'     // Leaderboard view
  | 'settings';       // Settings

export type GamePhase = 'idle' | 'rolling' | 'moving' | 'landed' | 'paused';

export interface UIModeState {
  mode: UIMode;
  previousMode: UIMode | null;
  phase: GamePhase;  // game phase within board mode
  modeData?: Record<string, any>;  // mode-specific data
  canTransition: boolean;  // can we switch modes now?
}

export interface UIModeTransition {
  from: UIMode;
  to: UIMode;
  onEnter?: () => void | Promise<void>;
  onExit?: () => void | Promise<void>;
  guard?: () => boolean;  // can this transition happen?
}

// Valid transitions between UI modes
const VALID_TRANSITIONS: Record<UIMode, UIMode[]> = {
  board: ['stockExchangeBuilder', 'gallery', 'portfolio', 'hub', 'shop', 'casino', 'biasSanctuary', 'challenges', 'leaderboard', 'settings'],
  stockExchangeBuilder: ['board'],
  gallery: ['board'],
  portfolio: ['board'],
  hub: ['board', 'stockExchangeBuilder', 'gallery', 'portfolio', 'shop', 'challenges', 'leaderboard'],
  shop: ['board', 'hub'],
  casino: ['board'],
  biasSanctuary: ['board'],
  challenges: ['board', 'hub'],
  leaderboard: ['board', 'hub'],
  settings: ['board', 'hub'],
};

/**
 * Check if a transition from one mode to another is valid
 */
export function canTransition(from: UIMode, to: UIMode): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Mode-specific enter/exit handlers
 */
export const MODE_HANDLERS: Record<UIMode, {
  onEnter?: (data?: any) => void | Promise<void>;
  onExit?: () => void | Promise<void>;
}> = {
  board: {
    onEnter: async () => {
      console.log('[UIMode] Entering board mode');
      // Resume game music/animations if needed
    },
    onExit: async () => {
      console.log('[UIMode] Exiting board mode');
      // Pause animations if needed
    },
  },
  stockExchangeBuilder: {
    onEnter: async (data) => {
      console.log('[UIMode] Entering stock exchange builder', data);
    },
    onExit: async () => {
      console.log('[UIMode] Exiting stock exchange builder');
    },
  },
  gallery: {
    onEnter: async () => {
      console.log('[UIMode] Entering gallery');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting gallery');
    },
  },
  portfolio: {
    onEnter: async () => {
      console.log('[UIMode] Entering portfolio');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting portfolio');
    },
  },
  hub: {
    onEnter: async () => {
      console.log('[UIMode] Entering hub');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting hub');
    },
  },
  shop: {
    onEnter: async () => {
      console.log('[UIMode] Entering shop');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting shop');
    },
  },
  casino: {
    onEnter: async () => {
      console.log('[UIMode] Entering casino');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting casino');
    },
  },
  biasSanctuary: {
    onEnter: async () => {
      console.log('[UIMode] Entering investment phycology');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting investment phycology');
    },
  },
  challenges: {
    onEnter: async () => {
      console.log('[UIMode] Entering challenges');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting challenges');
    },
  },
  leaderboard: {
    onEnter: async () => {
      console.log('[UIMode] Entering leaderboard');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting leaderboard');
    },
  },
  settings: {
    onEnter: async () => {
      console.log('[UIMode] Entering settings');
    },
    onExit: async () => {
      console.log('[UIMode] Exiting settings');
    },
  },
};
