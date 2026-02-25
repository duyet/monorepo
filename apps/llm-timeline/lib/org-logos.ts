/**
 * Maps organization names to their primary domain for logo fetching.
 * Used with logo.dev API: https://img.logo.dev/{domain}
 */
export const ORG_DOMAINS: Record<string, string> = {
  OpenAI: 'openai.com',
  Anthropic: 'anthropic.com',
  Google: 'google.com',
  'Google DeepMind': 'deepmind.com',
  DeepMind: 'deepmind.com',
  Meta: 'meta.com',
  'Meta AI': 'meta.com',
  Microsoft: 'microsoft.com',
  'Mistral AI': 'mistral.ai',
  xAI: 'x.ai',
  'DeepSeek-AI': 'deepseek.com',
  Alibaba: 'alibaba.com',
  Cohere: 'cohere.com',
  'Hugging Face': 'huggingface.co',
  EleutherAI: 'eleutherai.org',
  'Allen AI': 'allenai.org',
  AllenAI: 'allenai.org',
  AI21: 'ai21.com',
  'Stability AI': 'stability.ai',
  MosaicML: 'mosaicml.com',
  'Together AI': 'together.ai',
  'Inflection AI': 'inflection.ai',
  'Character.AI': 'character.ai',
  Baidu: 'baidu.com',
  Tencent: 'tencent.com',
  ByteDance: 'bytedance.com',
  Nvidia: 'nvidia.com',
  Amazon: 'amazon.com',
  Apple: 'apple.com',
  IBM: 'ibm.com',
  Salesforce: 'salesforce.com',
  'Fast.ai': 'fast.ai',
  'Liquid AI': 'liquid.ai',
  MiniMax: 'minimax.io',
  Qwen: 'qwen.ai',
  'Zhipu AI': 'zhipuai.cn',
  'Moonshot AI': 'moonshot.cn',
  Yi: '01.ai',
  '01-ai': '01.ai',
  Mistral: 'mistral.ai',
  'Prime Intellect': 'primeintellect.ai',
  Inception: 'inceptionlabs.ai',
  'Z.AI': 'z.ai',
  Zyphra: 'zyphra.com',
  Falcon: 'tii.ae',
  TII: 'tii.ae',
}

/**
 * Get the logo URL for an org using logo.dev.
 * Returns null if no domain mapping exists.
 */
export function getOrgLogoUrl(org: string): string | null {
  const domain = ORG_DOMAINS[org]
  if (!domain) return null
  return `https://img.logo.dev/${domain}?token=pk_X0oMT_p3TBSy2seFKyGk4Q&size=40&format=png`
}

/**
 * Get initials from an org name for fallback avatar.
 * e.g., "OpenAI" → "OA", "Google DeepMind" → "GD"
 */
export function getOrgInitials(org: string): string {
  return org
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Generate a consistent background color for an org based on its name.
 */
export function getOrgColor(org: string): string {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  ]
  let hash = 0
  for (const ch of org) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}
