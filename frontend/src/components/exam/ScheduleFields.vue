<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n'
import { ClockIcon } from '@heroicons/vue/24/outline'
import DateTimeField from '@/components/exam/DateTimeField.vue'

const title = defineModel<string>('title', { required: true })
const startAt = defineModel<string>('startAt', { required: true })
const durationMinutes = defineModel<number>('durationMinutes', { required: true })


const i18n = useI18nStore()

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function setPreset(kind: 'now' | 'hour' | 'tomorrow8') {
  const d = new Date()
  if (kind === 'hour') {
    d.setTime(d.getTime() + 3600 * 1000)
  } else if (kind === 'tomorrow8') {
    d.setDate(d.getDate() + 1)
    d.setHours(8, 0, 0, 0)
  }
  startAt.value = toLocalInput(d)
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="text-label-sm">{{ i18n.t('pubFieldTitle') }}</label>
      <input v-model="title" class="input-outlined w-full mt-1" :placeholder="i18n.t('pubFieldTitlePlaceholder')" />
    </div>
    <div>
      <label class="text-label-sm">{{ i18n.t('pubFieldStart') }}</label>
      <div class="mt-1">
        <DateTimeField v-model="startAt" />
      </div>
      <div class="flex flex-wrap gap-2 mt-2">
        <button type="button" class="btn-tonal !h-7 !px-3 !text-xs" @click="setPreset('now')">{{ i18n.t('presetNow') }}</button>
        <button type="button" class="btn-tonal !h-7 !px-3 !text-xs" @click="setPreset('hour')">{{ i18n.t('presetIn1Hour') }}</button>
        <button type="button" class="btn-tonal !h-7 !px-3 !text-xs" @click="setPreset('tomorrow8')">{{ i18n.t('presetTomorrow8') }}</button>
      </div>
    </div>
    <div>
      <label class="text-label-sm">{{ i18n.t('pubFieldDuration') }}</label>
      <div class="relative mt-1">
        <ClockIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: rgb(var(--md-on-surface-variant))" />
        <input v-model.number="durationMinutes" type="number" min="1" class="input-outlined w-full !pl-10" />
      </div>
    </div>
  </div>
</template>
