<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import SearchPanel from '@/components/search/SearchPanel.vue'

const router = useRouter()
const i18n = useI18nStore()
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-2 mb-1">
      <button class="btn-icon" @click="router.push('/search')">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-display-sm">{{ i18n.t('searchModeText') }}</h1>
    </div>
    <p class="text-body-lg mb-4" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('searchModeTextDesc') }}</p>

    <SearchPanel />
  </div>
</template>
