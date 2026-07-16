export type Screen = 'start' | 'yesterday' | 'shop' | 'endofday' | 'preview'
export type ShopPhase = 'arriving' | 'dialogue' | 'ask' | 'items' | 'price' | 'reaction' | 'leaving'
export type PriceLevel = 'discount' | 'fair' | 'greedy'
export type Alignment = 'good' | 'neutral' | 'bad'
export type QuestionKey = 'location' | 'threat' | 'motive' | 'experience'

export interface Item {
  id: string
  name: string
  baseValue: number
  tint: number // placeholder rectangle color for Phaser
}

export interface CustomerOutcome {
  goldBase: number
  respectDelta: number
  reputationDelta: number
  survived: boolean
  harmCaused: boolean
  flavourText: string
}

export interface Customer {
  id: string
  name: string
  type: string
  dialogue: string
  alignment: Alignment
  tint: number // placeholder portrait color
  answers: Record<QuestionKey, string>
  bestItemIds: string[]
  badItemIds: string[]
  outcomes: {
    best: CustomerOutcome
    bad: CustomerOutcome
    default: CustomerOutcome
    refused: CustomerOutcome
  }
}

export interface Scenario {
  id: string
  title: string
  forecast: string
  itemStock: Record<string, number>
  customers: Customer[]
}

export interface CustomerChoice {
  customerId: string
  itemId: string | null
  priceLevel: PriceLevel | null
  goldEarned: number
  respectDelta: number
  reputationDelta: number
  survived: boolean
  harmCaused: boolean
  flavourText: string
}

export interface RunState {
  gold: number
  respect: number
  reputation: number
  choices: CustomerChoice[]
  stock: Record<string, number>
}

export interface DaySummary {
  gold: number
  respect: number
  reputation: number
  survivors: number
  harmPrevented: number
  harmCaused: number
  finalScore: number
  choices: CustomerChoice[]
}

export interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  gold?: number
  respect?: number
  isCurrentUser?: boolean
}

export interface SubmitResponse {
  rank: number
  totalPlayers: number
  dayStreak: number
  alreadySubmitted: boolean
}

export interface CommunityStats {
  totalPlayers: number
  customerStats: {
    customerId: string
    refusedPct: number
    mostCommonItemId: string | null
    mostCommonItemPct: number
    avgGold: number
  }[]
}

export interface YesterdayRecap {
  date: string
  scenarioId: string
  summary: DaySummary
  communityStats: CommunityStats | null
}
