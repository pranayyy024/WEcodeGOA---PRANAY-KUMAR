import { ChatResponse, UserMetadata, TicketCreated } from '../types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function sendChatMessage(
  message: string,
  userId: string = 'student-default',
  conversationId?: string,
  userMetadata?: UserMetadata
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      user_id: userId,
      conversation_id: conversationId,
      user_metadata: userMetadata || {},
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat request failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function fetchAllTickets(userId?: string): Promise<TicketCreated[]> {
  const url = userId
    ? `${API_BASE_URL}/tickets/?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/tickets/`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load tickets');
  }

  return response.json();
}
