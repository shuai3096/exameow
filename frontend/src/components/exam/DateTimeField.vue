<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nStore } from '@/stores/i18n'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '@heroicons/vue/24/outline'

const model = defineModel<string>({ required: true })

const i18n = useI18nStore()
const open = ref(false)

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function parseModel(): Date {
  const d = new Date(model.value)
  return isNaN(d.getTime()) ? new Date() : d
}

function commit(d: Date) {
  model.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const displayText = computed(() => {
  const d = parseModel()
  return d.toLocaleString(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleString(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }),
)

const weekDays = computed(() => {
  const mondayFirst = i18n.locale === 'zh'
  const base = mondayFirst ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]
  return base.map((dow) =>
    new Date(2024, 0, dow === 0 ? 7 : dow).toLocaleString(i18n.locale === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' }),
  )
})

const cells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const mondayFirst = i18n.locale === 'zh'
  const lead = mondayFirst ? (first.getDay() + 6) % 7 : first.getDay()
  const days = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const list: (number | null)[] = Array(lead).fill(null)
  for (let d = 1; d <= days; d++) list.push(d)
  return list
})

const selectedDay = computed(() => {
  const d = parseModel()
  return d.getFullYear() === viewYear.value && d.getMonth() === viewMonth.value ? d.getDate() : null
})

const todayDay = computed(() => {
  const t = new Date()
  return t.getFullYear() === viewYear.value && t.getMonth() === viewMonth.value ? t.getDate() : null
})

const hour = computed(() => parseModel().getHours())
const minute = computed(() => parseModel().getMinutes())

function openPanel() {
  const d = parseModel()
  viewYear.value = d.getFullYear()
  viewMonth.value = d.getMonth()
  open.value = true
}

function shiftMonth(delta: number) {
  const m = viewMonth.value + delta
  viewYear.value += Math.floor(m / 12)
  viewMonth.value = ((m % 12) + 12) % 12
}

function pickDay(day: number) {
  const d = parseModel()
  d.setFullYear(viewYear.value, viewMonth.value, day)
  commit(d)
}

function setHour(v: number) {
  const d = parseModel()
  d.setHours(Math.min(23, Math.max(0, Math.round(v) || 0)))
  commit(d)
}

function setMinute(v: number) {
  const d = parseModel()
  d.setMinutes(Math.min(59, Math.max(0, Math.round(v) || 0)))
  commit(d)
}

function isSelected(day: number | null): boolean {
  return day !== null && day === selectedDay.value
}

function isToday(day: number | null): boolean {
  return day !== null && day === todayDay.value
}
</script>

<template>
  <button
    type="button"
    class="input-outlined w-full flex items-center gap-3 text-left"
    @click="openPanel"
  >
    <CalendarIcon class="w-5 h-5 shrink-0" style="color: rgb(var(--md-on-surface-variant))" />
    <span class="text-sm flex-1">{{ displayText }}</span>
  </button>

  <Teleport to="body">
    <Transition name="scale">
      <div v-if="open" class="scrim flex items-center justify-center p-4 z-[60]" @click.self="open = false">
        <div class="card-elevated w-full max-w-[320px] p-4">
          <div class="flex items-center justify-between mb-2">
            <button class="btn-icon !w-8 !h-8" @click="shiftMonth(-1)">
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <span class="text-title-sm">{{ monthLabel }}</span>
            <button class="btn-icon !w-8 !h-8" @click="shiftMonth(1)">
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="grid grid-cols-7 gap-0.5 mb-1">
            <span
              v-for="(w, i) in weekDays"
              :key="i"
              class="text-center text-[11px] py-1"
              style="color: rgb(var(--md-on-surface-variant))"
            >{{ w }}</span>
          </div>
          <div class="grid grid-cols-7 gap-0.5">
            <button
              v-for="(day, i) in cells"
              :key="i"
              type="button"
              class="aspect-square rounded-full text-sm transition-colors"
              :disabled="day === null"
              :style="isSelected(day)
                ? { backgroundColor: 'rgb(var(--md-primary))', color: 'rgb(var(--md-on-primary))' }
                : isToday(day)
                  ? { outline: '1px solid rgb(var(--md-primary))', color: 'rgb(var(--md-primary))' }
                  : { color: 'rgb(var(--md-on-surface))' }"
              @click="day !== null && pickDay(day)"
            >{{ day ?? '' }}</button>
          </div>

          <div class="flex items-center justify-center gap-2 mt-3 pt-3" style="border-top: 1px solid rgb(var(--md-outline-variant))">
            <ClockIcon class="w-4 h-4" style="color: rgb(var(--md-on-surface-variant))" />
            <input
              :value="hour"
              type="number"
              min="0"
              max="23"
              class="input-outlined w-20 text-center no-spinner"
              @change="setHour(Number(($event.target as HTMLInputElement).value))"
            />
            <span class="font-bold">:</span>
            <input
              :value="minute"
              type="number"
              min="0"
              max="59"
              class="input-outlined w-20 text-center no-spinner"
              @change="setMinute(Number(($event.target as HTMLInputElement).value))"
            />
          </div>

          <button class="btn-filled w-full mt-3" @click="open = false">{{ i18n.t('pubClose') }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
