<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n'
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/locales'
import { CheckIcon, XMarkIcon, LanguageIcon } from '@heroicons/vue/24/outline'

defineEmits<{ (e: 'close'): void }>()

const i18n = useI18nStore()

function select(code: Locale) {
  i18n.setLocale(code)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop Scrim -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      @click="$emit('close')"
    />

    <!-- Dialog Card -->
    <div
      class="relative z-10 w-full max-w-md rounded-[32px] p-6 shadow-2xl transition-all duration-300 animate-scale-in"
      style="background-color: rgb(var(--md-surface-container-high)); color: rgb(var(--md-on-surface));"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <div
            class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style="background-color: rgb(var(--md-primary-container)); color: rgb(var(--md-on-primary-container));"
          >
            <LanguageIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-title-md font-bold tracking-tight">Language / 语言</h3>
            <p class="text-label-sm" style="color: rgb(var(--md-on-surface-variant));">Select Interface Language</p>
          </div>
        </div>
        <button
          class="btn-icon !w-9 !h-9"
          @click="$emit('close')"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Language List -->
      <div class="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
        <button
          v-for="item in SUPPORTED_LOCALES"
          :key="item.code"
          class="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer border active:scale-[0.98]"
          :style="i18n.locale === item.code
            ? {
                backgroundColor: 'rgb(var(--md-primary-container))',
                color: 'rgb(var(--md-on-primary-container))',
                borderColor: 'rgb(var(--md-primary))',
              }
            : {
                backgroundColor: 'rgb(var(--md-surface-container-lowest))',
                color: 'rgb(var(--md-on-surface))',
                borderColor: 'rgb(var(--md-outline-variant)/0.3)',
              }"
          @click="select(item.code); $emit('close')"
        >
          <div class="flex items-center gap-3">
            <div>
              <div class="text-sm font-bold leading-tight">{{ item.nativeName }}</div>
              <div
                class="text-xs mt-0.5"
                :style="{ color: i18n.locale === item.code ? 'rgb(var(--md-on-primary-container)/0.8)' : 'rgb(var(--md-on-surface-variant))' }"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
          <CheckIcon
            v-if="i18n.locale === item.code"
            class="w-5 h-5 animate-spring-pop shrink-0"
          />
        </button>
      </div>
    </div>
  </div>
</template>
