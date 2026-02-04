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

export type LearningQuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface LearningQuestion {
  id: string
  prompt: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: LearningQuestionDifficulty
  tags: string[]
}

export interface LearningModule {
  id: string
  title: string
  description: string
  questions: LearningQuestion[]
}

export const LEARNING_QUESTION_BANK: Record<string, LearningModule> = {
  'quiz-fundamentals': {
    id: 'quiz-fundamentals',
    title: 'Market Fundamentals',
    description: 'Core concepts for reading a business and its long-term value drivers.',
    questions: [
      {
        id: 'fundamentals-valuation-1',
        prompt: 'Which metric is most useful for comparing profitability across companies with different sizes?',
        options: ['Revenue', 'Gross margin', 'Share count', 'Market cap'],
        correctAnswer: 1,
        explanation: 'Gross margin normalizes profitability by showing profit per dollar of revenue.',
        difficulty: 'easy',
        tags: ['margin', 'profitability'],
      },
      {
        id: 'fundamentals-balance-1',
        prompt: 'A strong balance sheet for a growing company usually includes:',
        options: [
          'High short-term debt and low cash',
          'A large cash cushion relative to near-term obligations',
          'Minimal operating cash flow',
          'No reinvestment in growth',
        ],
        correctAnswer: 1,
        explanation: 'Cash reserves help companies fund growth and absorb shocks without dilution.',
        difficulty: 'medium',
        tags: ['balance-sheet', 'liquidity'],
      },
      {
        id: 'fundamentals-moat-1',
        prompt: 'Which example best represents a durable competitive moat?',
        options: [
          'A one-time viral marketing campaign',
          'Exclusive distribution agreements renewed annually',
          'High switching costs that lock in customers',
          'Short-term pricing discounts',
        ],
        correctAnswer: 2,
        explanation: 'High switching costs keep customers loyal and protect pricing power over time.',
        difficulty: 'medium',
        tags: ['moat', 'competitive-advantage'],
      },
    ],
  },
  'quiz-strategy': {
    id: 'quiz-strategy',
    title: 'Insider Strategy',
    description: 'Tactical thinking for timing, catalysts, and risk-managed opportunities.',
    questions: [
      {
        id: 'strategy-catalyst-1',
        prompt: 'A catalyst-driven trade should emphasize:',
        options: [
          'Ignoring the timeline to avoid stress',
          'Clear entry and exit conditions tied to the event',
          'Holding indefinitely regardless of outcome',
          'Only trading companies with no news flow',
        ],
        correctAnswer: 1,
        explanation: 'Catalyst trades depend on event timing, so define entry/exit rules first.',
        difficulty: 'easy',
        tags: ['catalyst', 'timing'],
      },
      {
        id: 'strategy-risk-1',
        prompt: 'Which sizing approach best limits downside on a high-volatility idea?',
        options: [
          'Allocate the full portfolio to maximize gains',
          'Use a fixed percent risk per trade with a stop loss',
          'Double down after each loss',
          'Skip position sizing entirely',
        ],
        correctAnswer: 1,
        explanation: 'Fixed risk per trade keeps losses manageable even when volatility spikes.',
        difficulty: 'medium',
        tags: ['risk', 'position-sizing'],
      },
      {
        id: 'strategy-optionality-1',
        prompt: 'Optionality in investing refers to:',
        options: [
          'Guaranteed returns',
          'Asymmetric payoff with limited downside and high upside',
          'Only buying companies with dividends',
          'Avoiding any uncertainty',
        ],
        correctAnswer: 1,
        explanation: 'Optionality means limited downside with potential for outsized upside.',
        difficulty: 'medium',
        tags: ['optionality', 'payoff'],
      },
    ],
  },
  'quiz-bias': {
    id: 'quiz-bias',
    title: 'Bias Check',
    description: 'Recognize cognitive traps before they distort decisions.',
    questions: [
      {
        id: 'bias-recency-1',
        prompt: 'Recency bias most often leads to:',
        options: [
          'Overweighting the latest data point',
          'Ignoring any new information',
          'Only trusting fundamentals',
          'Perfectly balanced decisions',
        ],
        correctAnswer: 0,
        explanation: 'Recency bias causes people to give too much weight to recent events.',
        difficulty: 'easy',
        tags: ['recency', 'behavioral'],
      },
      {
        id: 'bias-confirmation-1',
        prompt: 'Which habit best counters confirmation bias?',
        options: [
          'Seek out only sources that agree with your thesis',
          'Write down evidence that would prove you wrong',
          'Ignore dissenting opinions entirely',
          'Avoid researching the company',
        ],
        correctAnswer: 1,
        explanation: 'Listing disconfirming evidence forces a more balanced evaluation.',
        difficulty: 'medium',
        tags: ['confirmation', 'research'],
      },
      {
        id: 'bias-anchoring-1',
        prompt: 'Anchoring bias is when you:',
        options: [
          'Fixate on an initial price or statistic',
          'Always rebalance monthly',
          'Diversify across sectors',
          'Use a checklist',
        ],
        correctAnswer: 0,
        explanation: 'Anchoring means overweighting the first value you saw, even if outdated.',
        difficulty: 'medium',
        tags: ['anchoring', 'behavioral'],
      },
    ],
  },
}

export const LEARNING_REWARD_CONFIG = {
  baseStars: 2,
  baseXp: 6,
  streakBonusStars: 1,
  streakBonusXp: 2,
  maxStreakBonusDays: 3,
}
