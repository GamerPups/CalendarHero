function isHtmlResponse(text) {
  const trimmed = text.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')
}

export async function readJsonResponse(response) {
  const raw = await response.text()

  if (!raw.trim()) {
    throw new Error('API returned an empty response.')
  }

  try {
    return JSON.parse(raw)
  } catch {
    if (isHtmlResponse(raw)) {
      throw new Error(
        'API returned HTML instead of JSON. Check GEMINI_API_KEY and that /api routes are served by the dev server.',
      )
    }

    throw new Error(
      `API returned invalid JSON: ${raw.slice(0, 160)}${raw.length > 160 ? '…' : ''}`,
    )
  }
}
