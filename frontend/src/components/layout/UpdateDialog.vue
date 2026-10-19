<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18nStore } from '@/stores/i18n'
import { isDesktopTauri } from '@/utils/platform'
import { useDesktopUpdater } from '@/composables/useDesktopUpdater'

const i18n = useI18nStore()
const { stage, version, progress, error, checkForUpdate, startUpdate, restart, dismiss } = useDesktopUpdater()

onMounted(async () => {
  if (!isDesktopTauri()) return
  await checkForUpdate()
})
</script>

<template>
  <div
    v-if="stage !== 'idle' && stage !== 'upToDate'"
    class="fixed bottom-4 right-4 z-[9998] w-80 rounded-2xl p-4 shadow-lg"
    style="background: rgb(var(--md-surface-container-high)); color: rgb(var(--md-on-surface)); border: 1px solid rgb(var(--md-outline-variant))"
  >
    <template v-if="stage === 'available'">
      <p class="text-sm font-semibold">{{ i18n.t('updateAvailableTitle', { version }) }}</p>
      <p class="mt-1 text-xs" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('updateAvailableBody') }}</p>
      <div class="mt-3 flex justify-end gap-2">
        <button
          class="rounded-full px-4 py-1.5 text-sm transition-opacity hover:opacity-70"
          style="color: rgb(var(--md-on-surface-variant))"
          @click="dismiss"
        >{{ i18n.t('updateLater') }}</button>
        <button
          class="rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
          style="background: rgb(var(--md-primary)); color: rgb(var(--md-on-primary))"
          @click="startUpdate"
        >{{ i18n.t('updateNow') }}</button>
      </div>
    </template>

    <template v-else-if="stage === 'downloading'">
      <p class="text-sm font-semibold">{{ i18n.t('updateDownloading') }}</p>
      <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full" style="background: rgb(var(--md-surface-variant))">
        <div
          class="h-full rounded-full transition-all duration-200"
          style="background: rgb(var(--md-primary))"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="mt-1 text-right text-xs" style="color: rgb(var(--md-on-surface-variant))">{{ progress }}%</p>
    </template>

    <template v-else-if="stage === 'ready'">
      <p class="text-sm font-semibold">{{ i18n.t('updateReady') }}</p>
      <div class="mt-3 flex justify-end">
        <button
          class="rounded-full px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
          style="background: rgb(var(--md-primary)); color: rgb(var(--md-on-primary))"
          @click="restart"
        >{{ i18n.t('updateRestart') }}</button>
      </div>
    </template>

    <template v-else-if="stage === 'failed'">
      <p class="text-sm" style="color: rgb(var(--md-error))">{{ i18n.t('updateFailed') }}</p>
      <p v-if="error" class="mt-1 text-xs break-all" style="color: rgb(var(--md-on-surface-variant))">{{ error }}</p>
      <div class="mt-2 flex justify-end">
        <button
          class="rounded-full px-4 py-1.5 text-sm transition-opacity hover:opacity-70"
          style="color: rgb(var(--md-on-surface-variant))"
          @click="dismiss"
        >✕</button>
      </div>
    </template>
  </div>
</template>
