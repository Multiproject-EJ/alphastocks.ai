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

export const getLearningModule = (learningId?: string | null) => {
  if (!learningId) return null
  return LEARNING_QUESTION_BANK[learningId] ?? null
}

export const getLearningQuestionCount = (learningId?: string | null) => {
  return getLearningModule(learningId)?.questions.length ?? 0
}
