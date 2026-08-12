import { useEffect, useState, type CSSProperties } from 'react'

const TUTORIAL_KEY = 'calendar-hero-tutorial-complete'

type TutorialStep = {
  title: string
  body: string
  target?: string
  placement?: 'center' | 'bottom' | 'left' | 'right'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to CalendarHero',
    body: 'Your personal and shared calendars live here. This quick tour shows the basics — takes about 30 seconds.',
    placement: 'center',
  },
  {
    title: 'Add events manually',
    body: 'Tap + Add event anytime, or double-click a day. Right-click (or long-press on mobile) an event to edit it.',
    target: '.add-event-header-btn',
    placement: 'bottom',
  },
  {
    title: 'Switch calendars',
    body: 'Use My Calendars and Shared in the header to switch between personal calendars and group shared ones.',
    target: '.header-nav',
    placement: 'bottom',
  },
  {
    title: 'Hero Assistant',
    body: 'Ask Hero to schedule events in plain English — e.g. “Schedule team meeting tomorrow at 3pm”.',
    target: '.hero-sidebar',
    placement: 'left',
  },
  {
    title: 'Share privately or publicly',
    body: 'When adding an event, toggle Share with group calendars to control what your group can see. Private events show a lock icon.',
    target: '.calendar-actions',
    placement: 'bottom',
  },
  {
    title: 'You\'re all set',
    body: 'Create a shared calendar to get a XXXX-XXXX code for your group. Install the app from your browser menu for mobile or desktop.',
    placement: 'center',
  },
]

type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

export function OnboardingTutorial() {
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)

  useEffect(() => {
    if (localStorage.getItem(TUTORIAL_KEY) === 'true') return
    setStepIndex(0)
  }, [])

  const step = stepIndex === null ? null : TUTORIAL_STEPS[stepIndex]

  useEffect(() => {
    if (!step?.target) {
      setSpotlight(null)
      return
    }

    const target = step.target

    function updateSpotlight() {
      const element = document.querySelector(target)
      if (!element) {
        setSpotlight(null)
        return
      }
      const rect = element.getBoundingClientRect()
      setSpotlight({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      })
    }

    updateSpotlight()
    window.addEventListener('resize', updateSpotlight)
    window.addEventListener('scroll', updateSpotlight, true)
    return () => {
      window.removeEventListener('resize', updateSpotlight)
      window.removeEventListener('scroll', updateSpotlight, true)
    }
  }, [step])

  if (stepIndex === null || !step) return null

  function finishTutorial() {
    localStorage.setItem(TUTORIAL_KEY, 'true')
    setStepIndex(null)
  }

  function goNext() {
    setStepIndex((current) => {
      if (current === null || current >= TUTORIAL_STEPS.length - 1) {
        finishTutorial()
        return null
      }
      return current + 1
    })
  }

  function goBack() {
    setStepIndex((current) => {
      if (current === null || current <= 0) return current
      return current - 1
    })
  }

  const isCenter = step.placement === 'center' || !step.target
  const popupStyle = getPopupStyle(spotlight, step.placement ?? 'bottom', isCenter)

  return (
    <div className="tutorial-layer" role="dialog" aria-modal="true" aria-label="App tutorial">
      {!spotlight ? <div className="tutorial-backdrop" /> : null}
      {spotlight ? (
        <div
          className="tutorial-spotlight"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      ) : null}
      <div className={`tutorial-popup${isCenter ? ' tutorial-popup-center' : ''}`} style={popupStyle}>
        <div className="tutorial-progress">
          {TUTORIAL_STEPS.map((_, index) => (
            <span
              key={index}
              className={`tutorial-dot${index === stepIndex ? ' active' : ''}${index < stepIndex ? ' done' : ''}`}
            />
          ))}
        </div>
        <h2 className="tutorial-title">{step.title}</h2>
        <p className="tutorial-body">{step.body}</p>
        <div className="tutorial-actions">
          <button type="button" className="btn-secondary" onClick={finishTutorial}>
            Skip
          </button>
          <div className="tutorial-actions-right">
            {stepIndex > 0 ? (
              <button type="button" className="btn-secondary" onClick={goBack}>
                Back
              </button>
            ) : null}
            <button type="button" className="btn-primary" onClick={goNext}>
              {stepIndex >= TUTORIAL_STEPS.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getPopupStyle(
  spotlight: SpotlightRect | null,
  placement: TutorialStep['placement'],
  center: boolean,
): CSSProperties | undefined {
  if (center || !spotlight) return undefined

  const gap = 14
  const popupWidth = 320

  switch (placement) {
    case 'left':
      return {
        top: spotlight.top + spotlight.height / 2,
        left: Math.max(16, spotlight.left - popupWidth - gap),
        transform: 'translateY(-50%)',
        width: popupWidth,
      }
    case 'right':
      return {
        top: spotlight.top + spotlight.height / 2,
        left: spotlight.left + spotlight.width + gap,
        transform: 'translateY(-50%)',
        width: popupWidth,
      }
    case 'bottom':
    default:
      return {
        top: spotlight.top + spotlight.height + gap,
        left: Math.max(16, spotlight.left + spotlight.width / 2 - popupWidth / 2),
        width: popupWidth,
      }
  }
}
