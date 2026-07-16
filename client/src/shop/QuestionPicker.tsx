import type { QuestionKey } from '../types'

const C = {
  purple: '#2e3148', bone: '#e8dcc2', torch: '#f0a34a',
  shadow: '#10131c', muted: '#9098b8',
}

const PIXEL = "'Press Start 2P', system-ui"

export const QUESTIONS: { key: QuestionKey; prompt: string }[] = [
  { key: 'location', prompt: 'Where are you headed?' },
  { key: 'threat', prompt: "What's waiting for you there?" },
  { key: 'motive', prompt: "What's this for?" },
  { key: 'experience', prompt: 'Have you done this before?' },
]

interface Props {
  onSelect: (key: QuestionKey) => void
  onBack: () => void
}

export function QuestionPicker({ onSelect, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        fontFamily: PIXEL, fontSize: 11, color: C.muted, textAlign: 'center',
        letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.6,
        background: C.shadow, border: '1px solid #3a4060', borderRadius: 6,
        padding: '8px 10px',
      }}>
        Ask one question
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUESTIONS.map(q => (
          <button
            key={q.key}
            onClick={() => onSelect(q.key)}
            style={{
              background: C.purple, border: '1px solid #4a5070',
              borderRadius: 8, padding: '13px 14px',
              cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left', fontSize: 17, color: C.bone,
            }}
          >
            {q.prompt}
          </button>
        ))}
      </div>
      <button
        onClick={onBack}
        style={{
          padding: '10px', background: 'transparent', color: C.muted,
          border: '1px solid #4a5070', borderRadius: 8,
          fontSize: 17, fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </div>
  )
}
