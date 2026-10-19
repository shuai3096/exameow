import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WrongQuestionEntry, WrongSort, Question, PracticeSession } from '@exameow/shared'
import { usePracticeStore } from './practice'

const STORAGE_KEY = 'exameow-wrong-questions'

function loadData(): Record<string, Record<string, WrongQuestionEntry>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveData(data: Record<string, Record<string, WrongQuestionEntry>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export const useWrongQuestionsStore = defineStore('wrongQuestions', () => {
  const data = ref(loadData())

  function save() {
    saveData(data.value)
  }

  function recordWrong(bankId: string, questionId: string) {
    if (!data.value[bankId]) {
      data.value[bankId] = {}
    }
    const entry = data.value[bankId]![questionId]
    if (entry) {
      entry.wrongCount++
      entry.consecutiveCorrect = 0
      entry.lastWrongAt = Date.now()
    } else {
      data.value[bankId]![questionId] = {
        questionId,
        wrongCount: 1,
        consecutiveCorrect: 0,
        lastWrongAt: Date.now(),
        addedAt: Date.now(),
      }
    }
    save()
  }

  function recordCorrect(bankId: string, questionId: string): boolean {
    if (!data.value[bankId]?.[questionId]) return false
    const entry = data.value[bankId]![questionId]!
    entry.consecutiveCorrect++
    if (entry.consecutiveCorrect >= 3) {
      delete data.value[bankId]![questionId]
      if (Object.keys(data.value[bankId]!).length === 0) {
        delete data.value[bankId]
      }
      save()
      return true
    }
    save()
    return false
  }

  function removeWrong(bankId: string, questionId: string) {
    if (!data.value[bankId]?.[questionId]) return
    delete data.value[bankId]![questionId]
    if (Object.keys(data.value[bankId]!).length === 0) {
      delete data.value[bankId]
    }
    save()
  }

  function clearBank(bankId: string) {
    delete data.value[bankId]
    save()
  }

  function hasWrongQuestions(bankId: string): boolean {
    const bank = data.value[bankId]
    if (!bank) return false
    return Object.keys(bank).length > 0
  }

  function getWrongCount(bankId: string): number {
    const bank = data.value[bankId]
    if (!bank) return 0
    return Object.keys(bank).length
  }

  function getWrongEntry(bankId: string, questionId: string): WrongQuestionEntry | null {
    return data.value[bankId]?.[questionId] ?? null
  }

  function getBankEntryMap(bankId: string): Record<string, WrongQuestionEntry> {
    return data.value[bankId] ?? {}
  }

  function getWrongQuestions(bankId: string, sort: WrongSort): Question[] {
    const practiceStore = usePracticeStore()
    const bank = practiceStore.getBank(bankId)
    if (!bank) return []

    const entries = data.value[bankId]
    if (!entries) return []

    const sorted = Object.values(entries).sort((a, b) => {
      switch (sort) {
        case 'count-desc':
          return b.wrongCount - a.wrongCount
        case 'count-asc':
          return a.wrongCount - b.wrongCount
        case 'time-desc':
          return b.lastWrongAt - a.lastWrongAt
        case 'time-asc':
          return a.lastWrongAt - b.lastWrongAt
      }
    })

    return sorted
      .map(entry => bank.questions.find(q => q.id === entry.questionId))
      .filter((q): q is Question => q !== undefined)
  }

  function syncSession(session: PracticeSession) {
    const bankId = session.bankId
    for (const item of session.questions) {
      if (item.isCorrect === false) {
        const originalId = item.question.id.replace(/-s\d+$/, '')
        if (!data.value[bankId]) {
          data.value[bankId] = {}
        }
        if (!data.value[bankId]![originalId]) {
          data.value[bankId]![originalId] = {
            questionId: originalId,
            wrongCount: 1,
            consecutiveCorrect: 0,
            lastWrongAt: Date.now(),
            addedAt: Date.now(),
          }
        }
      }
    }
    save()
  }

  function getAllWrongBanks(): { bankId: string; entries: WrongQuestionEntry[] }[] {
    const practiceStore = usePracticeStore()
    return Object.entries(data.value).map(([bankId, entriesMap]) => ({
      bankId,
      entries: Object.values(entriesMap),
    })).filter(item => {
      const bank = practiceStore.getBank(item.bankId)
      return bank !== undefined
    })
  }

  return {
    data,
    recordWrong,
    recordCorrect,
    removeWrong,
    clearBank,
    hasWrongQuestions,
    getWrongCount,
    getWrongEntry,
    getBankEntryMap,
    getWrongQuestions,
    getAllWrongBanks,
    syncSession,
  }
})
