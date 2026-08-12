import { useEffect, useRef, useState } from 'react'
import { checkChatHealth, sendChatMessages } from '../api/gemini'
import { useCalendars } from '../hooks/useCalendars'
import { ChatMessageText } from '../lib/chatMarkdown'
import { ChatActionResults } from './ChatActionResults'
import { getChatUnavailableMessage, getGeminiSetupMessage } from '../lib/geminiSetup'
import type { AssistantActionResult } from '../lib/assistantResults'

type HeroAssistantProps = {
  onClose: () => void
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z" opacity="0.7" />
    </svg>
  )
}

function RobotIcon() {
  return (
    <svg className="robot-icon" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" fill="rgba(0, 100, 180, 0.15)" stroke="#0099ff" strokeWidth="2" />
      <rect x="35" y="40" width="50" height="40" rx="10" fill="rgba(0, 153, 255, 0.2)" stroke="#00b4ff" strokeWidth="2" />
      <circle cx="48" cy="58" r="6" fill="#00d4ff" />
      <circle cx="72" cy="58" r="6" fill="#00d4ff" />
      <path d="M48 72 Q60 80 72 72" stroke="#00b4ff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="60" y1="40" x2="60" y2="28" stroke="#00b4ff" strokeWidth="2" />
      <circle cx="60" cy="24" r="4" fill="#00d4ff" />
      <rect x="25" y="52" width="8" height="16" rx="4" fill="rgba(0, 153, 255, 0.3)" stroke="#00b4ff" strokeWidth="1.5" />
      <rect x="87" y="52" width="8" height="16" rx="4" fill="rgba(0, 153, 255, 0.3)" stroke="#00b4ff" strokeWidth="1.5" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

const WELCOME_MESSAGE =
  "Hi! I'm connected to your calendar. Try \"Schedule team meeting tomorrow at 3pm\" — I'll ask follow-ups if I need more details."

type UiMessage = {
  role: 'user' | 'assistant'
  text: string
  actionResults?: AssistantActionResult[]
}

export function HeroAssistant({ onClose }: HeroAssistantProps) {
  const { getChatContext, applyAssistantActions } = useCalendars()
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: 'assistant', text: WELCOME_MESSAGE },
  ])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiReady, setApiReady] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void checkChatHealth().then((health) => {
      setApiReady(health.ok)
      if (!health.geminiConfigured) {
        setError(getGeminiSetupMessage())
      } else if (!health.ok) {
        setError(getChatUnavailableMessage())
      }
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  async function handleSend() {
    const trimmed = prompt.trim()
    if (!trimmed || isSending) return

    const nextMessages: UiMessage[] = [...messages, { role: 'user', text: trimmed }]
    setPrompt('')
    setMessages(nextMessages)
    setIsSending(true)
    setError(null)

    try {
      const result = await sendChatMessages(nextMessages, getChatContext())
      const actionResults = applyAssistantActions(result.actions)

      setMessages((current) => [
        ...current,
        { role: 'assistant', text: result.text, actionResults },
      ])
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : 'Could not reach Gemini.'
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <aside className="hero-sidebar">
      <div className="hero-header">
        <div className="hero-title">
          <SparkleIcon />
          Hero Assistant
        </div>
        <button type="button" className="hero-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="hero-body">
        {messages.length <= 1 ? <RobotIcon /> : null}
        <div className="hero-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chat-bubble chat-bubble-${message.role}`}
            >
              {message.role === 'assistant' ? (
                <>
                  <ChatMessageText text={message.text} />
                  {message.actionResults?.length ? (
                    <ChatActionResults results={message.actionResults} />
                  ) : null}
                </>
              ) : (
                message.text
              )}
            </div>
          ))}
          {isSending ? (
            <div className="chat-bubble chat-bubble-assistant chat-loading">Thinking…</div>
          ) : null}
          {error ? <div className="chat-error">{error}</div> : null}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="hero-input-area">
        <div className="hero-input-wrap">
          <input
            className="hero-input"
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="enter prompt here"
            aria-label="Message Hero Assistant"
            disabled={isSending || apiReady === false}
          />
          <button
            type="button"
            className="hero-send"
            aria-label="Send"
            onClick={() => void handleSend()}
            disabled={isSending || !prompt.trim()}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}

export function HeroAssistantToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="hero-open-btn" onClick={onOpen}>
      Hero Assistant
    </button>
  )
}
