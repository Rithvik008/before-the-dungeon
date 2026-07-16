import { useCallback, useEffect, useState } from 'react'
import type { CommunityStats, CustomerChoice, DaySummary, LeaderboardEntry, RunState, Screen, SubmitResponse, YesterdayRecap } from './types'
import { createInitialRunState, applyChoice, computeSummary } from './shop/logic'
import { getScenarioForDate, getPreviewCustomer } from './data/scenarios'
import { fetchCommunityStats, fetchLeaderboard, fetchYesterday, submitDay } from './api'
import { StartScreen } from './screens/StartScreen'
import { YesterdayScreen } from './screens/YesterdayScreen'
import { EndOfDayScreen } from './screens/EndOfDayScreen'
import { ShopScreen } from './shop/ShopScreen'

const TODAY = new Date().toISOString().slice(0, 10)

const C = {
  navy: '#1b1f2f', header: '#0f1220', border: '#252a3d',
  bone: '#e8dcc2', torch: '#f0a34a', yellow: '#ffd37a',
  muted: '#6a7090', shadow: '0 16px 48px rgba(0,0,0,0.7)',
}

const PIXEL = "'Press Start 2P', system-ui"

export function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [customerIndex, setCustomerIndex] = useState(0)
  const scenario = getScenarioForDate(TODAY)
  const [runState, setRunState] = useState<RunState>(() => createInitialRunState(scenario))
  const [summary, setSummary] = useState<DaySummary | null>(null)
  const [submitData, setSubmitData] = useState<SubmitResponse | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null)
  const [yesterday, setYesterday] = useState<YesterdayRecap | null>(null)
  const [previewRunState, setPreviewRunState] = useState<RunState>(() => createInitialRunState(scenario))

  useEffect(() => {
    fetchLeaderboard(TODAY).then(setLeaderboard)
    fetchYesterday(TODAY).then(recap => {
      if (recap) {
        setYesterday(recap)
        setScreen(s => (s === 'start' ? 'yesterday' : s))
      }
    })
  }, [])

  const handleStart = useCallback(() => {
    setRunState(createInitialRunState(scenario))
    setCustomerIndex(0)
    setSummary(null)
    setSubmitData(null)
    setCommunityStats(null)
    setScreen('shop')
  }, [scenario])

  const handleChoiceComplete = useCallback((choice: CustomerChoice) => {
    setRunState(prev => {
      const next = applyChoice(prev, choice)

      const isLast = customerIndex >= scenario.customers.length - 1
      if (isLast) {
        const finalSummary = computeSummary(next)
        setSummary(finalSummary)
        setScreen('endofday')
        submitDay(scenario.id, TODAY, finalSummary).then(data => {
          setSubmitData(data)
          fetchLeaderboard(TODAY).then(setLeaderboard)
        })
        fetchCommunityStats(TODAY, scenario.id, scenario.customers.map(c => c.id)).then(setCommunityStats)
      } else {
        setCustomerIndex(i => i + 1)
      }

      return next
    })
  }, [customerIndex, scenario])

  const handleStartPreview = useCallback(() => {
    setPreviewRunState(createInitialRunState(scenario))
    setScreen('preview')
  }, [scenario])

  const handlePreviewComplete = useCallback(() => {
    setScreen('endofday')
  }, [])

  const totalCustomers = scenario.customers.length
  const previewCustomer = getPreviewCustomer()

  return (
    <div style={{
      width: '100%',
      background: C.navy,
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: C.shadow,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Persistent game header */}
      <div style={{
        background: C.header,
        borderBottom: `1px solid ${C.border}`,
        padding: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.torch, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>Daily</span>
          <span style={{
            fontFamily: PIXEL, fontSize: 11, color: C.yellow, letterSpacing: 0.5,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>Before the Dungeon</span>
        </div>
        {screen === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontSize: 14, color: C.muted }}>
              Customer {customerIndex + 1} / {totalCustomers}
            </span>
            {/* Customer progress pips */}
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: totalCustomers }).map((_, i) => (
                <div key={i} style={{
                  width: 18, height: 3, borderRadius: 2,
                  background: i < customerIndex ? C.torch : i === customerIndex ? C.yellow : C.border,
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </div>
        )}
        {screen === 'start' && (
          <span style={{ fontSize: 14, color: C.muted }}>{scenario.title}</span>
        )}
        {screen === 'yesterday' && (
          <span style={{ fontSize: 14, color: C.muted }}>Recap</span>
        )}
        {screen === 'endofday' && (
          <span style={{ fontSize: 14, color: C.muted }}>Day Complete</span>
        )}
        {screen === 'preview' && (
          <span style={{ fontSize: 14, color: C.muted }}>Tomorrow's Customer (Preview)</span>
        )}
      </div>

      {/* Screen content */}
      {screen === 'yesterday' && yesterday && (
        <YesterdayScreen recap={yesterday} onContinue={() => setScreen('start')} />
      )}
      {screen === 'start' && (
        <StartScreen scenario={scenario} leaderboard={leaderboard} onStart={handleStart} />
      )}
      {screen === 'shop' && (
        <ShopScreen
          key={customerIndex}
          customer={scenario.customers[customerIndex]!}
          runState={runState}
          onChoiceComplete={handleChoiceComplete}
        />
      )}
      {screen === 'endofday' && summary && (
        <EndOfDayScreen
          summary={summary}
          submitData={submitData}
          leaderboard={leaderboard}
          communityStats={communityStats}
          scenario={scenario}
          choices={runState.choices}
          onPlayAgain={handleStart}
          onPreviewCustomer={handleStartPreview}
        />
      )}
      {screen === 'preview' && (
        <ShopScreen
          key="preview"
          customer={previewCustomer}
          runState={previewRunState}
          onChoiceComplete={handlePreviewComplete}
          revealOutcome
        />
      )}
    </div>
  )
}
