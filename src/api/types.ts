export type ChatSuccessResponse = {
  reply: string
}

export type ChatErrorResponse = {
  error: string
}

export type ChatResponse = ChatSuccessResponse | ChatErrorResponse
