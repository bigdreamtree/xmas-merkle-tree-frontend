export interface Message {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface MessageResponse {
  messages: Message[];
  nextCursor: string | undefined;
}
