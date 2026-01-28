export type LearningTileCategory = 'bias' | 'fundamentals' | 'strategy' | 'risk' | 'market'

export interface LearningTileDefinition {
  id: string
  title: string
  shortTitle: string
  category: LearningTileCategory
  description: string
  icon: string
}

export const LEARNING_TILE_DEFINITIONS: Record<string, LearningTileDefinition> = {
  'quiz-fundamentals': {
    id: 'quiz-fundamentals',
    title: 'Market Fundamentals',
    shortTitle: 'Fundamentals',
    category: 'fundamentals',
    description: 'Quick hits on balance sheets, moats, and long-term value.',
    icon: '📘',
  },
  'quiz-strategy': {
    id: 'quiz-strategy',
    title: 'Insider Strategy',
    shortTitle: 'Strategy',
    category: 'strategy',
    description: 'Sharpen your edge on catalysts, timing, and optionality.',
    icon: '🎯',
  },
  'quiz-bias': {
    id: 'quiz-bias',
    title: 'Bias Check',
    shortTitle: 'Bias Check',
    category: 'bias',
    description: 'Spot cognitive pitfalls before they take your profits.',
    icon: '🧠',
  },
}

export const LEARNING_CATEGORY_STYLES: Record<
  LearningTileCategory,
  {
    label: string
    textClass: string
    glowClass: string
    badgeClass: string
    gradientClass: string
    patternClass: string
  }
> = {
  bias: {
    label: 'Bias',
    textClass: 'text-rose-200',
    glowClass: 'bg-rose-400/30',
    badgeClass: 'bg-rose-500/20 text-rose-100 border border-rose-400/40',
    gradientClass: 'from-rose-700/80 via-fuchsia-700/60 to-slate-900',
    patternClass: 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]',
  },
  fundamentals: {
    label: 'Fundamentals',
    textClass: 'text-emerald-200',
    glowClass: 'bg-emerald-400/30',
    badgeClass: 'bg-emerald-500/20 text-emerald-100 border border-emerald-300/40',
    gradientClass: 'from-emerald-700/80 via-teal-700/70 to-slate-900',
    patternClass: 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_60%)]',
  },
  strategy: {
    label: 'Strategy',
    textClass: 'text-sky-200',
    glowClass: 'bg-sky-400/30',
    badgeClass: 'bg-sky-500/20 text-sky-100 border border-sky-300/40',
    gradientClass: 'from-sky-700/80 via-indigo-700/60 to-slate-900',
    patternClass: 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_58%)]',
  },
  risk: {
    label: 'Risk',
    textClass: 'text-amber-200',
    glowClass: 'bg-amber-400/30',
    badgeClass: 'bg-amber-500/20 text-amber-100 border border-amber-300/40',
    gradientClass: 'from-amber-600/80 via-orange-700/70 to-slate-900',
    patternClass: 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_transparent_60%)]',
  },
  market: {
    label: 'Market',
    textClass: 'text-purple-200',
    glowClass: 'bg-purple-400/30',
    badgeClass: 'bg-purple-500/20 text-purple-100 border border-purple-300/40',
    gradientClass: 'from-purple-700/80 via-indigo-800/70 to-slate-900',
    patternClass: 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_60%)]',
  },
}

export const getLearningTileDefinition = (learningId?: string | null) => {
  if (!learningId) return null
  return LEARNING_TILE_DEFINITIONS[learningId] ?? null
}
