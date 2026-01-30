/**
 * Emoji suggester using emoji-js library
 * Suggests relevant emojis based on action names
 */

import EmojiConvertor from 'emoji-js'

const emoji = new EmojiConvertor()

// Curated keyword-to-emoji mappings for action types
// These are used as the primary suggestions based on action names
const ACTION_KEYWORD_MAP: Record<string, string> = {
  // Trading
  'buy': '🛒',
  'sell': '💰',
  'trade': '🔄',
  'profit': '📈',
  'loss': '📉',
  'price': '💵',

  // Banking
  'deposit': '📥',
  'withdraw': '📤',
  'loan': '🏦',
  'pay': '💳',
  'transfer': '➡️',

  // Crafting
  'craft': '🔨',
  'refine': '⚙️',
  'extract': '⛏️',
  'mine': '⛏️',

  // Hunting
  'hunt': '🎯',
  'fight': '⚔️',
  'combat': '⚔️',
  'damage': '💥',
  'heal': '🩹',

  // Items
  'item': '🎒',
  'loot': '🎁',
  'drop': '🎁',
  'equipment': '🎒',
  'gear': '🎒',

  // Travel
  'travel': '🚀',
  'teleport': '🚀',
  'planet': '🌍',
  'move': '🚀',

  // General
  'quest': '📋',
  'mission': '📋',
  'event': '📅',
  'fee': '💸',
  'upgrade': '⬆️',
  'auction': '🏷️',
}

/**
 * Calculate similarity between two strings (0-1 score)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // Exact match
  if (s1 === s2) return 1

  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.9

  // Check token overlap
  const tokens1 = s1.split(/[\s\-_]+/).filter(t => t.length > 0)
  const tokens2 = s2.split(/[\s\-_]+/).filter(t => t.length > 0)

  const matches = tokens1.filter(t1 =>
    tokens2.some(t2 => t1.includes(t2) || t2.includes(t1))
  ).length

  if (matches === 0) return 0
  return matches / Math.max(tokens1.length, tokens2.length)
}

/**
 * Suggest the best emoji for an action name
 * Uses keyword matching with emoji-js as fallback
 */
export function suggestEmojiForAction(actionName: string): string {
  if (!actionName || actionName.trim().length === 0) {
    return '⚡'
  }

  // First pass: check curated keyword mappings
  let bestMatch = ''
  let bestScore = 0

  for (const [keyword, emoji] of Object.entries(ACTION_KEYWORD_MAP)) {
    const score = calculateSimilarity(actionName, keyword)
    if (score > bestScore) {
      bestScore = score
      bestMatch = emoji
    }
  }

  // If we found a good match, return it
  if (bestScore > 0.5) {
    return bestMatch
  }

  // Fallback: try to extract emojis related to the text using emoji-js
  // This uses the library's built-in knowledge of emoji keywords
  try {
    const data = emoji.data
    let fallbackEmoji = '⚡'
    let fallbackScore = 0

    // Search through emoji database for matches
    for (const codepoint in data) {
      const emojiData = data[codepoint]
      if (!emojiData || !emojiData[3]) continue // Skip if no keywords

      const keywords: string[] = emojiData[3]
      for (const keyword of keywords) {
        const score = calculateSimilarity(actionName, keyword)
        if (score > fallbackScore) {
          fallbackScore = score
          fallbackEmoji = emoji.replace_colons(`:${keyword}:`) || fallbackEmoji
        }
      }

      // Optimize: stop if we found a decent match
      if (fallbackScore > 0.7) break
    }

    return fallbackEmoji
  } catch (e) {
    // If emoji-js fails, just return default
    return bestMatch || '⚡'
  }
}

/**
 * Get multiple emoji suggestions for an action name
 */
export function suggestEmojisForAction(
  actionName: string,
  limit: number = 5
): string[] {
  if (!actionName || actionName.trim().length === 0) {
    return ['⚡']
  }

  const suggestions: Array<{ emoji: string; score: number }> = []
  const seenEmojis = new Set<string>()

  // First pass: curated keywords
  for (const [keyword, emoji] of Object.entries(ACTION_KEYWORD_MAP)) {
    if (seenEmojis.has(emoji)) continue

    const score = calculateSimilarity(actionName, keyword)
    if (score > 0.2) {
      suggestions.push({ emoji, score })
      seenEmojis.add(emoji)
    }
  }

  // Sort by score and take top results
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.emoji)
}
