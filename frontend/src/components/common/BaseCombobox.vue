<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

export interface ComboboxOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: ComboboxOption[]
  placeholder?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  const q = props.modelValue.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  )
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  open.value = true
}

function pick(v: string) {
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
    <div
      class="w-full flex items-center rounded-xl transition-all duration-200"
      :style="{
        border: `1.5px solid ${open ? 'rgb(var(--md-primary))' : 'rgb(var(--md-outline-variant))'}`,
        backgroundColor: 'rgb(var(--md-surface-container-low))',
      }"
    >
      <input
        :value="modelValue"
        :placeholder="placeholder"
        class="flex-1 min-w-0 px-3 py-2.5 text-sm bg-transparent outline-none"
        style="color: rgb(var(--md-on-surface))"
        @input="onInput"
        @focus="open = true"
      />
      <button
        type="button"
        class="shrink-0 px-2.5 self-stretch flex items-center cursor-pointer"
        @click.stop="open = !open"
      >
        <ChevronDownIcon
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': open }"
          style="color: rgb(var(--md-on-surface-variant))"
        />
      </button>
    </div>

    <Transition name="scale">
      <div
        v-if="open && filtered.length > 0"
        class="absolute left-0 right-0 top-full mt-1 z-30 max-h-64 overflow-y-auto rounded-2xl elevation-2 py-1.5"
        style="background-color: rgb(var(--md-surface-container-high))"
      >
        <button
          v-for="o in filtered"
          :key="o.value"
          type="button"
          class="w-full px-4 py-2.5 text-left text-sm truncate transition-colors hover:bg-[rgb(var(--md-primary)/0.08)]"
          :style="o.value === modelValue
            ? { color: 'rgb(var(--md-primary))', backgroundColor: 'rgb(var(--md-primary) / 0.10)' }
            : { color: 'rgb(var(--md-on-surface))' }"
          @click.stop="pick(o.value)"
        >
          {{ o.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
