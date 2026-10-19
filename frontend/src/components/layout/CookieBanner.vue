<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { isCloudflare } from '@/utils/platform'

const CONSENT_KEY = 'exameow-cookie-consent'
const i18n = useI18nStore()
const router = useRouter()

const visible = ref(isCloudflare() && !localStorage.getItem(CONSENT_KEY))

function accept() {
  localStorage.setItem(CONSENT_KEY, '1')
  visible.value = false
}

function openPrivacy() {
  localStorage.setItem(CONSENT_KEY, '1')
  visible.value = false
  router.push('/privacy')
}
</script>

<template>
  <Transition name="cookie-fade">
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4"
      role="dialog"
      aria-live="polite"
    >
      <div
        class="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl p-4 shadow-lg sm:flex-row sm:gap-4"
        style="background: rgb(var(--md-surface-container-high)); color: rgb(var(--md-on-surface)); border: 1px solid rgb(var(--md-outline-variant))"
      >
        <p class="flex-1 text-sm leading-relaxed" style="color: rgb(var(--md-on-surface-variant))">
          {{ i18n.t('cookieBannerText') }}
          <button
            class="underline font-medium ml-1"
            style="color: rgb(var(--md-primary))"
            @click="openPrivacy"
          >
            {{ i18n.t('cookieBannerLearnMore') }}
          </button>
        </p>
        <button
          class="shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style="background: rgb(var(--md-primary)); color: rgb(var(--md-on-primary))"
          @click="accept"
        >
          {{ i18n.t('cookieBannerAccept') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-fade-enter-active,
.cookie-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.cookie-fade-enter-from,
.cookie-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
