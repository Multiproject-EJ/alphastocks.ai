import {
  LEARNING_CATEGORY_STYLES,
  LEARNING_TILE_DEFINITIONS,
  type LearningTileCategory,
  type LearningTileDefinition,
} from '@/config/learning'

export type { LearningTileCategory, LearningTileDefinition }
export { LEARNING_CATEGORY_STYLES, LEARNING_TILE_DEFINITIONS }

export const getLearningTileDefinition = (learningId?: string | null) => {
  if (!learningId) return null
  return LEARNING_TILE_DEFINITIONS[learningId] ?? null
}
