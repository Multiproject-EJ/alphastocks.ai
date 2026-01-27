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
  { label: string; textClass: string; glowClass: string }
> = {
  bias: {
    label: 'Bias',
    textClass: 'text-rose-200',
    glowClass: 'bg-rose-400/30',
  },
  fundamentals: {
    label: 'Fundamentals',
    textClass: 'text-emerald-200',
    glowClass: 'bg-emerald-400/30',
  },
  strategy: {
    label: 'Strategy',
    textClass: 'text-sky-200',
    glowClass: 'bg-sky-400/30',
  },
  risk: {
    label: 'Risk',
    textClass: 'text-amber-200',
    glowClass: 'bg-amber-400/30',
  },
  market: {
    label: 'Market',
    textClass: 'text-purple-200',
    glowClass: 'bg-purple-400/30',
  },
}

export const getLearningTileDefinition = (learningId?: string | null) => {
  if (!learningId) return null
  return LEARNING_TILE_DEFINITIONS[learningId] ?? null
}
