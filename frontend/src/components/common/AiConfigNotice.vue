<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { CpuChipIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const i18n = useI18nStore()
</script>

<template>
  <div class="card-filled p-4 flex items-center gap-3">
    <CpuChipIcon class="w-6 h-6 shrink-0" style="color: rgb(var(--md-primary))" />
    <span class="text-sm flex-1" style="color: rgb(var(--md-on-surface))">{{ i18n.t('searchNotConfigured') }}</span>
    <button class="btn-filled !h-9 text-sm shrink-0" @click="router.push('/mine/config')">
      {{ i18n.t('mineAIConfig') }}
      <ArrowRightIcon class="w-4 h-4" />
    </button>
  </div>
</template>
