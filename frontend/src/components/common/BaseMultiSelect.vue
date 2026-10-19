<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18nStore } from '@/stores/i18n'
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

export interface MultiSelectOption {
  value: any
  label: string
  hint?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: any[]
    options: MultiSelectOption[]
    placeholder?: string
    searchable?: boolean
  }>(),
  { searchable: true },
)

const emit = defineEmits<{ (e: 'update:modelValue', v: any[]): void }>()

const i18n = useI18nStore()
const open = ref(false)
const dropup = ref(false)
const query = ref('')
const root = ref<HTMLElement | null>(null)

function toggleOpen() {
  if (!open.value && root.value) {
    const rect = root.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    dropup.value = spaceBelow < 260 && rect.top > 200
  }
  open.value = !open.value
}

const allSelected = computed(() => props.options.length > 0 && props.modelValue.length >= props.options.length)

const triggerText = computed(() => {
  if (props.modelValue.length === 0) return props.placeholder ?? ''
  if (allSelected.value) return i18n.t('selectAll')
  return i18n.t('selectSelected', { n: props.modelValue.length })
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

function isChecked(v: any): boolean {
  return props.modelValue.includes(v)
}

function toggle(v: any) {
  const next = [...props.modelValue]
  const idx = next.indexOf(v)
  if (idx >= 0) next.splice(idx, 1)
  else next.push(v)
  emit('update:modelValue', next)
}

function selectAll() {
  emit('update:modelValue', props.options.map((o) => o.value))
}

function clearAll() {
  emit('update:modelValue', [])
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 cursor-pointer"
      :style="{
        border: `1.5px solid ${open ? 'rgb(var(--md-primary))' : 'rgb(var(--md-outline-variant))'}`,
        color: 'rgb(var(--md-on-surface))',
        backgroundColor: 'rgb(var(--md-surface-container-low))',
      }"
      @click.stop="toggleOpen"
    >
      <span class="truncate" :style="modelValue.length === 0 ? { color: 'rgb(var(--md-on-surface-muted))' } : {}">
        {{ triggerText }}
      </span>
      <ChevronDownIcon
        class="w-4 h-4 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        style="color: rgb(var(--md-on-surface-variant))"
      />
    </button>

    <Transition name="scale">
      <div
        v-if="open"
        class="absolute left-0 right-0 z-50 rounded-2xl shadow-xl py-1.5 border border-[rgb(var(--md-outline-variant)/0.3)]"
        :class="dropup ? 'bottom-full mb-1.5' : 'top-full mt-1.5'"
        style="background-color: rgb(var(--md-surface-container-high))"
      >
        <div v-if="searchable && options.length > 5" class="px-3 pb-1.5">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style="color: rgb(var(--md-on-surface-variant))" />
            <input
              v-model="query"
              :placeholder="i18n.t('selectSearch')"
              class="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
              :style="{
                backgroundColor: 'rgb(var(--md-surface-container-low))',
                color: 'rgb(var(--md-on-surface))',
                border: '1px solid rgb(var(--md-outline-variant))',
              }"
              @click.stop
            />
          </div>
        </div>

        <div class="flex items-center justify-between px-4 py-1">
          <button type="button" class="text-xs font-medium" style="color: rgb(var(--md-primary))" @click.stop="selectAll">
            {{ i18n.t('selectSelectAll') }}
          </button>
          <button type="button" class="text-xs font-medium" style="color: rgb(var(--md-on-surface-variant))" @click.stop="clearAll">
            {{ i18n.t('selectClear') }}
          </button>
        </div>

        <div class="max-h-56 overflow-y-auto">
          <button
            v-for="o in filtered"
            :key="String(o.value)"
            type="button"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[rgb(var(--md-primary)/0.08)]"
            style="color: rgb(var(--md-on-surface))"
            @click.stop="toggle(o.value)"
          >
            <span
              class="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 transition-colors"
              :style="isChecked(o.value)
                ? { backgroundColor: 'rgb(var(--md-primary))' }
                : { border: '1.5px solid rgb(var(--md-outline))' }"
            >
              <CheckIcon v-if="isChecked(o.value)" class="w-3.5 h-3.5" style="color: rgb(var(--md-on-primary))" />
            </span>
            <span class="flex-1 min-w-0 truncate">{{ o.label }}</span>
            <span v-if="o.hint" class="text-xs shrink-0" style="color: rgb(var(--md-on-surface-variant))">{{ o.hint }}</span>
          </button>
          <p v-if="filtered.length === 0" class="px-4 py-3 text-sm" style="color: rgb(var(--md-on-surface-variant))">
            {{ i18n.t('selectNoMatch') }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
