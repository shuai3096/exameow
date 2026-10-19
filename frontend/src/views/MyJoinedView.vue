<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { useJoinedStore } from '@/stores/joined'
import type { JoinedRecord } from '@/stores/joined'
import { ArrowLeftIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const i18n = useI18nStore()
const joinedStore = useJoinedStore()
const expanded = ref<Set<string>>(new Set())

function recKey(code: string, name: string): string {
  return `${code}:${name}`
}

function toggle(code: string, name: string) {
  const s = new Set(expanded.value)
  const k = recKey(code, name)
  if (s.has(k)) s.delete(k)
  else s.add(k)
  expanded.value = s
}

function gradedCounts(rec: JoinedRecord) {
  const graded = rec.graded ?? []
  return {
    correct: graded.filter((g) => g.isCorrect === true).length,
    wrong: graded.filter((g) => g.isCorrect === false).length,
    pending: graded.filter((g) => g.isCorrect === null).length,
  }
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-6">
      <button class="btn-icon" @click="router.push('/mine')">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-display-sm">{{ i18n.t('mineJoined') }}</h1>
    </div>

    <p v-if="joinedStore.list.length === 0" class="text-center py-10" style="color: rgb(var(--md-on-surface-variant))">
      {{ i18n.t('joinedEmpty') }}
    </p>

    <div v-else class="space-y-3">
      <div v-for="rec in joinedStore.list" :key="rec.code + ':' + rec.name" class="card-outlined p-4 sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-title-sm truncate">{{ rec.title || rec.code }}</div>
            <div class="text-body-sm mt-0.5" style="color: rgb(var(--md-on-surface-variant))">
              {{ rec.name }} · {{ rec.code }} · {{ fmtTime(rec.joinedAt) }}
            </div>
          </div>
          <div v-if="rec.submittedAt" class="text-xl font-bold shrink-0" style="color: rgb(var(--md-primary))">
            {{ rec.score }}/{{ rec.totalScore }}
          </div>
          <div v-else class="text-sm shrink-0" style="color: rgb(var(--md-on-surface-variant))">
            {{ i18n.t('joinedNotSubmitted') }}
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <button
            v-if="rec.submittedAt"
            class="btn-filled !h-8 !px-3 !text-xs"
            @click="toggle(rec.code, rec.name)"
          >
            {{ i18n.t('joinedViewResult') }}
          </button>
          <button
            v-if="rec.submittedAt && rec.graded"
            class="btn-tonal !h-8 !px-3 !text-xs"
            @click="router.push({ path: '/mine/joined/wrong', query: { code: rec.code, name: rec.name } })"
          >
            {{ i18n.t('joinedViewWrong') }}
          </button>
          <button
            v-if="!rec.submittedAt"
            class="btn-tonal !h-8 !px-3 !text-xs"
            @click="router.push({ path: `/take/${rec.code}`, query: { name: rec.name } })"
          >
            {{ i18n.t('joinedReenter') }}
          </button>
          <button class="btn-outlined !h-8 !px-3 !text-xs" @click="joinedStore.remove(rec.code, rec.name)">
            <TrashIcon class="w-4 h-4" /> {{ i18n.t('pubDeleteRecord') }}
          </button>
        </div>

        <div v-if="expanded.has(recKey(rec.code, rec.name)) && rec.submittedAt" class="mt-4 card-filled p-4">
          <div class="text-center mb-4">
            <div class="text-label-sm mb-1" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('takeScore') }}</div>
            <div class="text-3xl font-bold" style="color: rgb(var(--md-primary))">
              {{ rec.score }}<span class="text-base font-normal" style="color: rgb(var(--md-on-surface-variant))"> / {{ rec.totalScore }}</span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 sm:gap-3">
            <div class="card-outlined p-3 text-center">
              <CheckCircleIcon class="w-5 h-5 mx-auto mb-1" style="color: rgb(var(--md-primary))" />
              <div class="text-title-sm">{{ gradedCounts(rec).correct }}</div>
              <div class="text-label-sm" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('practiceCorrect') }}</div>
            </div>
            <div class="card-outlined p-3 text-center">
              <XCircleIcon class="w-5 h-5 mx-auto mb-1" style="color: rgb(var(--md-error))" />
              <div class="text-title-sm">{{ gradedCounts(rec).wrong }}</div>
              <div class="text-label-sm" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('practiceIncorrect') }}</div>
            </div>
            <div class="card-outlined p-3 text-center">
              <ClockIcon class="w-5 h-5 mx-auto mb-1" style="color: rgb(var(--md-on-surface-variant))" />
              <div class="text-title-sm">{{ gradedCounts(rec).pending }}</div>
              <div class="text-label-sm" style="color: rgb(var(--md-on-surface-variant))">{{ i18n.t('takePendingShort') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
