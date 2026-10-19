import { ref, computed } from 'vue'
import { fileToCanvas } from '@/utils/image'
import { recognizeImage } from '@/utils/ocr'

export type RecognizePhase = 'idle' | 'loading-model' | 'recognizing'

export interface RecognizeOptions {
  forceOcr?: boolean
}

export function useImageSearch() {
  const phase = ref<RecognizePhase>('idle')
  const error = ref('')
  const busy = computed(() => phase.value !== 'idle')

  let generation = 0

  async function recognize(file: Blob, opts: RecognizeOptions = {}): Promise<string | null> {
    const gen = ++generation
    error.value = ''

    try {
      phase.value = 'loading-model'
      const canvas = await fileToCanvas(file)
      phase.value = 'recognizing'
      const text = await recognizeImage(canvas)

      if (gen !== generation) return null
      return text.trim()
    } catch (e: any) {
      if (gen !== generation) return null
      error.value = e?.message || String(e)
      return null
    } finally {
      if (gen === generation) phase.value = 'idle'
    }
  }

  function cancel() {
    generation++
    phase.value = 'idle'
  }

  return { phase, error, busy, recognize, cancel }
}
