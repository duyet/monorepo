/**
 * LLM Timeline Data
 *
 * ============================================================================
 * LLM UPDATE INSTRUCTIONS
 * ============================================================================
 * To add a new model, append an object to the `models` array with:
 *   - name: Model name (e.g., "GPT-4o")
 *   - date: Release date as YYYY-MM-DD
 *   - org: Organization (e.g., "OpenAI", "Anthropic", "Google")
 *   - params: Parameter count as string or null (e.g., "175B", "1.8T (MoE)")
 *   - type: "model" for regular models, "milestone" for key events
 *   - license: "open" | "closed" | "partial"
 *   - desc: Brief description
 *
 * To update existing data, find the model by name and modify fields.
 * ============================================================================
 */

export interface Model {
  name: string
  date: string // YYYY-MM-DD
  org: string
  params: string | null // e.g., "175B", "1.8T (MoE)"
  type: 'model' | 'milestone'
  license: 'open' | 'closed' | 'partial'
  desc: string
}

export const models: Model[] = [
  // 2017 - Foundation
  {
    name: 'Transformer',
    date: '2017-06-12',
    org: 'Google',
    params: null,
    type: 'milestone',
    license: 'open',
    desc: 'Attention Is All You Need - the foundational paper introducing the Transformer architecture.',
  },

  // 2018 - Pre-training Era Begins
  {
    name: 'GPT-1',
    date: '2018-06-11',
    org: 'OpenAI',
    params: '117M',
    type: 'model',
    license: 'open',
    desc: 'First GPT model demonstrating generative pre-training for language understanding.',
  },
  {
    name: 'BERT',
    date: '2018-10-11',
    org: 'Google',
    params: '340M',
    type: 'model',
    license: 'open',
    desc: 'Bidirectional encoder representations, revolutionizing NLP benchmarks.',
  },

  // 2019 - Scale Up
  {
    name: 'GPT-2',
    date: '2019-02-14',
    org: 'OpenAI',
    params: '1.5B',
    type: 'model',
    license: 'open',
    desc: 'Scaled up language model with impressive text generation capabilities.',
  },
  {
    name: 'T5',
    date: '2019-10-23',
    org: 'Google',
    params: '11B',
    type: 'model',
    license: 'open',
    desc: 'Text-to-Text Transfer Transformer - unified framework for all NLP tasks.',
  },

  // 2020 - The Big Leap
  {
    name: 'GPT-3',
    date: '2020-05-28',
    org: 'OpenAI',
    params: '175B',
    type: 'milestone',
    license: 'closed',
    desc: 'Massive scale breakthrough demonstrating emergent capabilities and few-shot learning.',
  },
  {
    name: 'BLANK',
    date: '2020-06-01',
    org: 'Google',
    params: '1.6T',
    type: 'model',
    license: 'closed',
    desc: 'Sparse transformer with 1.6T parameters using mixture of experts.',
  },

  // 2021 - Multimodal & Efficiency
  {
    name: 'DALL-E',
    date: '2021-01-05',
    org: 'OpenAI',
    params: '12B',
    type: 'model',
    license: 'closed',
    desc: 'Zero-shot text-to-image generation using transformers.',
  },
  {
    name: 'CLIP',
    date: '2021-01-05',
    org: 'OpenAI',
    params: '400M',
    type: 'model',
    license: 'open',
    desc: 'Contrastive Language-Image Pre-training for vision-language understanding.',
  },
  {
    name: 'Codex',
    date: '2021-08-10',
    org: 'OpenAI',
    params: '12B',
    type: 'model',
    license: 'closed',
    desc: 'GPT-3 fine-tuned on code, powering GitHub Copilot.',
  },
  {
    name: 'Gopher',
    date: '2021-12-08',
    org: 'DeepMind',
    params: '280B',
    type: 'model',
    license: 'closed',
    desc: 'DeepMind large language model with strong reading comprehension.',
  },

  // 2022 - ChatGPT & Open Models Rise
  {
    name: 'LaMDA',
    date: '2022-01-20',
    org: 'Google',
    params: '137B',
    type: 'model',
    license: 'closed',
    desc: 'Dialog-focused model for conversational AI applications.',
  },
  {
    name: 'PaLM',
    date: '2022-04-04',
    org: 'Google',
    params: '540B',
    type: 'model',
    license: 'closed',
    desc: 'Pathways Language Model achieving breakthrough reasoning capabilities.',
  },
  {
    name: 'Chinchilla',
    date: '2022-03-31',
    org: 'DeepMind',
    params: '70B',
    type: 'milestone',
    license: 'closed',
    desc: 'Optimal compute scaling laws - smaller but better trained model.',
  },
  {
    name: 'BLOOM',
    date: '2022-07-06',
    org: 'BigScience',
    params: '176B',
    type: 'model',
    license: 'open',
    desc: 'Open-access multilingual LLM from collaborative research.',
  },
  {
    name: 'ChatGPT',
    date: '2022-11-30',
    org: 'OpenAI',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'RLHF-tuned GPT-3.5 for conversational AI - sparked global AI revolution.',
  },
  {
    name: 'Galactica',
    date: '2022-11-15',
    org: 'Meta',
    params: '120B',
    type: 'model',
    license: 'open',
    desc: 'Scientific knowledge model trained on academic papers.',
  },

  // 2023 - The Year of LLMs
  {
    name: 'LLaMA',
    date: '2023-02-24',
    org: 'Meta',
    params: '65B',
    type: 'milestone',
    license: 'open',
    desc: 'Open weights foundation model enabling the open-source LLM ecosystem.',
  },
  {
    name: 'GPT-4',
    date: '2023-03-14',
    org: 'OpenAI',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Multimodal model with unprecedented reasoning and multimodal capabilities.',
  },
  {
    name: 'Claude',
    date: '2023-03-14',
    org: 'Anthropic',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Constitutional AI assistant focused on helpfulness and safety.',
  },
  {
    name: 'Vicuna',
    date: '2023-03-30',
    org: 'LMSYS',
    params: '13B',
    type: 'model',
    license: 'open',
    desc: 'LLaMA fine-tuned on ShareGPT conversations, 90% ChatGPT quality.',
  },
  {
    name: 'Alpaca',
    date: '2023-03-13',
    org: 'Stanford',
    params: '7B',
    type: 'model',
    license: 'open',
    desc: 'LLaMA fine-tuned on 52K instruction-following demonstrations.',
  },
  {
    name: 'PaLM 2',
    date: '2023-05-10',
    org: 'Google',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Improved reasoning, multilingual, powering Bard and Google AI.',
  },
  {
    name: 'Llama 2',
    date: '2023-07-18',
    org: 'Meta',
    params: '70B',
    type: 'milestone',
    license: 'open',
    desc: 'Commercially licensed open model with fine-tuned chat variants.',
  },
  {
    name: 'Claude 2',
    date: '2023-07-11',
    org: 'Anthropic',
    params: null,
    type: 'model',
    license: 'closed',
    desc: '200K context window, improved coding and reasoning.',
  },
  {
    name: 'Falcon',
    date: '2023-05-25',
    org: 'TII',
    params: '180B',
    type: 'model',
    license: 'open',
    desc: 'Open model trained on RefinedWeb dataset with strong performance.',
  },
  {
    name: 'Mistral 7B',
    date: '2023-09-27',
    org: 'Mistral AI',
    params: '7B',
    type: 'milestone',
    license: 'open',
    desc: 'Efficient open model outperforming Llama 2 13B with sliding window attention.',
  },
  {
    name: 'GPT-4 Turbo',
    date: '2023-11-06',
    org: 'OpenAI',
    params: null,
    type: 'model',
    license: 'closed',
    desc: '128K context, faster, cheaper API with updated knowledge.',
  },
  {
    name: 'Gemini',
    date: '2023-12-06',
    org: 'Google',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Native multimodal model from scratch, Ultra/Pro/Nano variants.',
  },
  {
    name: 'Mixtral 8x7B',
    date: '2023-12-11',
    org: 'Mistral AI',
    params: '46.7B',
    type: 'milestone',
    license: 'open',
    desc: 'Sparse Mixture of Experts matching GPT-3.5 performance efficiently.',
  },

  // 2024 - Multimodal & Reasoning
  {
    name: 'Claude 3',
    date: '2024-03-04',
    org: 'Anthropic',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Opus, Sonnet, Haiku family with vision and near-human reasoning.',
  },
  {
    name: 'GPT-4o',
    date: '2024-05-13',
    org: 'OpenAI',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Omni model with real-time multimodal voice, vision, text capabilities.',
  },
  {
    name: 'Llama 3',
    date: '2024-04-18',
    org: 'Meta',
    params: '70B',
    type: 'milestone',
    license: 'open',
    desc: '405B trained, 70B released. Best open model at release.',
  },
  {
    name: 'Gemma',
    date: '2024-02-21',
    org: 'Google',
    params: '7B',
    type: 'model',
    license: 'open',
    desc: 'Open lightweight models from Gemini research.',
  },
  {
    name: 'Command R+',
    date: '2024-04-04',
    org: 'Cohere',
    params: '104B',
    type: 'model',
    license: 'open',
    desc: 'RAG-optimized model with tool use capabilities.',
  },
  {
    name: 'Phi-3',
    date: '2024-04-23',
    org: 'Microsoft',
    params: '14B',
    type: 'model',
    license: 'open',
    desc: 'Small but capable model optimized for mobile deployment.',
  },
  {
    name: 'Qwen2',
    date: '2024-06-07',
    org: 'Alibaba',
    params: '72B',
    type: 'model',
    license: 'open',
    desc: 'Strong multilingual capabilities across 29 languages.',
  },
  {
    name: 'Claude 3.5 Sonnet',
    date: '2024-06-20',
    org: 'Anthropic',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Surpasses Opus in benchmarks while being faster and cheaper.',
  },
  {
    name: 'GPT-4o mini',
    date: '2024-07-18',
    org: 'OpenAI',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Affordable small model replacing GPT-3.5 Turbo.',
  },
  {
    name: 'Llama 3.1',
    date: '2024-07-23',
    org: 'Meta',
    params: '405B',
    type: 'milestone',
    license: 'open',
    desc: 'Largest open model matching GPT-4o performance.',
  },
  {
    name: 'Grok-2',
    date: '2024-08-13',
    org: 'xAI',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'xAI model with image generation and real-time X data access.',
  },
  {
    name: 'o1-preview',
    date: '2024-09-12',
    org: 'OpenAI',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Reasoning model with chain-of-thought for complex problems.',
  },
  {
    name: 'Claude 3.5 Haiku',
    date: '2024-10-22',
    org: 'Anthropic',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Fast and affordable, matching Claude 3 Opus performance.',
  },
  {
    name: 'DeepSeek-V3',
    date: '2024-12-26',
    org: 'DeepSeek',
    params: '671B',
    type: 'milestone',
    license: 'open',
    desc: 'MoE model matching GPT-4o at fraction of training cost.',
  },

  // 2025 - New Frontiers
  {
    name: 'o3-mini',
    date: '2025-01-31',
    org: 'OpenAI',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Efficient reasoning model for coding and STEM tasks.',
  },
  {
    name: 'DeepSeek-R1',
    date: '2025-01-20',
    org: 'DeepSeek',
    params: '671B',
    type: 'milestone',
    license: 'open',
    desc: 'Open reasoning model matching o1 performance with open weights.',
  },
  {
    name: 'Grok-3',
    date: '2025-02-17',
    org: 'xAI',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Trained on 100K GPUs with strong reasoning and coding.',
  },
  {
    name: 'Claude 3.7 Sonnet',
    date: '2025-02-24',
    org: 'Anthropic',
    params: null,
    type: 'milestone',
    license: 'closed',
    desc: 'Extended thinking for complex reasoning, hybrid approach.',
  },
  {
    name: 'GPT-4.5',
    date: '2025-02-27',
    org: 'OpenAI',
    params: null,
    type: 'model',
    license: 'closed',
    desc: 'Largest GPT model with improved pattern recognition and EQ.',
  },
]

// Get unique organizations for filter
export const organizations = Array.from(new Set(models.map(m => m.org))).sort()

// Get unique years for grouping
export const years = Array.from(new Set(models.map(m => new Date(m.date).getFullYear()))).sort((a, b) => b - a)
