import {
  LEARNING_CATEGORY_STYLES,
  LEARNING_GRAPHIC_TEMPLATES,
  LEARNING_TILE_DEFINITIONS,
  type LearningGraphicTemplate,
  type LearningGraphicTemplateId,
  type LearningTileCategory,
  type LearningTileDefinition,
} from '@/config/learning'

export type { LearningGraphicTemplate, LearningGraphicTemplateId, LearningTileCategory, LearningTileDefinition }
export { LEARNING_CATEGORY_STYLES, LEARNING_GRAPHIC_TEMPLATES, LEARNING_TILE_DEFINITIONS }

export const getLearningTileDefinition = (learningId?: string | null) => {
  if (!learningId) return null
  return LEARNING_TILE_DEFINITIONS[learningId] ?? null
}
