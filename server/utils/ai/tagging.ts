/**
 * Smart Tagging System
 * Suggests relevant tags based on content analysis
 */

export interface TagSuggestion {
  tag: string
  confidence: number // 0-1
  reason: string
}

/**
 * Generate smart tag suggestions for content
 */
export function suggestTags(input: {
  title: string
  description?: string
  categories: string[]
  type: string
}): TagSuggestion[] {
  const suggestions: TagSuggestion[] = []
  const text = `${input.title} ${input.description || ''}`.toLowerCase()

  // Extract keywords from text
  const keywords = extractKeywords(text)

  // Add keyword-based suggestions
  keywords.forEach((keyword) => {
    suggestions.push({
      tag: keyword,
      confidence: 0.7,
      reason: 'Extracted from content',
    })
  })

  // Add category-related tags
  input.categories.forEach((category) => {
    const categoryTags = getCategoryRelatedTags(category)
    categoryTags.forEach((tag) => {
      if (!suggestions.find((s) => s.tag === tag)) {
        suggestions.push({
          tag,
          confidence: 0.6,
          reason: `Related to ${category} category`,
        })
      }
    })
  })

  // Add type-related tags
  const typeTags = getTypeRelatedTags(input.type)
  typeTags.forEach((tag) => {
    if (!suggestions.find((s) => s.tag === tag)) {
      suggestions.push({
        tag,
        confidence: 0.5,
        reason: `Related to ${input.type} content`,
      })
    }
  })

  // Sort by confidence and return top suggestions
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10)
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  ])

  // Split into words and filter
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))

  // Count word frequency
  const frequency = new Map<string, number>()
  words.forEach((word) => {
    frequency.set(word, (frequency.get(word) || 0) + 1)
  })

  // Return most frequent words
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

/**
 * Get tags related to a category
 */
function getCategoryRelatedTags(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    MUSIC: ['audio', 'sound', 'melody', 'rhythm', 'song', 'track'],
    VISUAL_ARTS: ['artwork', 'painting', 'drawing', 'design', 'visual', 'creative'],
    PERFORMING_ARTS: ['performance', 'live', 'show', 'theater', 'stage', 'act'],
    DIGITAL_ARTS: ['digital', 'graphic', 'design', 'illustration', 'animation', 'cgi'],
    FILM: ['video', 'cinema', 'movie', 'film', 'production', 'screening'],
    PHOTOGRAPHY: ['photo', 'image', 'camera', 'capture', 'portrait', 'landscape'],
    LITERATURE: ['writing', 'poetry', 'prose', 'story', 'text', 'literary'],
    CRAFTS: ['handmade', 'craft', 'artisan', 'handcraft', 'traditional'],
    FASHION: ['style', 'clothing', 'design', 'wear', 'trend', 'outfit'],
    CULINARY_ARTS: ['food', 'cooking', 'recipe', 'culinary', 'cuisine', 'dish'],
  }

  return categoryMap[category] || []
}

/**
 * Get tags related to content type
 */
function getTypeRelatedTags(type: string): string[] {
  const typeMap: Record<string, string[]> = {
    AUDIO: ['listen', 'hear', 'sound', 'audio'],
    VIDEO: ['watch', 'visual', 'video', 'clip'],
    IMAGE: ['view', 'picture', 'image', 'photo'],
    LIVE_STREAM: ['live', 'streaming', 'broadcast', 'realtime'],
    DOCUMENT: ['read', 'document', 'text', 'pdf'],
  }

  return typeMap[type] || []
}

/**
 * Analyze text sentiment (basic implementation)
 */
export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number // -1 to 1
} {
  const positiveWords = [
    'love', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'beautiful', 'good', 'best', 'perfect', 'awesome', 'brilliant',
  ]

  const negativeWords = [
    'hate', 'bad', 'terrible', 'awful', 'horrible', 'worst',
    'poor', 'disappointing', 'ugly', 'useless', 'boring',
  ]

  const lowerText = text.toLowerCase()
  let score = 0

  positiveWords.forEach((word) => {
    const matches = lowerText.match(new RegExp(word, 'g'))
    if (matches) score += matches.length
  })

  negativeWords.forEach((word) => {
    const matches = lowerText.match(new RegExp(word, 'g'))
    if (matches) score -= matches.length
  })

  // Normalize score to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, score / 10))

  let sentiment: 'positive' | 'neutral' | 'negative'
  if (normalizedScore > 0.2) sentiment = 'positive'
  else if (normalizedScore < -0.2) sentiment = 'negative'
  else sentiment = 'neutral'

  return { sentiment, score: normalizedScore }
}
