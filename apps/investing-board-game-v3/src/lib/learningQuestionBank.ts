import {
  LEARNING_QUESTION_BANK,
  type LearningModule,
  type LearningQuestion,
  type LearningQuestionDifficulty,
} from '@/config/learning'

export type { LearningModule, LearningQuestion, LearningQuestionDifficulty }
export { LEARNING_QUESTION_BANK }

export const getLearningModule = (learningId?: string | null) => {
  if (!learningId) return null
  return LEARNING_QUESTION_BANK[learningId] ?? null
}

export const getLearningQuestionCount = (learningId?: string | null) => {
  return getLearningModule(learningId)?.questions.length ?? 0
}
