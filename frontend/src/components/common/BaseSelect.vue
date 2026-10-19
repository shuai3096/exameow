<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'

export interface SelectOption {
  value: any
  label: string
  hint?: string
}

const props = defineProps<{
  modelValue: any
  options: SelectOption[]
  placeholder?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: any): void }>()

const open = ref(false)
const dropup = ref(false)
const root = ref<HTMLElement | null>(null)

function toggleOpen() {
  if (!open.value && root.value) {
    const rect = root.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    dropup.value = spaceBelow < 260 && rect.top > 200
  }
  open.value = !open.value
}

const selected = computed(() => props.options.find((o) => o.value === props.modelValue))

function pick(v: any) {
  emit('update:modelValue', v)
  open.value = false
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
      class="w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-2xl text-sm font-medium outline-none transition-all duration-200 cursor-pointer shadow-xs"
      :style="{
        border: `1.5px solid ${open ? 'rgb(var(--md-primary))' : 'rgb(var(--md-outline-variant)/0.5)'}`,
        color: 'rgb(var(--md-on-surface))',
        backgroundColor: 'rgb(var(--md-surface-container-lowest))',
      }"
      @click.stop="toggleOpen"
    >
      <span class="truncate" :style="selected ? {} : { color: 'rgb(var(--md-on-surface-muted))' }">
        {{ selected?.label ?? placeholder ?? '' }}
      </span>
      <ChevronDownIcon
        class="w-4 h-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :class="{ 'rotate-180': open }"
        style="color: rgb(var(--md-on-surface-variant))"
      />
    </button>

    <Transition name="scale">
      <div
        v-if="open"
        class="absolute left-0 right-0 z-50 max-h-64 overflow-y-auto rounded-[24px] shadow-xl border border-[rgb(var(--md-outline-variant)/0.3)] py-2 backdrop-blur-md"
        :class="dropup ? 'bottom-full mb-2' : 'top-full mt-2'"
        style="background-color: rgb(var(--md-surface-container-high))"
      >
        <button
          v-for="o in options"
          :key="String(o.value)"
          type="button"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer hover:bg-[rgb(var(--md-primary)/0.08)]"
          :style="o.value === modelValue
            ? { color: 'rgb(var(--md-primary))', backgroundColor: 'rgb(var(--md-primary) / 0.12)' }
            : { color: 'rgb(var(--md-on-surface))' }"
          @click.stop="pick(o.value)"
        >
          <span class="flex-1 min-w-0 truncate">{{ o.label }}</span>
          <span v-if="o.hint" class="text-xs shrink-0" style="color: rgb(var(--md-on-surface-variant))">{{ o.hint }}</span>
          <CheckIcon v-if="o.value === modelValue" class="w-4 h-4 shrink-0 animate-spring-pop" />
        </button>
      </div>
    </Transition>
  </div>
</template>
