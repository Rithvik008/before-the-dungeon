import type { Item, PriceLevel } from '../types'

const C = {
  navy: '#1b1f2f', purple: '#2e3148', bone: '#e8dcc2',
  torch: '#f0a34a', yellow: '#ffd37a', magic: '#5aa9e6',
  shadow: '#10131c', muted: '#9098b8', red: '#b84a4a',
}

const PIXEL = "'Press Start 2P', system-ui"

const PRICE_OPTIONS: { level: PriceLevel; label: string; hint: string; goldMult: string; color: string }[] = [
  { level: 'discount', label: 'Discount',  hint: '+Respect, less gold',  goldMult: '×0.7', color: C.magic },
  { level: 'fair',     label: 'Fair Price', hint: 'Balanced',             goldMult: '×1.0', color: C.bone },
  { level: 'greedy',   label: 'Pricey',    hint: 'More gold, −Respect', goldMult: '×1.6', color: C.torch },
]

interface Props {
  item: Item
  onSelect: (price: PriceLevel) => void
  onBack: () => void
}

export function PriceChooser({ item, onSelect, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        textAlign: 'center', background: C.shadow,
        border: '1px solid #3a4060', borderRadius: 6, padding: '8px 10px',
      }}>
        <div style={{ fontFamily: PIXEL, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, lineHeight: 1.6 }}>
          Selling: {item.name}
        </div>
        <div style={{ fontSize: 16, color: C.muted }}>Set your price</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PRICE_OPTIONS.map(({ level, label, hint, goldMult, color }) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            style={{
              background: C.purple, border: `1px solid #4a5070`,
              borderRadius: 8, padding: '13px 14px',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', color }}>{label}</div>
              <div style={{ fontSize: 15, color: C.muted, marginTop: 2 }}>{hint}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 17, color: C.yellow }}>{Math.round(item.baseValue * parseFloat(goldMult.slice(1)))}g</div>
              <div style={{ fontSize: 15, color: C.muted }}>{goldMult}</div>
            </div>
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
