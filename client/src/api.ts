import type { CommunityStats, DaySummary, LeaderboardEntry, SubmitResponse, YesterdayRecap } from './types'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} ${res.status}`)
  return res.json() as Promise<T>
}

export async function submitDay(
  scenarioId: string,
  date: string,
  summary: DaySummary,
): Promise<SubmitResponse> {
  try {
    return await post<SubmitResponse>('/api/submit', { scenarioId, date, ...summary })
  } catch {
    return { rank: 0, totalPlayers: 0, dayStreak: 1, alreadySubmitted: false }
  }
}

export async function fetchLeaderboard(
  date: string,
  type: 'balanced' | 'gold' | 'respect' = 'balanced',
): Promise<LeaderboardEntry[]> {
  try {
    return await post<LeaderboardEntry[]>('/api/leaderboard', { date, type })
  } catch {
    return [
      { rank: 1, username: 'noble_counter', score: 210 },
      { rank: 2, username: 'greedypockets', score: 195 },
      { rank: 3, username: 'the_refuser', score: 178 },
    ]
  }
}

export async function fetchCommunityStats(
  date: string,
  scenarioId: string,
  customerIds: string[],
): Promise<CommunityStats | null> {
  try {
    return await post<CommunityStats>('/api/stats', { date, scenarioId, customerIds })
  } catch {
    return {
      totalPlayers: 340,
      customerStats: [
        { customerId: 'goblin-adventurer', refusedPct: 4, mostCommonItemId: 'rope', mostCommonItemPct: 58, avgGold: 7 },
        { customerId: 'young-prince', refusedPct: 6, mostCommonItemId: 'holy-water', mostCommonItemPct: 61, avgGold: 11 },
        { customerId: 'good-male-apprentice', refusedPct: 12, mostCommonItemId: 'potion', mostCommonItemPct: 34, avgGold: 7 },
        { customerId: 'shadow-goblin', refusedPct: 62, mostCommonItemId: 'potion', mostCommonItemPct: 18, avgGold: 15 },
      ],
    }
  }
}

export async function fetchYesterday(date: string): Promise<YesterdayRecap | null> {
  try {
    const result = await post<YesterdayRecap | null>('/api/yesterday', { date })
    return result
  } catch {
    return null
  }
}
