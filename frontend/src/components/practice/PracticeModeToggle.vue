<script setup lang="ts">
import { computed } from 'vue'
import { useI18nStore } from '@/stores/i18n'

const props = defineProps<{
  modelValue: 'exam' | 'flashcard'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: 'exam' | 'flashcard'): void
}>()

const i18n = useI18nStore()

const activeIndex = computed(() => props.modelValue === 'exam' ? 0 : 1)

function selectExam() {
  emit('update:modelValue', 'exam')
}

function selectFlashcard() {
  emit('update:modelValue', 'flashcard')
}
</script>

<template>
  <div
    class="mode-toggle-track"
    :style="{
      backgroundColor: 'rgb(var(--md-surface-container-high))',
      borderColor: 'rgb(var(--md-outline-variant))',
    }"
  >
    <div
      class="mode-toggle-thumb"
      :style="{
        backgroundColor: 'rgb(var(--md-primary-container))',
        color: 'rgb(var(--md-on-primary-container))',
        transform: `translateX(${activeIndex * 100}%)`,
      }"
    />
    <button
      class="mode-toggle-option"
      :class="{ 'mode-toggle-option--active': modelValue === 'exam' }"
      @click="selectExam"
    >
      <span class="text-xs font-medium truncate">{{ i18n.t('practiceModeExam') }}</span>
    </button>
    <button
      class="mode-toggle-option"
      :class="{ 'mode-toggle-option--active': modelValue === 'flashcard' }"
      @click="selectFlashcard"
    >
      <span class="text-xs font-medium truncate">{{ i18n.t('practiceModeFlashcard') }}</span>
    </button>
  </div>
</template>
