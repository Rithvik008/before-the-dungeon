import type { Customer, QuestionKey } from '../types'
import { QUESTIONS } from './QuestionPicker'

const C = {
  navy: '#1b1f2f', purple: '#1e2238', bone: '#e8dcc2',
  torch: '#f0a34a', yellow: '#ffd37a', magic: '#5aa9e6',
  shadow: '#10131c', muted: '#9098b8', red: '#b84a4a',
  border: '#2e3450',
}

interface Props {
  customer: Customer
  askedQuestion: QuestionKey | null
  onAsk: () => void
  onChooseItems: () => void
  onRefuse: () => void
}

export function CustomerCard({ customer, askedQuestion, onAsk, onChooseItems, onRefuse }: Props) {
  const askedPrompt = askedQuestion ? QUESTIONS.find(q => q.key === askedQuestion)?.prompt : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Customer info */}
      <div style={{
        background: C.purple,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        padding: '10px 13px',
      }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 19, fontWeight: 'bold', color: C.bone }}>
            {customer.name}
          </span>
        </div>
        <div style={{ fontSize: 15, color: C.muted, marginBottom: 7 }}>{customer.type}</div>
        <div style={{ fontSize: 17, color: C.bone, lineHeight: 1.6, fontStyle: 'italic' }}>
          "{customer.dialogue}"
        </div>
        {askedQuestion && (
          <div style={{ marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 14, color: C.magic, marginBottom: 3 }}>You asked: {askedPrompt}</div>
            <div style={{ fontSize: 17, color: C.bone, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{customer.answers[askedQuestion]}"
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!askedQuestion && (
        <button
          onClick={onAsk}
          style={{
            padding: '10px 0',
            background: 'transparent', color: C.magic,
            border: `1px solid ${C.magic}60`, borderRadius: 8,
            fontSize: 17, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          Ask a Question
        </button>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onChooseItems}
          style={{
            flex: 2, padding: '13px 0',
            background: C.torch, color: C.shadow,
            border: 'none', borderRadius: 8,
            fontSize: 19, fontWeight: 'bold', fontFamily: 'inherit',
            cursor: 'pointer', letterSpacing: 0.5,
          }}
          onPointerDown={e => { e.currentTarget.style.opacity = '0.85' }}
          onPointerUp={e => { e.currentTarget.style.opacity = '1' }}
        >
          Sell Item
        </button>
        <button
          onClick={onRefuse}
          style={{
            flex: 1, padding: '13px 0',
            background: 'transparent', color: C.muted,
            border: `1px solid #3a4060`, borderRadius: 8,
            fontSize: 18, fontFamily: 'inherit',
            cursor: 'pointer',
          }}
          onPointerDown={e => { e.currentTarget.style.color = C.bone }}
          onPointerUp={e => { e.currentTarget.style.color = C.muted }}
        >
          Refuse
        </button>
      </div>
    </div>
  )
}
