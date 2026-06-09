export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatList {
  chats: Chat[]
}

export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type DecisionStatus = 'recommendation' | 'needs_clarification'

export interface CounselorResponse {
  name: string
  provider: 'deepseek' | 'gemini' | 'anthropic'
  role: string
  role_description: string
  response: string
  critique: string
}

export interface CounselorAssessment {
  provider: 'deepseek' | 'gemini' | 'anthropic' | string
  role: string
  strengths: string[]
  weaknesses: string[]
  contribution: string
  reliability: ConfidenceLevel
}

export interface ConfidenceAssessment {
  level: ConfidenceLevel
  rationale: string
  supporting_factors: string[]
  limiting_factors: string[]
}

export interface CEODecision {
  status: DecisionStatus
  decision: string
  reasoning: string
  confidence: ConfidenceAssessment
  consensus: string[]
  disagreements: string[]
  minority_views: string[]
  counselor_assessments: CounselorAssessment[]
  known_facts: string[]
  assumptions: string[]
  inferences: string[]
  value_judgments: string[]
  unknowns: string[]
  risks: string[]
  verification_needed: string[]
  clarifying_questions: string[]
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
