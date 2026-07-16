import { useState } from 'react'
import type { Item } from '../types'

const C = {
  purple: '#2e3148', bone: '#e8dcc2', torch: '#f0a34a',
  shadow: '#10131c', muted: '#9098b8', red: '#b84a4a',
}

const PIXEL = "'Press Start 2P', system-ui"

interface Props {
  items: Item[]
  stock: Record<string, number>
  onSelect: (itemId: string) => void
  onBack: () => void
}

function ItemIcon({ itemId, tint }: { itemId: string; tint: number }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div style={{
        width: 64, height: 64, borderRadius: 6,
        background: `#${tint.toString(16).padStart(6, '0')}`,
      }} />
    )
  }

  return (
    <img
      src={`/assets/items/${itemId}.png`}
      onError={() => setFailed(true)}
      alt=""
      style={{ width: 64, height: 64, imageRendering: 'pixelated', borderRadius: 6 }}
    />
  )
}

export function ItemGrid({ items, stock, onSelect, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        fontFamily: PIXEL, fontSize: 11, color: C.muted, textAlign: 'center',
        letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.6,
        background: C.shadow, border: '1px solid #3a4060', borderRadius: 6,
        padding: '8px 10px',
      }}>
        Choose what to sell
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {items.map(item => {
          const left = stock[item.id] ?? 0
          const soldOut = left <= 0
          return (
            <button
              key={item.id}
              onClick={() => !soldOut && onSelect(item.id)}
              disabled={soldOut}
              style={{
                background: C.purple, border: '1px solid #4a5070',
                borderRadius: 8, padding: '8px 6px',
                cursor: soldOut ? 'default' : 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                opacity: soldOut ? 0.4 : 1,
                position: 'relative',
              }}
            >
              <ItemIcon itemId={item.id} tint={item.tint} />
              <span style={{ fontSize: 19, color: C.bone, textAlign: 'center', lineHeight: 1.2 }}>
                {item.name}
              </span>
              <span style={{ fontSize: 15, color: C.torch }}>{item.baseValue}g</span>
              <span style={{ fontSize: 15, color: soldOut ? C.red : C.muted }}>
                {soldOut ? 'Sold out' : `${left} left`}
              </span>
            </button>
          )
        })}
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
