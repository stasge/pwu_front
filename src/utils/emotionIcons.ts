// Utility to resolve emotion icon URLs from src/assets/images/emotions
// Falls back to an emoji character when an asset is missing

// Vite will replace these with URLs at build-time
const iconModules: Record<string, string> = {
  // common locations
  ...import.meta.glob('/src/assets/emotions/*', { eager: true, as: 'url' }),
  ...import.meta.glob('/src/assets/images/emotions/*', { eager: true, as: 'url' }),
}

function normalizeKey(key: string): string {
  // Accept: 'like', 'like.svg', '@/assets/images/emotions/like.svg'
  const last = key.split('/').pop() || key
  return last.endsWith('.svg') || last.endsWith('.png') || last.endsWith('.jpg')
    ? last
    : `${last}.svg`
}

export function getEmotionIconUrl(key: string | undefined | null): string | null {
  if (!key) return null
  // normalize incoming keys: '@/assets/emotions/like.svg', '/src/assets/emotions/like.svg', 'like.svg'
  const file = normalizeKey(key.replace(/^@\//, '/src/'))
  const entries = Object.entries(iconModules)
  // try strict match by tail filename under any emotions folder
  const byTail = entries.find(([path]) => path.endsWith(`/emotions/${file}`))
  if (byTail) return byTail[1]
  // fallback: any file with same filename
  const byName = entries.find(([path]) => path.endsWith(`/${file}`))
  return byName ? byName[1] : null
}

export function getEmojiFallback(key: string): string {
  const base = (key.split('/').pop() || key).replace(/\.(svg|png|jpg)$/i, '')
  switch (base) {
    case 'like': return '👍'
    case 'heart': return '❤️'
    case 'haha': return '😂'
    case 'wow': return '😮'
    case 'sad': return '😢'
    case 'angry': return '😡'
    case 'dislike': return '👎'
    case 'party': return '🎉'
    case 'pray': return '🙏'
    case 'inlove': return '😍'
    case 'think': return '🤔'
    case 'mindblown': return '🤯'
    case 'cool': return '😎'
    case 'puke': return '🤮'
    case 'sarcasm': return '🙃'
    case 'fire': return '🔥'
    case 'hundred': return '💯'
    case 'sleep': return '😴'
    case 'cry': return '😭'
    case 'smirk': return '😏'
    default: return '🙂'
  }
}


