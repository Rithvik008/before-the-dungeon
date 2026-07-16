import type { YesterdayRecap } from '../types'
import { ALL_ITEMS, getScenarioById } from '../data/scenarios'

const C = {
  navy: '#1b1f2f', purple: '#1e2238', bone: '#e8dcc2',
  torch: '#f0a34a', yellow: '#ffd37a', magic: '#5aa9e6',
  shadow: '#10131c', muted: '#9098b8', red: '#b84a4a',
  green: '#4f9455', border: '#252a3d',
}

const PIXEL = "'Press Start 2P', system-ui"

interface Props {
  recap: YesterdayRecap
  onContinue: () => void
}

export function YesterdayScreen({ recap, onContinue }: Props) {
  const scenario = getScenarioById(recap.scenarioId)
  const { summary } = recap

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: '16px 16px 22px', color: C.bone,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: PIXEL, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.6 }}>
          Meanwhile, last night...
        </div>
        <div style={{ fontSize: 17, color: C.torch, marginTop: 4 }}>
          Here's what your choices set in motion.
        </div>
      </div>

      <div style={{
        textAlign: 'center', background: C.purple, borderRadius: 10,
        border: `1px solid ${C.border}`, padding: '14px',
      }}>
        <div style={{ fontFamily: PIXEL, fontSize: 23, color: C.yellow, lineHeight: 1.3 }}>
          {summary.finalScore} pts
        </div>
        <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>
          {summary.survivors}/{summary.choices.length} survived · {summary.harmCaused} harmed
        </div>
      </div>

      {scenario && (
        <div>
          <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
            Their Fates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {summary.choices.map((c, i) => {
              const customer = scenario.customers.find(cu => cu.id === c.customerId)
              const ok = c.survived && !c.harmCaused
              return (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 16 }}>
                  <span style={{ color: ok ? C.green : C.red, fontWeight: 'bold' }}>{ok ? '✔' : '✖'}</span>
                  <span><strong>{customer?.name}</strong> — {c.flavourText}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {recap.communityStats && recap.communityStats.totalPlayers > 0 && scenario && (
        <div>
          <div style={{ fontFamily: PIXEL, fontSize: 9, color: C.magic, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, lineHeight: 1.6 }}>
            How The Rest Of The Town Chose
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recap.communityStats.customerStats.map(cs => {
              const customer = scenario.customers.find(cu => cu.id === cs.customerId)
              if (!customer) return null
              const item = cs.mostCommonItemId ? ALL_ITEMS[cs.mostCommonItemId] : null
              const showRefused = cs.refusedPct >= cs.mostCommonItemPct
              return (
                <div key={cs.customerId} style={{
                  background: C.purple, borderRadius: 7, padding: '8px 11px',
                  border: `1px solid ${C.border}`, fontSize: 16,
                }}>
                  {showRefused
                    ? <span><strong style={{ color: C.magic }}>{cs.refusedPct}%</strong> refused {customer.name}</span>
                    : item
                      ? <span><strong style={{ color: C.magic }}>{cs.mostCommonItemPct}%</strong> sold {customer.name} a {item.name}</span>
                      : null}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button onClick={onContinue} style={{
        width: '100%', padding: '13px',
        background: C.torch, color: '#241a0a',
        border: 'none', borderRadius: 8,
        fontSize: 18, fontWeight: 'bold', fontFamily: 'inherit',
        cursor: 'pointer',
      }}>
        Open Today's Shop →
      </button>
    </div>
  )
}
