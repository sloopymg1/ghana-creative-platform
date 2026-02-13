/**
 * Content Moderation Utilities
 * Detects inappropriate content, spam, and policy violations
 */

export interface ModerationResult {
  flagged: boolean
  score: number // 0-100, higher means more problematic
  reasons: string[]
  categories: string[]
  suggestions?: string[]
}

/**
 * Moderate content text (title, description)
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  const result: ModerationResult = {
    flagged: false,
    score: 0,
    reasons: [],
    categories: [],
  }

  if (!text || text.trim().length === 0) {
    return result
  }

  const lowerText = text.toLowerCase()

  // Check for profanity and inappropriate content
  const profanityCheck = checkProfanity(lowerText)
  if (profanityCheck.found) {
    result.flagged = true
    result.score += 40
    result.reasons.push('Contains inappropriate language')
    result.categories.push('profanity')
  }

  // Check for spam patterns
  const spamCheck = checkSpam(lowerText)
  if (spamCheck.isSpam) {
    result.flagged = true
    result.score += 30
    result.reasons.push('Detected spam patterns')
    result.categories.push('spam')
  }

  // Check for excessive capitalization
  if (checkExcessiveCaps(text)) {
    result.score += 10
    result.reasons.push('Excessive capitalization detected')
    result.categories.push('formatting')
  }

  // Check for suspicious links
  const linkCheck = checkSuspiciousLinks(text)
  if (linkCheck.suspicious) {
    result.flagged = true
    result.score += 25
    result.reasons.push('Contains suspicious links')
    result.categories.push('suspicious-links')
  }

  // Check for personal information
  if (checkPersonalInfo(text)) {
    result.score += 15
    result.reasons.push('May contain personal information')
    result.categories.push('privacy')
  }

  return result
}

/**
 * Check for profanity and inappropriate language
 */
function checkProfanity(text: string): { found: boolean; matches: string[] } {
  // Common inappropriate words (abbreviated list for example)
  const profanityList = [
    'fuck',
    'shit',
    'ass',
    'bitch',
    'damn',
    'hell',
    'dick',
    'cock',
    'pussy',
    'bastard',
    // Add more as needed
  ]

  const matches = profanityList.filter((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(text)
  })

  return {
    found: matches.length > 0,
    matches,
  }
}

/**
 * Check for spam patterns
 */
function checkSpam(text: string): { isSpam: boolean; signals: string[] } {
  const signals: string[] = []

  // Repeated characters (e.g., "!!!!!!!" or "$$$$$$")
  if (/(.)\1{4,}/.test(text)) {
    signals.push('repeated-characters')
  }

  // Multiple URLs
  const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length
  if (urlCount > 3) {
    signals.push('excessive-urls')
  }

  // Common spam phrases
  const spamPhrases = [
    'click here',
    'buy now',
    'limited time',
    'act now',
    'free money',
    'make money fast',
    'work from home',
    'weight loss',
    'earn cash',
  ]

  const foundSpamPhrases = spamPhrases.filter((phrase) => text.includes(phrase))
  if (foundSpamPhrases.length > 0) {
    signals.push('spam-phrases')
  }

  // Excessive emojis (more than 20% of content)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
  const emojiCount = (text.match(emojiRegex) || []).length
  const textLength = text.replace(/\s/g, '').length
  if (textLength > 0 && emojiCount / textLength > 0.2) {
    signals.push('excessive-emojis')
  }

  return {
    isSpam: signals.length >= 2,
    signals,
  }
}

/**
 * Check for excessive capitalization
 */
function checkExcessiveCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, '')
  if (letters.length < 10) return false

  const upperCount = (text.match(/[A-Z]/g) || []).length
  const ratio = upperCount / letters.length

  return ratio > 0.7 // More than 70% capitals
}

/**
 * Check for suspicious links
 */
function checkSuspiciousLinks(text: string): { suspicious: boolean; urls: string[] } {
  const urlRegex = /https?:\/\/[^\s]+/g
  const urls = text.match(urlRegex) || []

  // Suspicious patterns
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /goo\.gl/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP addresses
    /[a-z0-9]{20,}/i,  // Very long random strings
  ]

  const suspicious = urls.some((url) =>
    suspiciousPatterns.some((pattern) => pattern.test(url))
  )

  return { suspicious, urls }
}

/**
 * Check for personal information
 */
function checkPersonalInfo(text: string): boolean {
  // Email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(text)) {
    return true
  }

  // Phone numbers (various formats)
  const phonePatterns = [
    /\d{3}[-.]?\d{3}[-.]?\d{4}/,
    /\(\d{3}\)\s*\d{3}[-.]?\d{4}/,
    /\+\d{1,3}\s*\d{3,}/,
  ]
  if (phonePatterns.some((pattern) => pattern.test(text))) {
    return true
  }

  // Credit card numbers
  if (/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/.test(text)) {
    return true
  }

  return false
}

/**
 * Suggest improvements for flagged content
 */
export function suggestImprovements(result: ModerationResult): string[] {
  const suggestions: string[] = []

  if (result.categories.includes('profanity')) {
    suggestions.push('Remove inappropriate language to comply with community guidelines')
  }

  if (result.categories.includes('spam')) {
    suggestions.push('Reduce promotional content and focus on authentic descriptions')
  }

  if (result.categories.includes('formatting')) {
    suggestions.push('Use normal capitalization for better readability')
  }

  if (result.categories.includes('suspicious-links')) {
    suggestions.push('Remove shortened URLs and use direct, trusted links only')
  }

  if (result.categories.includes('privacy')) {
    suggestions.push('Remove personal information for your safety')
  }

  return suggestions
}

/**
 * Auto-moderate content on upload
 */
export async function autoModerateContent(content: {
  title: string
  description?: string
}): Promise<{
  approved: boolean
  moderation: ModerationResult
  action: 'approve' | 'review' | 'reject'
}> {
  // Moderate title
  const titleModeration = await moderateText(content.title)

  // Moderate description if present
  const descriptionModeration = content.description
    ? await moderateText(content.description)
    : { flagged: false, score: 0, reasons: [], categories: [] }

  // Combine results
  const combinedScore = Math.max(titleModeration.score, descriptionModeration.score)
  const combinedReasons = [
    ...titleModeration.reasons,
    ...descriptionModeration.reasons,
  ]
  const combinedCategories = [
    ...new Set([...titleModeration.categories, ...descriptionModeration.categories]),
  ]

  const moderation: ModerationResult = {
    flagged: combinedScore > 30,
    score: combinedScore,
    reasons: combinedReasons,
    categories: combinedCategories,
    suggestions: suggestImprovements({
      flagged: combinedScore > 30,
      score: combinedScore,
      reasons: combinedReasons,
      categories: combinedCategories,
    }),
  }

  // Determine action
  let action: 'approve' | 'review' | 'reject'
  if (combinedScore >= 70) {
    action = 'reject'
  } else if (combinedScore >= 30) {
    action = 'review'
  } else {
    action = 'approve'
  }

  return {
    approved: action === 'approve',
    moderation,
    action,
  }
}
