import React, { createContext, useState, useCallback, useEffect } from 'react'
import { 
  UIMode, 
  GamePhase, 
  UIModeState, 
  canTransition, 
  MODE_HANDLERS 
} from '@/lib/uiModeStateMachine'

export interface UIModeContextValue {
  // Current state
  mode: UIMode;
  previousMode: UIMode | null;
  phase: GamePhase;
  modeData: Record<string, any>;
  
  // Actions
  transitionTo: (mode: UIMode, data?: Record<string, any>) => Promise<boolean>;
  setPhase: (phase: GamePhase) => void;
  goBack: () => void;  // return to previous mode
  setCanTransition: (can: boolean) => void;  // control transition guard
  
  // Queries
  canTransitionTo: (mode: UIMode) => boolean;
  isInMode: (...modes: UIMode[]) => boolean;
  isBoardMode: () => boolean;
}

const UIModeContext = createContext<UIModeContextValue | null>(null)

interface UIModeProviderProps {
  children: React.ReactNode;
  initialMode?: UIMode;
  initialPhase?: GamePhase;
}

/**
 * Handle mode exit logic
 */
async function handleModeExit(mode: UIMode): Promise<void> {
  const handler = MODE_HANDLERS[mode]?.onExit
  if (handler) {
    await handler()
  }
}

/**
 * Handle mode enter logic
 */
async function handleModeEnter(mode: UIMode, data?: any): Promise<void> {
  const handler = MODE_HANDLERS[mode]?.onEnter
  if (handler) {
    await handler(data)
  }
}

export function UIModeProvider({ 
  children, 
  initialMode = 'board',
  initialPhase = 'idle' 
}: UIModeProviderProps) {
  const [state, setState] = useState<UIModeState>({
    mode: initialMode,
    previousMode: null,
    phase: initialPhase,
    modeData: {},
    canTransition: true,
  })

  // Save last mode to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem('lastUIMode', state.mode)
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [state.mode])

  // Restore last mode on mount
  useEffect(() => {
    try {
      const lastMode = localStorage.getItem('lastUIMode') as UIMode
      if (lastMode && lastMode !== initialMode) {
        // Don't await - fire and forget
        transitionTo(lastMode).catch(console.error)
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  const transitionTo = useCallback(async (newMode: UIMode, data?: Record<string, any>): Promise<boolean> => {
    // Check if transition is valid
    if (!canTransition(state.mode, newMode)) {
      console.warn(`[UIMode] Invalid transition: ${state.mode} → ${newMode}`)
      return false
    }
    
    // Check if we can transition now (e.g., not during dice roll)
    if (!state.canTransition) {
      console.warn('[UIMode] Cannot transition right now - transitions blocked')
      return false
    }
    
    // If already in target mode, just update data
    if (state.mode === newMode) {
      setState(prev => ({
        ...prev,
        modeData: data || {},
      }))
      return true
    }
    
    try {
      // Run exit handler for current mode
      await handleModeExit(state.mode)
      
      // Update state
      setState(prev => ({
        mode: newMode,
        previousMode: prev.mode,
        phase: newMode === 'board' ? prev.phase : 'idle',
        modeData: data || {},
        canTransition: true,
      }))
      
      // Run enter handler for new mode
      await handleModeEnter(newMode, data)
      
      console.log(`[UIMode] Transitioned: ${state.mode} → ${newMode}`)
      return true
    } catch (error) {
      console.error('[UIMode] Transition error:', error)
      return false
    }
  }, [state.mode, state.canTransition, state.phase])
  
  const setPhase = useCallback((phase: GamePhase) => {
    setState(prev => ({
      ...prev,
      phase,
    }))
  }, [])
  
  const goBack = useCallback(() => {
    if (state.previousMode) {
      transitionTo(state.previousMode)
    }
  }, [state.previousMode, transitionTo])
  
  const setCanTransition = useCallback((can: boolean) => {
    setState(prev => ({
      ...prev,
      canTransition: can,
    }))
  }, [])
  
  const canTransitionTo = useCallback((targetMode: UIMode): boolean => {
    return state.canTransition && canTransition(state.mode, targetMode)
  }, [state.mode, state.canTransition])
  
  const isInMode = useCallback((...modes: UIMode[]): boolean => {
    return modes.includes(state.mode)
  }, [state.mode])
  
  const isBoardMode = useCallback((): boolean => {
    return state.mode === 'board'
  }, [state.mode])
  
  const value: UIModeContextValue = {
    mode: state.mode,
    previousMode: state.previousMode,
    phase: state.phase,
    modeData: state.modeData,
    transitionTo,
    setPhase,
    goBack,
    setCanTransition,
    canTransitionTo,
    isInMode,
    isBoardMode,
  }
  
  return (
    <UIModeContext.Provider value={value}>
      {children}
    </UIModeContext.Provider>
  )
}

export { UIModeContext }
