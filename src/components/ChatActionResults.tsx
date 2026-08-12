import type { AssistantActionResult } from '../lib/assistantResults'
import { formatEventDateLabel, formatEventSchedule } from '../lib/calendar-utils'

function ActionResultCard({ result }: { result: AssistantActionResult }) {
  switch (result.type) {
    case 'create_event':
      return (
        <div className="chat-action-card chat-action-card-event">
          <div className="chat-action-card-label">Event added</div>
          <div className="chat-action-card-title">{result.title}</div>
          <div className="chat-action-card-meta">
            {formatEventSchedule(result.date, result.time)}
          </div>
          <div className="chat-action-card-submeta">{result.calendarName}</div>
        </div>
      )
    case 'switch_calendar':
      return (
        <div className="chat-action-card">
          <div className="chat-action-card-label">Calendar switched</div>
          <div className="chat-action-card-title">{result.name}</div>
        </div>
      )
    case 'create_shared_calendar':
      return (
        <div className="chat-action-card">
          <div className="chat-action-card-label">Shared calendar created</div>
          <div className="chat-action-card-title">{result.name}</div>
          <div className="chat-action-card-meta">Code: {result.shareCode}</div>
        </div>
      )
    case 'join_shared_calendar':
      return (
        <div className="chat-action-card">
          <div className="chat-action-card-label">Joined calendar</div>
          <div className="chat-action-card-title">{result.name}</div>
        </div>
      )
    case 'go_to_date':
      return (
        <div className="chat-action-card">
          <div className="chat-action-card-label">Jumped to date</div>
          <div className="chat-action-card-meta">{formatEventDateLabel(result.date)}</div>
        </div>
      )
    case 'error':
      return (
        <div className="chat-action-card chat-action-card-error">
          <div className="chat-action-card-label">Could not complete</div>
          <div className="chat-action-card-meta">{result.message}</div>
        </div>
      )
    default:
      return null
  }
}

export function ChatActionResults({ results }: { results: AssistantActionResult[] }) {
  if (results.length === 0) return null

  return (
    <div className="chat-action-results">
      {results.map((result, index) => (
        <ActionResultCard key={`${result.type}-${index}`} result={result} />
      ))}
    </div>
  )
}
