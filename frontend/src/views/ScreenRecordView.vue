<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { useScreenRecordStore } from '@/stores/screenRecord'
import { isAndroid, isDesktopTauri } from '@/utils/platform'
import { VideoCameraIcon, ArrowLeftIcon, AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import SearchSettingsPanel from '@/components/search/SearchSettingsPanel.vue'

const router = useRouter()
const i18n = useI18nStore()
const store = useScreenRecordStore()

const supported = isDesktopTauri() || isAndroid()
const showSettings = ref(false)

async function startRecording() {
  store.startRecording()
  const { useScreenRecord } = await import('@/composables/useScreenRecord')
  const { start } = useScreenRecord()
  try {
    await start()
  } catch (e) {
    store.stopRecording()
    console.warn('[录屏搜题] start failed:', e)
    const msg = String(e)
    if (msg.includes('overlay_permission')) {
      alert(i18n.t('searchScreenRecordOverlayPerm'))
    } else if (msg.includes('projection_denied')) {
      alert(i18n.t('searchScreenRecordProjectionDenied'))
    } else if (msg.includes('screen_permission_required')) {
      alert(i18n.t('searchScreenRecordScreenPerm'))
    }
  }
}

function goBack() {
  router.push('/search')
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-1">
      <button class="btn-icon" @click="goBack">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-display-sm flex-1">{{ i18n.t('searchModeScreenRecord') }}</h1>
    </div>
    <p class="text-body-lg mb-4" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('searchScreenRecordDesc') }}</p>

    <div v-if="!supported" class="card-filled p-6 text-center">
      <VideoCameraIcon class="w-12 h-12 mx-auto mb-3" style="color: rgb(var(--md-on-surface-variant))" />
      <p class="text-title-md mb-2">{{ i18n.t('searchModeScreenRecord') }}</p>
      <p class="text-body-md" style="color: rgb(var(--md-on-surface-variant))">
        {{ i18n.t('searchScreenRecordNotSupported') }}
      </p>
    </div>

    <template v-else>
      <div class="card-filled p-6 flex flex-col gap-4">
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
            <VideoCameraIcon class="w-8 h-8" />
          </div>
          <button
            class="px-8 py-3 rounded-full text-title-md font-medium transition-all duration-200 cursor-pointer"
            :style="{
              backgroundColor: 'rgb(var(--md-primary))',
              color: 'rgb(var(--md-on-primary))',
            }"
            @click="startRecording"
          >
            {{ i18n.t('searchScreenRecordStart') }}
          </button>
        </div>

        <div v-if="showSettings" class="pt-4" style="border-top: 1px solid rgb(var(--md-outline-variant) / 0.4)">
          <SearchSettingsPanel />
        </div>
      </div>
    </template>
  </div>
</template>
