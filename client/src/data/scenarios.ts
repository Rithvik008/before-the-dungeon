import type { Customer, Item, Scenario } from '../types'

// Core roster — depth comes from scarcity and situation, not item count.
// Not every item appears in every scenario; each day's itemStock picks a subset.
export const ALL_ITEMS: Record<string, Item> = {
  'sword':       { id: 'sword',       name: 'Sword',       baseValue: 18, tint: 0x9098b8 },
  'shield':      { id: 'shield',      name: 'Shield',      baseValue: 15, tint: 0x6a7090 },
  'potion':      { id: 'potion',      name: 'Potion',      baseValue: 10, tint: 0xb84a4a },
  'torch':       { id: 'torch',       name: 'Torch',       baseValue: 6,  tint: 0xf0a34a },
  'rope':        { id: 'rope',        name: 'Rope',        baseValue: 5,  tint: 0x8a6a3a },
  'holy-water':  { id: 'holy-water',  name: 'Holy Water',  baseValue: 12, tint: 0x5aa9e6 },
  'lockpick':    { id: 'lockpick',    name: 'Lockpick',    baseValue: 8,  tint: 0xc9a227 },
  'scroll':      { id: 'scroll',      name: 'Scroll',      baseValue: 14, tint: 0xe8dcc2 },
  'food':        { id: 'food',        name: 'Food',        baseValue: 3,  tint: 0x7fae6a },
  'bomb':        { id: 'bomb',        name: 'Bomb',        baseValue: 20, tint: 0x2f2f38 },
}

