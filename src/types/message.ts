export interface Message {
  id: string;
  agentId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  agentId?: string;
  sessionId?: string;
  stream?: boolean;
}

export interface ChatResponse {
  message: Message;
  sessionId: string;
}
