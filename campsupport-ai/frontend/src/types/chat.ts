export interface Citation {
  source_document: string;
  snippet: string;
  relevance_score: number;
}

export interface TicketCreated {
  ticket_id: string;
  department: string;
  status: string;
  title: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  confidence_score: number;
  requires_follow_up: boolean;
  missing_fields: string[];
  ticket_created?: TicketCreated | null;
  department_routed?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  citations?: Citation[];
  confidenceScore?: number;
  requiresFollowUp?: boolean;
  missingFields?: string[];
  ticketCreated?: TicketCreated | null;
  departmentRouted?: string;
}

export interface UserMetadata {
  roll_number?: string;
  room_number?: string;
  department?: string;
  email?: string;
}
