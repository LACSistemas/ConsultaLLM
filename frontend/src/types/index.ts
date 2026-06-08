export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatList {
  chats: Chat[]
}

export interface CounselorResponse {
  name: string
  provider: 'deepseek' | 'gemini' | 'anthropic'
  response: string
}

export interface CounselorAssessment {
  provider: 'deepseek' | 'gemini' | 'anthropic' | string
  strengths: string[]
  weaknesses: string[]
  contribution: string
  confidence: number
}

export interface CEODecision {
  decision: string
  reasoning: string
  confidence: number
  consensus: string[]
  disagreements: string[]
  counselor_assessments: CounselorAssessment[]
  risks: string[]
  verification_needed: string[]
  next_steps: string[]
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  counselor_responses?: CounselorResponse[]
  created_at: string
}

export interface Attachment {
  id: string
  filename: string
  file_type: 'pdf' | 'xlsx'
  created_at: string
}

export interface CouncilResponse {
  message_id: string
  counselors: CounselorResponse[]
  ceo_decision: CEODecision
}

export interface SettingsResponse {
  providers: {
    openai: boolean
    deepseek: boolean
    gemini: boolean
    anthropic: boolean
  }
}
