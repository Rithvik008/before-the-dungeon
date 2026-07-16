import { createServer, context } from '@devvit/server'
import type { RedisClient } from '@devvit/public-api'

function getRedis(): RedisClient {
  return (context as unknown as { redis: RedisClient }).redis
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

async function readBody(req: NodeJS.ReadableStream): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: Buffer) => { data += chunk.toString() })
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')) } catch { resolve({}) }
    })
    req.on('error', reject)
  })
}

type Res = { end: (s: string) => void; setHeader: (h: string, v: string) => void; statusCode: number }

function json(res: Res, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

interface ChoiceRecord {
  customerId: string
  itemId: string | null
}

interface DaySummaryBody {
  gold: number
  respect: number
  reputation: number
  survivors: number
  harmPrevented: number
  harmCaused: number
  finalScore: number
  choices: ChoiceRecord[]
}

interface CustomerStat {
  customerId: string
  refusedPct: number
  mostCommonItemId: string | null
  mostCommonItemPct: number
  avgGold: number
}

async function computeCustomerStats(
  r: RedisClient,
  date: string,
  scenarioId: string,
  customerIds: string[],
): Promise<CustomerStat[]> {
  return Promise.all(customerIds.map(async (customerId): Promise<CustomerStat> => {
    const counts = await r.hGetAll(`btd:custstats:${date}:${scenarioId}:${customerId}`)
    const entries = Object.entries(counts).map(([k, v]) => [k, parseInt(v, 10)] as [string, number])
    const total = entries.reduce((s, [, n]) => s + n, 0)
    const refusedCount = counts['refused'] ? parseInt(counts['refused'], 10) : 0

    let mostCommonItemId: string | null = null
    let mostCommonCount = 0
    for (const [key, n] of entries) {
      if (key === 'refused') continue
      if (n > mostCommonCount) { mostCommonCount = n; mostCommonItemId = key }
    }

    return {
      customerId,
      refusedPct: total > 0 ? Math.round((refusedCount / total) * 100) : 0,
      mostCommonItemId,
      mostCommonItemPct: total > 0 ? Math.round((mostCommonCount / total) * 100) : 0,
      avgGold: 0,
    }
  }))
}

const server = createServer(async (req, res) => {
  const url = req.url ?? '/'

  // ── POST /api/submit ─────────────────────────────────────────────────────
  if (url.startsWith('/api/submit')) {
    const userId = context.userId
    const username = context.username ?? 'anonymous'
    if (!userId) { json(res, 401, { error: 'Not logged in' }); return }

    const body = (await readBody(req)) as DaySummaryBody & { date: string; scenarioId: string }

    const { date, scenarioId, finalScore, gold, respect, reputation, survivors, harmPrevented, harmCaused, choices } = body
    const r = getRedis()

    const resultKey = `btd:result:${date}:${userId}`
    const existing = await r.get(resultKey)
    if (existing) {
      const p = JSON.parse(existing) as { rank: number; dayStreak: number }
      json(res, 200, { rank: p.rank, totalPlayers: 0, dayStreak: p.dayStreak, alreadySubmitted: true })
      return
    }

    // Leaderboard sorted by finalScore descending (negate score for max-first)
    const lbKey = `btd:lb:${date}:${scenarioId}`
    await r.zAdd(lbKey, { score: -finalScore, member: userId })
    await r.expire(lbKey, 60 * 60 * 24 * 8)

    const rawRank = await r.zRank(lbKey, userId) ?? 0
    const rank = rawRank + 1
    const totalPlayers = await r.zCard(lbKey)

    // Gold leaderboard
    const goldKey = `btd:lb:gold:${date}:${scenarioId}`
    await r.zAdd(goldKey, { score: -gold, member: userId })
    await r.expire(goldKey, 60 * 60 * 24 * 8)

    // Respect leaderboard
    const respKey = `btd:lb:respect:${date}:${scenarioId}`
    await r.zAdd(respKey, { score: -respect, member: userId })
    await r.expire(respKey, 60 * 60 * 24 * 8)

    // Full choice log for this user/date — powers next-visit "yesterday" recap
    const choicesKey = `btd:choices:${date}:${userId}`
    await r.set(choicesKey, JSON.stringify({
      scenarioId,
      summary: { gold, respect, reputation, survivors, harmPrevented, harmCaused, finalScore, choices },
    }))
    await r.expire(choicesKey, 60 * 60 * 24 * 4)

    // Community per-customer counters (what item/refusal % across all players)
    for (const c of choices ?? []) {
      const field = c.itemId ?? 'refused'
      const statKey = `btd:custstats:${date}:${scenarioId}:${c.customerId}`
      await r.hIncrBy(statKey, field, 1)
      await r.expire(statKey, 60 * 60 * 24 * 8)
    }

    // Day streak
    const streakKey = `btd:streak:${userId}`
    const streakRaw = await r.get(streakKey)
    const streak = streakRaw ? JSON.parse(streakRaw) as { lastDate: string; dayStreak: number } : null
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
    let dayStreak = 1
    if (streak) {
      if (streak.lastDate === yesterday) dayStreak = streak.dayStreak + 1
      else if (streak.lastDate === date) dayStreak = streak.dayStreak
    }

    await r.set(streakKey, JSON.stringify({ lastDate: date, dayStreak }))
    await r.set(resultKey, JSON.stringify({ rank, dayStreak, finalScore, username }))
    await r.expire(resultKey, 60 * 60 * 24 * 2)
    await r.set(`btd:username:${userId}`, username)

    json(res, 200, { rank, totalPlayers, dayStreak, alreadySubmitted: false })
    return
  }

  // ── POST /api/leaderboard ─────────────────────────────────────────────────
  if (url.startsWith('/api/leaderboard')) {
    const body = (await readBody(req)) as {
      date?: string
      scenarioId?: string
      type?: 'balanced' | 'gold' | 'respect'
    }
    const date = body.date ?? todayDate()
    const scenarioId = body.scenarioId ?? 'skeleton-night'
    const type = body.type ?? 'balanced'
    const r = getRedis()

    const lbKey = type === 'gold'
      ? `btd:lb:gold:${date}:${scenarioId}`
      : type === 'respect'
        ? `btd:lb:respect:${date}:${scenarioId}`
        : `btd:lb:${date}:${scenarioId}`

    const entries = await r.zRange(lbKey, 0, 9, { by: 'rank' })
    const currentUserId = context.userId

    const rows = await Promise.all(
      entries.map(async (entry: { member: string; score: number }, i: number) => {
        const username = (await r.get(`btd:username:${entry.member}`)) ?? entry.member
        return {
          rank: i + 1,
          username,
          score: -entry.score, // undo negation
          isCurrentUser: entry.member === currentUserId,
        }
      }),
    )

    json(res, 200, rows)
    return
  }

  // ── POST /api/stats ───────────────────────────────────────────────────────
  if (url.startsWith('/api/stats')) {
    const body = (await readBody(req)) as { date?: string; scenarioId?: string; customerIds?: string[] }
    const date = body.date ?? todayDate()
    const scenarioId = body.scenarioId ?? 'skeleton-night'
    const customerIds = body.customerIds ?? []
    const r = getRedis()

    const totalPlayers = await r.zCard(`btd:lb:${date}:${scenarioId}`)
    const customerStats = await computeCustomerStats(r, date, scenarioId, customerIds)

    json(res, 200, { totalPlayers, customerStats })
    return
  }

  // ── POST /api/yesterday ──────────────────────────────────────────────────
  if (url.startsWith('/api/yesterday')) {
    const userId = context.userId
    if (!userId) { json(res, 200, null); return }
    const r = getRedis()

    const body = (await readBody(req)) as { date?: string }
    const today = body.date ?? todayDate()

    const streakRaw = await r.get(`btd:streak:${userId}`)
    if (!streakRaw) { json(res, 200, null); return }
    const streak = JSON.parse(streakRaw) as { lastDate: string; dayStreak: number }
    if (!streak.lastDate || streak.lastDate === today) { json(res, 200, null); return }

    const choicesRaw = await r.get(`btd:choices:${streak.lastDate}:${userId}`)
    if (!choicesRaw) { json(res, 200, null); return }
    const stored = JSON.parse(choicesRaw) as { scenarioId: string; summary: DaySummaryBody }

    const customerIds = [...new Set(stored.summary.choices.map(c => c.customerId))]
    const totalPlayers = await r.zCard(`btd:lb:${streak.lastDate}:${stored.scenarioId}`)
    const customerStats = await computeCustomerStats(r, streak.lastDate, stored.scenarioId, customerIds)

    json(res, 200, {
      date: streak.lastDate,
      scenarioId: stored.scenarioId,
      summary: stored.summary,
      communityStats: { totalPlayers, customerStats },
    })
    return
  }

  json(res, 404, { error: 'Not found' })
})

const PORT = parseInt(process.env['PORT'] ?? '3000', 10)
server.listen(PORT, () => {
  console.log(`Before the Dungeon server on port ${PORT}`)
})
