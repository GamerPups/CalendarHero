import { Fragment, type ReactNode } from 'react'

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string }

const INLINE_MARKDOWN_REGEX = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let lastIndex = 0

  for (const match of text.matchAll(INLINE_MARKDOWN_REGEX)) {
    const index = match.index ?? 0

    if (index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, index) })
    }

    if (match[2]) tokens.push({ type: 'bold', value: match[2] })
    else if (match[3]) tokens.push({ type: 'italic', value: match[3] })
    else if (match[4]) tokens.push({ type: 'code', value: match[4] })

    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return tokens
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return tokenizeInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`

    switch (token.type) {
      case 'bold':
        return <strong key={key}>{token.value}</strong>
      case 'italic':
        return <em key={key}>{token.value}</em>
      case 'code':
        return (
          <code key={key} className="chat-inline-code">
            {token.value}
          </code>
        )
      default:
        return <Fragment key={key}>{token.value}</Fragment>
    }
  })
}

function renderLine(line: string, index: number): ReactNode {
  const trimmed = line.trim()

  if (!trimmed) {
    return <div key={index} className="chat-spacer" aria-hidden />
  }

  const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/)
  if (bulletMatch) {
    return (
      <div key={index} className="chat-list-item">
        <span className="chat-list-bullet">•</span>
        <span className="chat-list-content">{renderInline(bulletMatch[1], `line-${index}`)}</span>
      </div>
    )
  }

  const numberedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/)
  if (numberedMatch) {
    return (
      <div key={index} className="chat-list-item chat-list-item-numbered">
        <span className="chat-list-number">{trimmed.match(/^\d+/)?.[0]}.</span>
        <span className="chat-list-content">{renderInline(numberedMatch[1], `line-${index}`)}</span>
      </div>
    )
  }

  return <p key={index} className="chat-paragraph">{renderInline(trimmed, `line-${index}`)}</p>
}

export function ChatMessageText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)

  return (
    <div className="chat-formatted">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter((line, index, array) => {
          if (line.trim()) return true
          return index > 0 && index < array.length - 1
        })

        return (
          <div key={blockIndex} className="chat-block">
            {lines.map((line, lineIndex) => renderLine(line, blockIndex * 100 + lineIndex))}
          </div>
        )
      })}
    </div>
  )
}
