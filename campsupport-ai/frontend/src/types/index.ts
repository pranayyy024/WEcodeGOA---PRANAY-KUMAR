export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Ticket {
  id: string;
  status: string;
  title: string;
}
