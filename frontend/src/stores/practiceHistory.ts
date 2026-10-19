import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface DayRecord {
  total: number
  correct: number
  byType: Record<string, { total: number; correct: number }>
}

const KEY = 'exameow-practice-history'

function load(): Record<string, DayRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function todayKey(ts = Date.now()): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const usePracticeHistoryStore = defineStore('practiceHistory', () => {
  const days = ref<Record<string, DayRecord>>(load())
  watch(days, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

  function record(type: string, isCorrect: boolean | null) {
    const key = todayKey()
    if (!days.value[key]) days.value[key] = { total: 0, correct: 0, byType: {} }
    const day = days.value[key]
    day.total++
    if (isCorrect === true) day.correct++
    if (!day.byType[type]) day.byType[type] = { total: 0, correct: 0 }
    day.byType[type]!.total++
    if (isCorrect === true) day.byType[type]!.correct++
  }

  return { days, record, todayKey }
})
