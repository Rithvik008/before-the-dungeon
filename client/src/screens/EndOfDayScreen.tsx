import { useState } from 'react'
import type { CommunityStats, CustomerChoice, DaySummary, LeaderboardEntry, Scenario, SubmitResponse } from '../types'
import { ALL_ITEMS } from '../data/scenarios'

const C = {
  navy: '#1b1f2f', purple: '#1e2238', bone: '#e8dcc2',
  torch: '#f0a34a', yellow: '#ffd37a', magic: '#5aa9e6',
  shadow: '#10131c', muted: '#9098b8', red: '#b84a4a',
  green: '#4f9455', border: '#252a3d',
}

const PIXEL = "'Press Start 2P', system-ui"

function Delta({ n }: { n: number }) {
  const color = n > 0 ? C.green : n < 0 ? C.red : C.muted
  const prefix = n > 0 ? '+' : ''
  return <span style={{ color }}>{prefix}{n}</span>
}

interface Props {
  summary: DaySummary
  submitData: SubmitResponse | null
  leaderboard: LeaderboardEntry[]
  communityStats: CommunityStats | null
  scenario: Scenario
  choices: CustomerChoice[]
  onPlayAgain: () => void
  onPreviewCustomer: () => void
}

export function EndOfDayScreen({ summary, submitData, leaderboard, communityStats, scenario, choices, onPlayAgain, onPreviewCustomer }: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const { gold, respect, reputation, survivors, harmPrevented, harmCaused, finalScore } = summary
  const totalCustomers = choices.length

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: '16px 16px 22px', color: C.bone,
    }}>

      {/* Header — no outcome spoilers, that's tomorrow's reveal */}
      <div style={{
        textAlign: 'center',
        background: C.purple,
        borderRadius: 10, border: `1px solid ${C.border}`,
        padding: '18px 14px',
      }}>
        <div style={{ fontFamily: PIXEL, fontSize: 12, color: C.yellow, lineHeight: 1.6 }}>
          Shop Closed
        </div>
        <div style={{ fontSize: 17, color: C.bone, marginTop: 10, lineHeight: 1.6 }}>
          Your choices are made. What became of them, you'll find out tomorrow.
        </div>
      </div>

      {/* Your Decisions — what you chose, not what happened */}
      <div>
        <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
          Your Decisions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {choices.map((c, i) => {
            const customer = scenario.customers.find(cu => cu.id === c.customerId)
            const item = c.itemId ? ALL_ITEMS[c.itemId] : null
            const priceLabel = c.priceLevel
              ? { discount: '↓ Cheap', fair: '= Fair', greedy: '↑ Pricey' }[c.priceLevel]
              : 'Refused'
            return (
              <div key={i} style={{
                background: C.purple, borderRadius: 7, padding: '9px 11px',
                border: `1px solid ${C.border}`, fontSize: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 'bold', color: C.bone }}>{customer?.name}</span>
                  <span style={{ color: C.muted, fontSize: 15 }}>{customer?.type}</span>
                </div>
                <span style={{ color: item ? C.bone : C.red }}>
                  {item ? `${item.name} · ${priceLabel}` : 'Refused service'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Peek toggle — optional, for judges/testers who won't be back tomorrow */}
      <button
        onClick={() => setShowPreview(v => !v)}
        style={{
          padding: '10px', background: 'transparent', color: C.magic,
          border: `1px dashed ${C.border}`, borderRadius: 8,
          fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        {showPreview ? '✕ Hide preview' : '🔮 Peek at tomorrow\'s recap (spoilers)'}
      </button>

      {showPreview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Score banner */}
          <div style={{
            textAlign: 'center',
            background: C.purple,
            borderRadius: 10, border: `1px solid ${C.border}`,
            padding: '14px',
          }}>
            <div style={{ fontFamily: PIXEL, fontSize: 30, color: C.yellow, lineHeight: 1.3 }}>
              {finalScore}
            </div>
            <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.muted, marginTop: 6, letterSpacing: 1 }}>points</div>
            {submitData && submitData.rank > 0 && (
              <div style={{ fontSize: 17, color: C.magic, marginTop: 6 }}>
                Rank #{submitData.rank} of {submitData.totalPlayers} shopkeepers
              </div>
            )}
          </div>

          <button
            onClick={onPreviewCustomer}
            style={{
              padding: '12px', background: C.torch, color: C.shadow,
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            🌙 Meet Tomorrow's Customer — Skarn
          </button>

          {/* Outcomes */}
          <div>
            <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
              Tonight's Outcomes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {choices.map((c, i) => {
                const customer = scenario.customers.find(cu => cu.id === c.customerId)
                const ok = c.survived && !c.harmCaused
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 8, alignItems: 'baseline',
                    fontSize: 16, padding: '2px 0',
                  }}>
                    <span style={{ color: ok ? C.green : C.red, fontWeight: 'bold' }}>{ok ? '✔' : '✖'}</span>
                    <span style={{ color: C.bone }}>
                      <strong>{customer?.name}</strong> — {c.flavourText || 'left without a word.'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
          }}>
            {[
              { label: 'Gold', value: `${gold}g`, color: C.yellow },
              { label: 'Respect', value: `${respect}`, color: C.torch },
              { label: 'Reputation', value: `${reputation}`, color: C.magic },
              { label: 'Survivors', value: `${survivors}/${totalCustomers}`, color: C.green },
              { label: 'Harm Prev.', value: String(harmPrevented), color: C.green },
              { label: 'Harm Done', value: String(harmCaused), color: harmCaused > 0 ? C.red : C.muted },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: C.shadow, borderRadius: 7, padding: '8px 10px',
                border: `1px solid ${C.border}`,
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: PIXEL, fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.5 }}>{label}</div>
                <div style={{ fontSize: 21, fontWeight: 'bold', color, marginTop: 3 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Choice log with deltas */}
          <div>
            <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
              What Actually Happened
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {choices.map((c, i) => {
                const customer = scenario.customers.find(cu => cu.id === c.customerId)
                const item = c.itemId ? ALL_ITEMS[c.itemId] : null
                const priceLabel = c.priceLevel
                  ? { discount: '↓ Cheap', fair: '= Fair', greedy: '↑ Pricey' }[c.priceLevel]
                  : 'Refused'
                return (
                  <div key={i} style={{
                    background: C.purple, borderRadius: 7, padding: '9px 11px',
                    border: `1px solid ${C.border}`, fontSize: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 'bold', color: C.bone }}>{customer?.name}</span>
                      <span style={{ color: C.muted, fontSize: 15 }}>{customer?.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: item ? C.bone : C.red }}>
                        {item ? `${item.name} · ${priceLabel}` : 'Refused service'}
                      </span>
                      <span style={{ fontSize: 16 }}>
                        <span style={{ color: C.yellow }}>{c.goldEarned > 0 ? `+${c.goldEarned}g` : ''}</span>
                        {c.goldEarned > 0 && c.respectDelta !== 0 ? ' ' : ''}
                        <Delta n={c.respectDelta} />
                      </span>
                    </div>
                    {c.flavourText && (
                      <div style={{ fontSize: 15, color: C.muted, marginTop: 5, fontStyle: 'italic' }}>
                        {c.flavourText}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Community stats */}
          {communityStats && communityStats.totalPlayers > 0 && (
            <div>
              <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.magic, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
                The Town Compares Notes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {communityStats.customerStats.map(cs => {
                  const customer = scenario.customers.find(cu => cu.id === cs.customerId)
                  if (!customer) return null
                  const item = cs.mostCommonItemId ? ALL_ITEMS[cs.mostCommonItemId] : null
                  const showRefused = cs.refusedPct >= cs.mostCommonItemPct
                  return (
                    <div key={cs.customerId} style={{
                      background: C.purple, borderRadius: 7, padding: '8px 11px',
                      border: `1px solid ${C.border}`, fontSize: 16, color: C.bone,
                    }}>
                      {showRefused
                        ? <span><strong style={{ color: C.magic }}>{cs.refusedPct}%</strong> of shopkeepers refused {customer.name}</span>
                        : item
                          ? <span><strong style={{ color: C.magic }}>{cs.mostCommonItemPct}%</strong> of shopkeepers sold {customer.name} a {item.name}</span>
                          : <span style={{ color: C.muted }}>Not enough data on {customer.name} yet</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div>
              <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.magic, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
                Leaderboard
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {leaderboard.slice(0, 5).map(e => (
                  <div key={e.rank} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '7px 11px',
                    background: e.isCurrentUser ? '#2a2845' : C.shadow,
                    borderRadius: 6, fontSize: 17,
                    border: e.isCurrentUser ? `1px solid ${C.magic}50` : `1px solid ${C.border}`,
                  }}>
                    <span style={{ color: e.rank === 1 ? C.yellow : C.bone }}>
                      #{e.rank} {e.username}{e.isCurrentUser ? <span style={{ color: C.magic, fontSize: 14 }}> (you)</span> : ''}
                    </span>
                    <span style={{ color: C.torch }}>{e.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {submitData?.dayStreak ? (
        <div style={{ textAlign: 'center', fontSize: 15, color: C.muted }}>
          {submitData.dayStreak}-day streak. Come back tomorrow to see what happened.
        </div>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 15, color: C.muted }}>
          Come back tomorrow to see what happened.
        </div>
      )}

      <button onClick={onPlayAgain} style={{
        width: '100%', padding: '15px 13px',
        background: C.purple, color: C.bone,
        border: `1px solid #3a4060`, borderRadius: 8,
        fontSize: 13, fontFamily: PIXEL,
        cursor: 'pointer',
      }}>
        Practice Again
      </button>
    </div>
  )
}
