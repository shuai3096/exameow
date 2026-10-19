import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { GradedQuestion } from '@exameow/shared'

export interface JoinedRecord {
  code: string
  name: string
  joinedAt: number
  title?: string
  score?: number
  totalScore?: number
  submittedAt?: number
  graded?: GradedQuestion[]
}

const KEY = 'exameow-joined'

function load(): JoinedRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export const useJoinedStore = defineStore('joined', () => {
  const list = ref<JoinedRecord[]>(load())
  watch(list, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

  function add(code: string, name: string) {
    const existing = list.value.find((r) => r.code === code && r.name === name)
    if (existing) {
      existing.joinedAt = Date.now()
      return
    }
    list.value.unshift({ code, name, joinedAt: Date.now() })
  }

  function markSubmitted(code: string, name: string, title: string, score: number, totalScore: number, graded?: GradedQuestion[]) {
    const rec = list.value.find((r) => r.code === code && r.name === name)
    if (!rec) return
    rec.title = title
    rec.score = score
    rec.totalScore = totalScore
    rec.submittedAt = Date.now()
    if (graded) rec.graded = graded
  }

  function remove(code: string, name: string) {
    list.value = list.value.filter((r) => !(r.code === code && r.name === name))
  }

  return { list, add, markSubmitted, remove }
})
