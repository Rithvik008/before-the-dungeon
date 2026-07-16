import type { Customer, CustomerChoice, CustomerOutcome, DaySummary, PriceLevel, RunState, Scenario } from '../types'
import { ALL_ITEMS } from '../data/scenarios'

const PRICE_GOLD_MULT: Record<PriceLevel, number> = {
  discount: 0.7,
  fair: 1.0,
  greedy: 1.6,
}

// Good customers lose respect if overcharged. Bad customers — price doesn't affect respect.
const PRICE_RESPECT_DELTA: Record<PriceLevel, number> = {
  discount: 6,
  fair: 0,
  greedy: -12,
}

export function calculateChoice(
  customer: Customer,
  itemId: string | null,
  priceLevel: PriceLevel | null,
): CustomerChoice {
  if (itemId === null) {
    const o = customer.outcomes.refused
    return {
      customerId: customer.id,
      itemId: null,
      priceLevel: null,
      goldEarned: 0,
      respectDelta: o.respectDelta,
      reputationDelta: o.reputationDelta,
      survived: o.survived,
      harmCaused: o.harmCaused,
      flavourText: o.flavourText,
    }
  }

  let o: CustomerOutcome
  if (customer.bestItemIds.includes(itemId)) {
    o = customer.outcomes.best
  } else if (customer.badItemIds.includes(itemId)) {
    o = customer.outcomes.bad
  } else {
    o = customer.outcomes.default
  }

  const item = ALL_ITEMS[itemId]
  const baseGold = o.goldBase > 0 ? o.goldBase : (item?.baseValue ?? 0)
  const gold = Math.round(baseGold * PRICE_GOLD_MULT[priceLevel!])

  const priceRespect = customer.alignment === 'bad' ? 0 : PRICE_RESPECT_DELTA[priceLevel!]
  const priceRep = priceLevel === 'greedy' && customer.alignment !== 'bad' ? -5 : 0

  return {
    customerId: customer.id,
    itemId,
    priceLevel: priceLevel!,
    goldEarned: gold,
    respectDelta: o.respectDelta + priceRespect,
    reputationDelta: o.reputationDelta + priceRep,
    survived: o.survived,
    harmCaused: o.harmCaused,
    flavourText: o.flavourText,
  }
}

export function applyChoice(state: RunState, choice: CustomerChoice): RunState {
  const stock = { ...state.stock }
  if (choice.itemId) {
    stock[choice.itemId] = Math.max(0, (stock[choice.itemId] ?? 0) - 1)
  }
  return {
    gold: state.gold + choice.goldEarned,
    respect: Math.max(0, Math.min(100, state.respect + choice.respectDelta)),
    reputation: Math.max(0, Math.min(100, state.reputation + choice.reputationDelta)),
    choices: [...state.choices, choice],
    stock,
  }
}

export function computeSummary(state: RunState): DaySummary {
  const survivors = state.choices.filter(c => c.survived).length
  const harmCaused = state.choices.filter(c => c.harmCaused).length
  const harmPrevented = state.choices.filter(
    c => c.itemId === null && !c.harmCaused,
  ).length

  const finalScore =
    state.gold +
    state.respect +
    Math.round(state.reputation * 0.5) +
    survivors * 10 +
    harmPrevented * 15 -
    harmCaused * 20

  return {
    gold: state.gold,
    respect: state.respect,
    reputation: state.reputation,
    survivors,
    harmPrevented,
    harmCaused,
    finalScore: Math.max(0, finalScore),
    choices: state.choices,
  }
}

export function createInitialRunState(scenario: Scenario): RunState {
  return {
    gold: 0,
    respect: 50,
    reputation: 50,
    choices: [],
    stock: { ...scenario.itemStock },
  }
}
