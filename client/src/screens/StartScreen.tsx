import { useState } from 'react'
import type { LeaderboardEntry, Scenario } from '../types'

const C = {
  navy: '#1b1f2f', purple: '#1e2238', bone: '#e8dcc2',
  torch: '#f0a34a', yellow: '#ffd37a', magic: '#5aa9e6',
  shadow: '#10131c', muted: '#9098b8', border: '#252a3d',
}

const PIXEL = "'Press Start 2P', system-ui"

function fmt(n: number) {
  return n.toLocaleString()
}

interface Props {
  scenario: Scenario
  leaderboard: LeaderboardEntry[]
  onStart: () => void
}

export function StartScreen({ scenario, leaderboard, onStart }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: '18px 16px 22px', color: C.bone,
    }}>

      {/* Tagline */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: C.muted }}>
          Sell gear. Save heroes. Keep your respect.
        </div>
        <button
          onClick={() => setShowHelp(v => !v)}
          style={{
            marginTop: 8, background: 'transparent', border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '4px 12px', color: C.magic,
            fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          {showHelp ? '✕ Close' : '? How to Play'}
        </button>
      </div>

      {showHelp && (
        <div style={{
          background: C.shadow, borderRadius: 10, border: `1px solid ${C.border}`,
          padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            fontFamily: PIXEL, fontSize: 9, color: C.magic, letterSpacing: 1,
            textTransform: 'uppercase', lineHeight: 1.6,
          }}>
            How to Play
          </div>
          <div style={{ fontSize: 15, color: C.bone, lineHeight: 1.6 }}>
            Customers visit your shop one at a time. For each, choose an item to sell,
            set a price, or <strong style={{ color: C.torch }}>refuse</strong> to serve them.
          </div>
          <div style={{ fontSize: 15, color: C.bone, lineHeight: 1.6 }}>
            <strong style={{ color: C.yellow }}>Pricing</strong> — Discount (×0.7) builds respect but earns
            less gold. Fair (×1.0) is balanced. Pricey (×1.6) earns more gold but costs respect with
            good-hearted customers.
          </div>
          <div style={{ fontSize: 15, color: C.bone, lineHeight: 1.6 }}>
            <strong style={{ color: C.yellow }}>Choose wisely</strong> — selling the wrong item to the
            wrong customer can cause harm; refusing a shady customer can prevent it.
          </div>
          <div style={{ fontSize: 15, color: C.bone, lineHeight: 1.6 }}>
            <strong style={{ color: C.yellow }}>Score</strong> = gold + respect + reputation×0.5 +
            survivors×10 + harm prevented×15 − harm caused×20. Everyone plays the same customers
            each day — climb today's leaderboard.
          </div>
        </div>
      )}

      {/* Dungeon forecast */}
      <div style={{
        background: C.purple,
        borderRadius: 10, border: `1px solid ${C.border}`,
        padding: '13px 15px',
      }}>
        <div style={{
          fontFamily: PIXEL, fontSize: 9, color: C.torch, letterSpacing: 1,
          textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6,
        }}>
          Today — {scenario.title}
        </div>
        <div style={{ fontSize: 17, color: C.bone, lineHeight: 1.65 }}>
          {scenario.forecast}
        </div>
        <div style={{ fontSize: 15, color: C.muted, marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: C.torch,
          }} />
          {scenario.customers.length} customers expected before the gate opens.
        </div>
      </div>

      {/* Leaderboard preview */}
      {leaderboard.length > 0 && (
        <div>
          <div style={{
            fontFamily: PIXEL, fontSize: 9, color: C.magic, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6,
          }}>
            Today's Top Shopkeepers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {leaderboard.slice(0, 3).map(e => (
              <div key={e.rank} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 11px',
                background: e.isCurrentUser ? '#2a2845' : C.shadow,
                borderRadius: 6,
                border: e.isCurrentUser ? `1px solid ${C.magic}50` : `1px solid ${C.border}`,
                fontSize: 17,
              }}>
                <span style={{ color: e.rank === 1 ? C.yellow : C.bone }}>
                  #{e.rank} {e.username}
                  {e.isCurrentUser && <span style={{ color: C.magic, fontSize: 14 }}> (you)</span>}
                </span>
                <span style={{ color: C.torch, fontSize: 16 }}>{fmt(e.score)} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={onStart}
        style={{
          width: '100%', padding: '15px',
          background: C.torch, color: C.shadow,
          border: 'none', borderRadius: 9,
          fontSize: 20, fontWeight: 'bold', fontFamily: 'inherit',
          cursor: 'pointer', letterSpacing: 0.5,
          boxShadow: '0 4px 0 #a06820',
        }}
        onPointerDown={e => {
          e.currentTarget.style.transform = 'translateY(2px)'
          e.currentTarget.style.boxShadow = '0 2px 0 #a06820'
        }}
        onPointerUp={e => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = '0 4px 0 #a06820'
        }}
      >
        Open the Shop →
      </button>

      <div style={{ fontSize: 14, color: '#4a5272', textAlign: 'center' }}>
        The dungeon gate opens at dawn. Customers are waiting.
      </div>
    </div>
  )
}