export const DAY1_CUSTOMERS: Customer[] = [
  {
    id: 'goblin-adventurer',
    name: 'Grix',
    type: 'Goblin Adventurer',
    dialogue: '"Gobbo\'s shortcut go down old well shaft behind crypt. Faster than the road. Probably."',
    alignment: 'neutral',
    tint: 0x4f7f52,
    answers: {
      location: 'Old well shaft behind the crypt. Goes down further than the ladder reaches.',
      threat: 'Nothing down there but old bones and echoes. Gobbo not worried.',
      motive: 'Gobbo collects things. Shiny things. Dangerous things too, if the price is right.',
      experience: 'Gobbo done this a hundred times! ...Eleven times. Gobbo done this eleven times.',
    },
    bestItemIds: ['rope'],
    badItemIds: ['bomb'],
    outcomes: {
      best: {
        goldBase: 8, respectDelta: 5, reputationDelta: 8,
        survived: true, harmCaused: false,
        flavourText: 'Gobbo ties off, drops into the shaft, and vanishes with a cheerful echo.',
      },
      bad: {
        goldBase: 15, respectDelta: -8, reputationDelta: -8,
        survived: false, harmCaused: false,
        flavourText: 'Gobbo wanted to see what the fuse does. Now Gobbo is finding out, some distance away.',
      },
      default: {
        goldBase: 5, respectDelta: 0, reputationDelta: 3,
        survived: true, harmCaused: false,
        flavourText: 'Gobbo shrugs, climbs down the old ladder instead, and waves without looking back.',
      },
      refused: {
        goldBase: 0, respectDelta: 0, reputationDelta: -3,
        survived: true, harmCaused: false,
        flavourText: '"No trust for Grix?!" He finds a loose vine and goes in anyway.',
      },
    },
  },
  {
    id: 'young-prince',
    name: 'Prince Joren',
    type: 'The Runaway Prince',
    dialogue: '"Father\'s guards would drag me home if they knew I\'d slipped out. But the priest swore steel alone won\'t drop the crypt\'s dead — I mean to test that oath myself."',
    alignment: 'good',
    tint: 0x6a8fd8,
    answers: {
      location: 'Straight through the crypt gate. I told the guard on duty I was hunting rats.',
      threat: "Skeletons. Same as the whole village has been whispering about.",
      motive: "If I come home with a hero's tale instead of a signature on a treaty, maybe Father sees me as more than an heir for a moment.",
      experience: "I've had a blade in my hand since I could walk. Never swung it at something already dead, though.",
    },
    bestItemIds: ['holy-water'],
    badItemIds: ['bomb'],
    outcomes: {
      best: {
        goldBase: 12, respectDelta: 10, reputationDelta: 5,
        survived: true, harmCaused: false,
        flavourText: 'The prince uncorks the vial with trembling hands, squares his shoulders, and strides through the crypt gate like he\'s rehearsed this moment a hundred times.',
      },
      bad: {
        goldBase: 18, respectDelta: -20, reputationDelta: -10,
        survived: false, harmCaused: false,
        flavourText: 'He straps the bomb to his belt to "look the part." The crypt ceiling doesn\'t care whose son he is.',
      },
      default: {
        goldBase: 8, respectDelta: 0, reputationDelta: 0,
        survived: true, harmCaused: false,
        flavourText: 'The prince swallows hard, grips his borrowed sword, and heads in. He makes it through — barely, and never quite the same.',
      },
      refused: {
        goldBase: 0, respectDelta: -5, reputationDelta: -10,
        survived: false, harmCaused: false,
        flavourText: 'The prince stiffens, insulted, and stalks in without another word. No one hears from him again.',
      },
    },
  },
  {
    id: 'good-male-apprentice',
    name: 'Toby Quill',
    type: "Wizard's Apprentice",
    dialogue: '"Master needs midnight-root from the shelf-caves below the crypt. He didn\'t mention the caves used to be a mine. Or that mines cave in."',
    alignment: 'good',
    tint: 0x5aa9e6,
    answers: {
      location: 'The shelf-caves below the crypt. Used to be a mine, Master says.',
      threat: "Master didn't mention any monsters. He also didn't mention the mine part, so.",
      motive: "Fetching midnight-root for a potion. Master's very particular about freshness.",
      experience: "This is my first time past the front gate, actually. Please don't tell Master.",
    },
    bestItemIds: ['rope'],
    badItemIds: ['bomb'],
    outcomes: {
      best: {
        goldBase: 9, respectDelta: 10, reputationDelta: 8,
        survived: true, harmCaused: false,
        flavourText: 'He loops the rope over his shoulder like a lifeline and hurries in, muttering a thank-you.',
      },
      bad: {
        goldBase: 14, respectDelta: -15, reputationDelta: -8,
        survived: false, harmCaused: false,
        flavourText: 'He asks what the bomb is for "just to know." Now he knows.',
      },
      default: {
        goldBase: 6, respectDelta: 0, reputationDelta: 3,
        survived: true, harmCaused: false,
        flavourText: 'He nods uncertainly and heads in, gripping the item with both hands.',
      },
      refused: {
        goldBase: 0, respectDelta: -6, reputationDelta: -5,
        survived: false, harmCaused: false,
        flavourText: '"Oh. Okay." He wanders in empty-handed, still muttering the spell he\'s supposed to remember.',
      },
    },
  },
  {
    id: 'shadow-goblin',
    name: 'Skarn',
    type: 'Goblin Enforcer',
    dialogue: '"Warm little shop, this. Shame if something happened to it." A slow smile, all teeth. "Show me what you\'ve got that\'s worth taking."',
    alignment: 'bad',
    tint: 0x3a5a8a,
    answers: {
      location: "Back to the village. Same road I came.",
      threat: "No monsters where I'm headed. Just a few debts that need... encouraging.",
      motive: "A village elder forgets what he owes my boss. I'm here to remind him.",
      experience: "Long enough to know exactly which tools work best on people who don't want to pay.",
    },
    bestItemIds: [],
    badItemIds: ['bomb', 'rope'],
    outcomes: {
      best: {
        goldBase: 0, respectDelta: 0, reputationDelta: 0,
        survived: false, harmCaused: false,
        flavourText: '',
      },
      bad: {
        goldBase: 25, respectDelta: -30, reputationDelta: -15,
        survived: false, harmCaused: true,
        flavourText: 'He pockets it with that same slow smile and melts into the dark toward the village road. Smoke rises by dawn.',
      },
      default: {
        goldBase: 20, respectDelta: -20, reputationDelta: -10,
        survived: false, harmCaused: true,
        flavourText: 'He takes what you offer without a word, weighing it in his hand like a tool already. You feel uneasy. You should.',
      },
      refused: {
        goldBase: 0, respectDelta: 20, reputationDelta: 5,
        survived: false, harmCaused: false,
        flavourText: "The smile finally drops. He holds your gaze a beat too long, then turns and melts into the dark. The village sleeps safely tonight.",
      },
    },
  },
]

export const SCENARIOS: Scenario[] = [
  {
    id: 'skeleton-night',
    title: 'Skeleton Night',
    forecast: 'Skeletons stir near the old crypt. Part of the crypt floor gave way last week — a mine shaft now drops into the dark below. Bandits seen on the village road.',
    itemStock: {
      'torch': 2,
      'holy-water': 1,
      'potion': 2,
      'shield': 1,
      'rope': 1,
      'bomb': 1,
      'food': 5,
    },
    // One customer per day — the rest of DAY1_CUSTOMERS is written but not yet reachable.
    customers: DAY1_CUSTOMERS.slice(0, 1),
  },
]

export function getScenarioForDate(_date: string): Scenario {
  const idx = 0 // later: derive from date hash
  return SCENARIOS[idx % SCENARIOS.length]!
}

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id)
}

// Preview-only: lets the "peek at tomorrow" flow demo the next day's customer
// in the same sitting, without waiting for a real calendar day.
export function getPreviewCustomer(): Customer {
  return DAY1_CUSTOMERS.find(c => c.id === 'shadow-goblin')!
}
