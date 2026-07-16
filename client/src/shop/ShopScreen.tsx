import { useCallback, useEffect, useRef, useState } from 'react'
import type { Customer, CustomerChoice, Item, PriceLevel, QuestionKey, RunState, ShopPhase } from '../types'
import { ALL_ITEMS } from '../data/scenarios'
import { calculateChoice } from './logic'
import { CustomerCard } from './CustomerCard'
import { ItemGrid } from './ItemGrid'
import { PriceChooser } from './PriceChooser'
import { QuestionPicker } from './QuestionPicker'
import { PhaserGame } from '../game/PhaserGame'
import type { PhaserGameHandle } from '../game/PhaserGame'

const C = {
  navy: '#1b1f2f', shadow: '#10131c', bone: '#e8dcc2',
  muted: '#9098b8', torch: '#f0a34a', yellow: '#ffd37a',
  magic: '#5aa9e6', green: '#4f7f52', red: '#b84a4a',
  border: '#252a3d', panel: '#141826',
}

interface Props {
  customer: Customer
  runState: RunState
  onChoiceComplete: (choice: CustomerChoice) => void
  // Preview-only: reveals the outcome immediately instead of hiding it until tomorrow.
  revealOutcome?: boolean
}

export function ShopScreen({ customer, runState, onChoiceComplete, revealOutcome = false }: Props) {
  const [phase, setPhase] = useState<ShopPhase>('arriving')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [lastChoice, setLastChoice] = useState<CustomerChoice | null>(null)
  const [askedQuestion, setAskedQuestion] = useState<QuestionKey | null>(null)
  const phaserRef = useRef<PhaserGameHandle>(null)

  const availableItems: Item[] = Object.keys(runState.stock)
    .map(id => ALL_ITEMS[id])
    .filter((item): item is Item => item !== undefined)

  useEffect(() => {
    if (phase === 'arriving' && phaserRef.current) {
      phaserRef.current.showCustomer(customer.alignment, customer.tint, customer.id)
      const timeout = setTimeout(() => setPhase('dialogue'), 600)
      return () => clearTimeout(timeout)
    }
  }, [phase, customer])

  useEffect(() => {
    if (revealOutcome && phase === 'reaction' && lastChoice && phaserRef.current) {
      const happy = lastChoice.respectDelta >= 0 && !lastChoice.harmCaused
      if (happy) phaserRef.current.playHappy()
      else phaserRef.current.playAngry()
      if (lastChoice.goldEarned > 0) phaserRef.current.spawnCoin()
    }
  }, [revealOutcome, phase, lastChoice])

  useEffect(() => {
    if (phase === 'leaving' && phaserRef.current) {
      phaserRef.current.hideCustomer()
      const timeout = setTimeout(() => {
        if (lastChoice) onChoiceComplete(lastChoice)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [phase, lastChoice, onChoiceComplete])

  const handleRefuse = useCallback(() => {
    const choice = calculateChoice(customer, null, null)
    setLastChoice(choice)
    setPhase('reaction')
  }, [customer])

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItemId(itemId)
    setPhase('price')
  }, [])

  const handlePriceSelect = useCallback((price: PriceLevel) => {
    const choice = calculateChoice(customer, selectedItemId, price)
    setLastChoice(choice)
    setPhase('reaction')
  }, [customer, selectedItemId])

  const handleBackToDialogue = useCallback(() => {
    setSelectedItemId(null)
    setPhase('dialogue')
  }, [])

  const handleAskQuestion = useCallback((key: QuestionKey) => {
    setAskedQuestion(key)
    setPhase('dialogue')
  }, [])

  const selectedItem = selectedItemId ? ALL_ITEMS[selectedItemId] : null
  const showReaction = phase === 'reaction' && lastChoice

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '2 / 3', background: C.shadow, overflow: 'hidden' }}>

      {/* Phaser canvas — fills the whole stage */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <PhaserGame ref={phaserRef} />
      </div>

      {/* Stats strip — thin translucent bar over the top of the image */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '6px 16px',
        background: 'linear-gradient(rgba(10,12,20,0.75), rgba(10,12,20,0))',
        fontSize: 20,
      }}>
        <span style={{ color: C.yellow }}>⬡ {runState.gold}g</span>
        <span style={{ color: '#4a4f6a' }}>│</span>
        <span style={{ color: C.torch }}>♥ {runState.respect}</span>
        <span style={{ color: '#4a4f6a' }}>│</span>
        <span style={{ color: C.magic }}>★ {runState.reputation}</span>
      </div>

      {/* Interaction panel — overlays the lower portion of the image */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        maxHeight: '100%', overflowY: 'auto',
        background: 'linear-gradient(180deg, rgba(19,22,36,0) 0%, rgba(19,22,36,0.94) 22%, rgba(19,22,36,0.97) 100%)',
        padding: '28px 14px 18px',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {phase === 'arriving' && (
          <div style={{ textAlign: 'center', color: C.muted, fontSize: 17, paddingTop: 28 }}>
            A customer approaches…
          </div>
        )}

        {phase === 'dialogue' && (
          <CustomerCard
            customer={customer}
            askedQuestion={askedQuestion}
            onAsk={() => setPhase('ask')}
            onChooseItems={() => setPhase('items')}
            onRefuse={handleRefuse}
          />
        )}

        {phase === 'ask' && (
          <QuestionPicker
            onSelect={handleAskQuestion}
            onBack={() => setPhase('dialogue')}
          />
        )}

        {phase === 'items' && (
          <ItemGrid
            items={availableItems}
            stock={runState.stock}
            onSelect={handleItemSelect}
            onBack={handleBackToDialogue}
          />
        )}

        {phase === 'price' && selectedItem && (
          <PriceChooser
            item={selectedItem}
            onSelect={handlePriceSelect}
            onBack={() => setPhase('items')}
          />
        )}

        {showReaction && revealOutcome && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', gap: 16, fontSize: 18,
                padding: '8px 18px', background: '#1e2238', borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                {lastChoice.goldEarned > 0 && (
                  <span style={{ color: C.yellow }}>+{lastChoice.goldEarned}g</span>
                )}
                {lastChoice.respectDelta !== 0 && (
                  <span style={{ color: lastChoice.respectDelta > 0 ? C.green : C.red }}>
                    {lastChoice.respectDelta > 0 ? '+' : ''}{lastChoice.respectDelta} respect
                  </span>
                )}
                {lastChoice.harmCaused && (
                  <span style={{ color: C.red }}>⚠ Harm</span>
                )}
                {lastChoice.survived && (
                  <span style={{ color: C.green }}>✓ Survives</span>
                )}
              </div>
            </div>
            <div style={{
              background: '#1e2238', borderRadius: 8, padding: '10px 14px',
              border: `1px solid ${C.border}`,
              fontSize: 17, color: C.bone, lineHeight: 1.6, fontStyle: 'italic',
              textAlign: 'center',
            }}>
              {lastChoice.flavourText || 'They leave without a word.'}
            </div>
            <button
              onClick={() => setPhase('leaving')}
              style={{
                padding: '12px', background: C.torch, color: C.shadow,
                border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}

        {showReaction && !revealOutcome && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              background: '#1e2238', borderRadius: 8, padding: '14px',
              border: `1px solid ${C.border}`,
              fontSize: 17, color: C.bone, lineHeight: 1.6,
              textAlign: 'center',
            }}>
              The customer takes their leave, vanishing into the dark toward the crypt.
              <div style={{ color: C.muted, fontSize: 15, marginTop: 8 }}>
                What became of them, you won't know until tomorrow.
              </div>
            </div>
            <button
              onClick={() => setPhase('leaving')}
              style={{
                padding: '12px', background: C.torch, color: C.shadow,
                border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}

        {phase === 'leaving' && (
          <div style={{ textAlign: 'center', color: C.muted, fontSize: 18, paddingTop: 28 }}>
            …
          </div>
        )}
      </div>
    </div>
  )
}
