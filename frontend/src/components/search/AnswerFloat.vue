<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useScreenRecordStore } from '@/stores/screenRecord'
import { useI18nStore } from '@/stores/i18n'
import {
  ArrowsPointingOutIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PauseCircleIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { PlayIcon } from '@heroicons/vue/24/solid'

const store = useScreenRecordStore()
const i18n = useI18nStore()

const adjusting = ref(true)
const hasBegun = ref(false)
const unlistenFns: Array<() => void> = []

let win: any = null
let ctl: {
  initFloat: () => Promise<void>
  adjust: () => Promise<void>
  stop: () => Promise<void>
} | null = null

onMounted(async () => {
  const { getCurrentWindow } = await import('@tauri-apps/api/window')
  const { listen } = await import('@tauri-apps/api/event')
  win = getCurrentWindow()

  const { useScreenRecord } = await import('@/composables/useScreenRecord')
  ctl = useScreenRecord()
  await ctl.initFloat()

  unlistenFns.push(await listen('screen-record:begin', () => {
    adjusting.value = false
    hasBegun.value = true
  }))
})

onUnmounted(() => {
  for (const fn of unlistenFns) fn()
})

function onDragArea(e: MouseEvent) {
  if (e.button !== 0 || !win) return
  win.startDragging().catch(() => {})
}

async function handleAdjust() {
  adjusting.value = true
  await ctl?.adjust()
}

async function handleExit() {
  await ctl?.stop()
}

async function handleBegin() {
  hasBegun.value = true
  const { emit } = await import('@tauri-apps/api/event')
  await emit('screen-record:request-begin')
}

function isCorrect(idx: number): boolean {
  const r = store.currentResult
  if (!r) return false
  const q = r.question
  if (q.type !== 'single_choice' && q.type !== 'multi_choice') return false
  const letters = (q.answer ?? '').trim().toUpperCase().replace(/[^A-H]/g, '')
  return letters.includes(String.fromCharCode(65 + idx))
}
</script>

<template>
  <div class="w-full h-full select-none">
    <div class="float-card w-full h-full flex flex-col">
      <div
        class="shrink-0 cursor-grab active:cursor-grabbing"
        @mousedown="onDragArea"
      >
        <div class="flex justify-center pt-2">
          <div class="float-grip" />
        </div>
        <div class="flex items-center justify-between pl-3.5 pr-2 py-1.5">
          <div class="flex items-center gap-1.5 min-w-0">
            <VideoCameraIcon class="w-4 h-4 shrink-0" style="color: var(--accent);" />
            <span class="text-[13px] font-semibold truncate" style="color: var(--fg);">
              {{ i18n.t('searchModeScreenRecord') }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              class="float-btn"
              @mousedown.stop
              @click="handleAdjust"
              :title="i18n.t('searchScreenRecordAdjust')"
            >
              <ArrowsPointingOutIcon class="w-4 h-4" />
            </button>
            <button
              class="float-btn float-btn-danger"
              @mousedown.stop
              @click="handleExit"
              :title="i18n.t('searchScreenRecordExit')"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="adjusting && hasBegun" class="shrink-0 px-3.5 pb-1.5">
        <div class="float-paused">
          <PauseCircleIcon class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ i18n.t('searchScreenRecordPaused') }}</span>
        </div>
      </div>

      <div class="float-body flex-1 overflow-y-auto px-3.5 pb-3 min-h-0">
        <div v-if="adjusting" class="flex flex-col items-center justify-center h-full gap-3">
          <button
            class="float-begin-btn"
            @mousedown.stop
            @click="handleBegin"
          >
            <PlayIcon class="w-6 h-6" />
          </button>
          <div class="text-center">
            <p class="text-[15px] font-semibold" style="color: var(--accent);">
              {{ hasBegun ? i18n.t('searchScreenRecordResume') : i18n.t('searchScreenRecordStart') }}
            </p>
            <p v-if="!hasBegun" class="text-[11px] mt-1" style="color: var(--fg2);">
              先调整录制框，再点击开始
            </p>
          </div>
        </div>

        <div v-else-if="store.currentResult" :key="store.currentResult.question.id" class="space-y-2 pt-0.5">
          <div class="float-answer">
            <CheckIcon class="w-4 h-4 shrink-0" />
            <span class="text-[13px] font-bold">
              {{ i18n.t('searchScreenRecordAnswer') }}: {{ store.currentResult.question.answer }}
            </span>
          </div>

          <p class="text-[13px] leading-snug line-clamp-3" style="color: var(--fg);">
            {{ store.currentResult.question.stem }}
          </p>

          <div v-if="store.currentResult.question.options?.length" class="space-y-1">
            <div
              v-for="(opt, idx) in store.currentResult.question.options"
              :key="idx"
              class="float-option"
              :class="{ 'float-option-correct': isCorrect(idx) }"
            >
              <span class="float-letter" :class="{ 'float-letter-correct': isCorrect(idx) }">
                {{ String.fromCharCode(65 + idx) }}
              </span>
              <span class="truncate text-[12px]">{{ opt }}</span>
            </div>
          </div>

          <p class="text-[10px] pt-0.5 truncate" style="color: var(--fg2);">
            {{ store.currentResult.bankName }}
          </p>
        </div>

        <div v-else-if="store.ocrError" class="flex flex-col items-center justify-center h-full gap-2.5">
          <div class="float-empty-icon" style="color: rgb(var(--md-error));">
            <XMarkIcon class="w-5 h-5" />
          </div>
          <p class="text-[13px] text-center" style="color: rgb(var(--md-error));">
            OCR 初始化失败
          </p>
          <p class="text-[11px] text-center px-2" style="color: var(--fg2);">
            {{ store.ocrError }}
          </p>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-full gap-2.5">
          <div class="float-empty-icon">
            <MagnifyingGlassIcon class="w-5 h-5" />
          </div>
          <p class="text-[13px]" style="color: var(--fg2);">
            {{ i18n.t('searchScreenRecordNoMatch') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  background: transparent !important;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<style scoped>
.float-card {
  --fg: rgb(var(--md-on-surface));
  --fg2: rgb(var(--md-on-surface-variant));
  --fill: rgb(var(--md-surface-container-high));
  --accent: rgb(var(--md-primary));
  background: rgb(var(--md-surface-container));
  border-radius: 16px;
  border: 1px solid rgb(var(--md-outline-variant));
  overflow: hidden;
}

.float-grip {
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: rgb(var(--md-outline-variant));
}

.float-btn {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: var(--fg);
  background: var(--fill);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.float-btn:hover {
  filter: brightness(0.94);
}
.float-btn:active {
  transform: scale(0.88);
}
.float-btn-danger {
  color: rgb(var(--md-error));
}

.float-paused {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--md-on-tertiary-container));
  background: rgb(var(--md-tertiary-container));
}

.float-answer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  color: rgb(var(--md-on-primary-container));
  background: rgb(var(--md-primary-container));
  animation: float-pop 0.25s ease;
}

.float-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 12px;
  color: var(--fg2);
  background: var(--fill);
}
.float-option-correct {
  color: rgb(var(--md-on-primary-container));
  font-weight: 600;
  background: rgb(var(--md-primary-container));
}

.float-letter {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--fg2);
  background: rgb(var(--md-surface-container-highest));
}
.float-letter-correct {
  color: rgb(var(--md-on-primary));
  background: rgb(var(--md-primary));
}

.float-empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg2);
  background: var(--fill);
}

.float-body::-webkit-scrollbar {
  width: 4px;
}
.float-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--fill);
}

@keyframes float-pop {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.float-begin-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: rgb(var(--md-on-primary));
  background: rgb(var(--md-primary));
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(var(--md-primary) / 0.35);
  transition: transform 0.15s ease, filter 0.15s ease;
}
.float-begin-btn:hover {
  filter: brightness(1.06);
  transform: scale(1.04);
}
.float-begin-btn:active {
  transform: scale(0.96);
}
</style>
