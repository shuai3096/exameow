<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { useCameraLiveStore } from '@/stores/cameraLive'
import { useCameraLive } from '@/composables/useCameraLive'
import { PauseIcon, XMarkIcon, MagnifyingGlassIcon, CheckIcon, Cog6ToothIcon, ArrowLeftIcon, AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import { PlayIcon } from '@heroicons/vue/24/solid'
import { api } from '@/api'
import SearchSettingsPanel from '@/components/search/SearchSettingsPanel.vue'

const router = useRouter()
const i18n = useI18nStore()
const store = useCameraLiveStore()
const { startCamera, stopCamera, pauseCamera, resumeCamera } = useCameraLive()

const videoRef = ref<HTMLVideoElement | null>(null)
const cameraReady = ref(false)
const cameraError = ref('')
const permissionDenied = ref(false)
const showSettings = ref(false)

async function handleStart() {
  cameraError.value = ''
  permissionDenied.value = false
  try {
    store.startScanning()
    await nextTick()
    if (!videoRef.value) return
    await startCamera(videoRef.value)
    cameraReady.value = true
  } catch (e: any) {
    store.stopScanning()
    const msg = e?.message || String(e)
    if (msg.includes('Permission') || msg.includes('NotAllowedError') || msg.includes('denied')) {
      cameraError.value = i18n.t('searchCameraLivePermissionDenied')
      permissionDenied.value = true
    } else {
      cameraError.value = i18n.t('searchCameraLiveStartFailed')
    }
    console.warn('[拍屏搜题] start failed:', e)
  }
}

import { isAndroid } from '@/utils/platform'

async function openSettings() {
  try {
    await api.openAppSettings()
  } catch {}
  if (isAndroid()) {
    try {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl('package:com.exameow.app')
    } catch {}
  }
}

async function handlePause() {
  await pauseCamera()
  store.pauseScanning()
}

async function handleResume() {
  store.resumeScanning()
  await nextTick()
  if (!videoRef.value) return
  await resumeCamera(videoRef.value)
}

async function handleExit() {
  stopCamera()
  store.stopScanning()
  cameraReady.value = false
  router.push('/search')
}

onUnmounted(() => {
  stopCamera()
  store.stopScanning()
})

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
  <div>
    <div class="flex items-center gap-2 mb-1">
      <button class="btn-icon" @click="handleExit">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-display-sm flex-1">{{ i18n.t('searchModeCameraLive') }}</h1>
    </div>
    <p class="text-body-lg mb-4" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('searchModeCameraLiveDesc') }}</p>

    <div v-if="!cameraReady && store.status === 'idle'" class="card-filled p-6 flex flex-col gap-4">
      <div class="flex items-start justify-end gap-2">
        <button
          class="btn-tonal text-sm shrink-0 !px-3 !py-2"
          :style="{ color: showSettings ? 'rgb(var(--md-primary))' : 'rgb(var(--md-on-surface-variant))' }"
          @click="showSettings = !showSettings"
          :title="i18n.t('searchSettings')"
        >
          <AdjustmentsHorizontalIcon class="w-4 h-4" />
          <span class="hidden sm:inline">{{ i18n.t('searchSettings') }}</span>
        </button>
      </div>

      <div class="flex flex-col items-center gap-4 text-center">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center"
          :style="{ backgroundColor: 'rgb(var(--md-primary-container))', color: 'rgb(var(--md-on-primary-container))' }"
        >
          <MagnifyingGlassIcon class="w-8 h-8" />
        </div>
        <button
          class="px-8 py-3 rounded-full text-title-md font-medium transition-all duration-200 cursor-pointer"
          :style="{ backgroundColor: 'rgb(var(--md-primary))', color: 'rgb(var(--md-on-primary))' }"
          @click="handleStart"
        >
          {{ i18n.t('searchCameraLiveStart') }}
        </button>
        <p v-if="cameraError" class="text-body-sm" :style="{ color: 'rgb(var(--md-error))' }">
          {{ cameraError }}
        </p>
        <div v-if="permissionDenied" class="flex gap-3 flex-wrap justify-center">
          <button class="btn-tonal text-sm !px-5 !py-2.5" @click="openSettings">
            <Cog6ToothIcon class="w-4 h-4" />
            {{ i18n.t('searchCameraLiveOpenSettings') }}
          </button>
          <button class="btn-outlined text-sm !px-5 !py-2.5" @click="handleStart">
            {{ i18n.t('searchRetry') }}
          </button>
        </div>
      </div>

      <div v-if="showSettings" class="pt-4" style="border-top: 1px solid rgb(var(--md-outline-variant) / 0.4)">
        <SearchSettingsPanel />
      </div>
    </div>

    <template v-else>
      <div class="flex flex-col gap-3" style="height: calc(100vh - 8rem)">
        <div class="relative flex-1 min-h-0 rounded-2xl overflow-hidden" style="background: rgb(var(--md-surface-container-high));">
          <video
            ref="videoRef"
            class="w-full h-full object-cover"
            playsinline
            muted
            autoplay
          />

          <div
            v-if="store.status === 'scanning'"
            class="absolute top-4 right-4 w-3 h-3 rounded-full"
            style="background: rgb(var(--md-error)); animation: cameraLive-pulse 1.5s ease-in-out infinite;"
          />

          <div
            v-if="store.status === 'paused'"
            class="absolute inset-0 flex items-center justify-center"
            style="background: rgba(0,0,0,0.4);"
          >
            <div class="text-center">
              <PauseIcon class="w-10 h-10 mx-auto mb-2" style="color: white;" />
              <p class="text-white text-title-md font-semibold">{{ i18n.t('searchCameraLivePausedLabel') }}</p>
            </div>
          </div>
        </div>

        <div class="shrink-0 flex items-center justify-center gap-4">
          <template v-if="store.status === 'scanning'">
            <button class="btn-tonal !px-6 !py-3" @click="handlePause">
              <PauseIcon class="w-5 h-5" />
              {{ i18n.t('searchCameraLivePause') }}
            </button>
            <button
              class="btn-outlined !px-6 !py-3"
              :style="{ color: 'rgb(var(--md-error))' }"
              @click="handleExit"
            >
              <XMarkIcon class="w-5 h-5" />
              {{ i18n.t('searchCameraLiveExit') }}
            </button>
          </template>
          <template v-else-if="store.status === 'paused'">
            <button class="btn-filled !px-6 !py-3" @click="handleResume">
              <PlayIcon class="w-5 h-5" />
              {{ i18n.t('searchCameraLiveResume') }}
            </button>
            <button
              class="btn-outlined !px-6 !py-3"
              :style="{ color: 'rgb(var(--md-error))' }"
              @click="handleExit"
            >
              <XMarkIcon class="w-5 h-5" />
              {{ i18n.t('searchCameraLiveExit') }}
            </button>
          </template>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto">
          <div v-if="store.ocrError" class="card-outlined p-4 text-center">
            <p class="text-body-md" :style="{ color: 'rgb(var(--md-error))' }">OCR 初始化失败</p>
            <p class="text-body-sm mt-1" style="color: rgb(var(--md-on-surface-variant));">{{ store.ocrError }}</p>
          </div>

          <div v-else-if="store.currentResult" :key="store.currentResult.question.id" class="card-filled p-4 space-y-2">
            <div class="flex items-center gap-2">
              <CheckIcon class="w-5 h-5 shrink-0" style="color: rgb(var(--md-primary));" />
              <span class="text-title-md font-bold">
                {{ i18n.t('searchScreenRecordAnswer') }}: {{ store.currentResult.question.answer }}
              </span>
            </div>

            <p class="text-body-md leading-snug">
              {{ store.currentResult.question.stem }}
            </p>

            <div v-if="store.currentResult.question.options?.length" class="space-y-1.5">
              <div
                v-for="(opt, idx) in store.currentResult.question.options"
                :key="idx"
                class="flex items-center gap-2 p-2 rounded-xl"
                :style="isCorrect(idx) ? {
                  backgroundColor: 'rgb(var(--md-primary-container))',
                  color: 'rgb(var(--md-on-primary-container))',
                  fontWeight: 600,
                } : {
                  backgroundColor: 'rgb(var(--md-surface-container-highest))',
                  color: 'rgb(var(--md-on-surface-variant))',
                }"
              >
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :style="isCorrect(idx) ? {
                    backgroundColor: 'rgb(var(--md-primary))',
                    color: 'rgb(var(--md-on-primary))',
                  } : {
                    backgroundColor: 'rgb(var(--md-surface-container))',
                    color: 'rgb(var(--md-on-surface-variant))',
                  }"
                >
                  {{ String.fromCharCode(65 + idx) }}
                </span>
                <span class="text-sm truncate">{{ opt }}</span>
              </div>
            </div>

            <p class="text-xs" style="color: rgb(var(--md-on-surface-variant));">
              {{ store.currentResult.bankName }}
            </p>
          </div>

          <div v-else class="card-outlined p-4 flex flex-col items-center gap-2">
            <MagnifyingGlassIcon class="w-8 h-8" style="color: rgb(var(--md-on-surface-variant));" />
            <p class="text-body-sm" style="color: rgb(var(--md-on-surface-variant));">
              {{ i18n.t('searchCameraLiveNoMatch') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@keyframes cameraLive-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
