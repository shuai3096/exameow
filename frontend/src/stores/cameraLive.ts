import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question } from '@exameow/shared'

export interface MatchResult {
  question: Question
  bankName: string
  score: number
}

export const useCameraLiveStore = defineStore('cameraLive', () => {
  const status = ref<'idle' | 'scanning' | 'paused'>('idle')
  const currentResult = ref<MatchResult | null>(null)
  const ocrText = ref('')
  const ocrError = ref('')

  const isScanning = computed(() => status.value === 'scanning')
  const answerText = computed(() => {
    if (!currentResult.value) return null
    return currentResult.value.question.answer
  })

  function startScanning() {
    status.value = 'scanning'
    currentResult.value = null
    ocrText.value = ''
    ocrError.value = ''
  }

  function pauseScanning() {
    status.value = 'paused'
  }

  function resumeScanning() {
    status.value = 'scanning'
  }

  function stopScanning() {
    status.value = 'idle'
    currentResult.value = null
    ocrText.value = ''
    ocrError.value = ''
  }

  function setResult(result: MatchResult | null, text: string) {
    currentResult.value = result
    ocrText.value = text
  }

  return {
    status,
    currentResult,
    ocrText,
    ocrError,
    isScanning,
    answerText,
    startScanning,
    pauseScanning,
    resumeScanning,
    stopScanning,
    setResult,
  }
})
