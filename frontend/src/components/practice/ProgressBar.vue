<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n'
import { usePracticeStore } from '@/stores/practice'
import { TableCellsIcon } from '@heroicons/vue/24/outline'

defineProps<{
  mode: string
  current: number
  total: number
  answeredCount: number
}>()

const emit = defineEmits<{
  (e: 'openSheet'): void
}>()

const i18n = useI18nStore()
</script>

<template>
  <div class="flex items-center gap-3">
    <button
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shrink-0"
      :style="{
        backgroundColor: 'rgb(var(--md-surface-container-highest))',
        color: 'rgb(var(--md-on-surface))',
      }"
      @click="emit('openSheet')"
    >
      <TableCellsIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span class="hidden sm:inline">{{ i18n.t('practiceAnswerSheet') }}</span>
      <span class="tabular-nums text-xs" :style="{ color: 'rgb(var(--md-on-surface-variant))' }">
        {{ current }}/{{ total }}
      </span>
    </button>

    <div class="flex-1 min-w-0">
      <div class="h-1.5 rounded-full overflow-hidden w-full" :style="{ backgroundColor: 'rgba(var(--md-primary) / 0.12)' }">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :style="{
            backgroundColor: 'rgb(var(--md-primary))',
            width: ((current / total) * 100) + '%',
          }"
        />
      </div>
    </div>
  </div>
</template>
