<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import {
  adminFetchReports,
  adminDeleteExam,
  adminRestoreExam,
  adminChangeToken,
  RelayError,
  type AdminReportRow,
} from '@/api/relay'
import { ArrowLeftIcon, TrashIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const i18n = useI18nStore()

const TOKEN_KEY = 'exameow-admin-token'

const token = ref(localStorage.getItem(TOKEN_KEY) || '')
const tokenInput = ref('')
const authed = ref(false)
const needChange = ref(false)
const newToken = ref('')
const newTokenConfirm = ref('')
const rows = ref<AdminReportRow[]>([])
const loading = ref(false)
const error = ref('')

async function loadReports(t: string) {
  loading.value = true
  error.value = ''
  try {
    const res = await adminFetchReports(t)
    if (res.need_change) {
      needChange.value = true
      authed.value = true
      localStorage.setItem(TOKEN_KEY, t)
      token.value = t
      return
    }
    rows.value = [...res.reports].sort((a, b) => b.ip_count - a.ip_count)
    authed.value = true
    needChange.value = false
    localStorage.setItem(TOKEN_KEY, t)
    token.value = t
  } catch (e) {
    if (e instanceof RelayError && e.status === 403) {
      error.value = i18n.t('manageUnauthorized')
      authed.value = false
      localStorage.removeItem(TOKEN_KEY)
    } else {
      error.value = e instanceof Error ? e.message : String(e)
    }
  } finally {
    loading.value = false
  }
}

function handleLogin() {
  const t = tokenInput.value.trim()
  if (!t) return
  loadReports(t)
}

async function handleChangeToken() {
  error.value = ''
  if (!newToken.value.trim() || newToken.value !== newTokenConfirm.value) {
    error.value = i18n.t('adminTokenMismatch')
    return
  }
  try {
    await adminChangeToken(token.value, newToken.value.trim())
    token.value = newToken.value.trim()
    localStorage.setItem(TOKEN_KEY, token.value)
    needChange.value = false
    newToken.value = ''
    newTokenConfirm.value = ''
    await loadReports(token.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function handleDelete(code: string) {
  if (!window.confirm(i18n.t('adminDeleteConfirm', { code }))) return
  try {
    await adminDeleteExam(token.value, code)
    rows.value = rows.value.filter((r) => r.code !== code)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function handleRestore(code: string) {
  try {
    await adminRestoreExam(token.value, code)
    const row = rows.value.find((r) => r.code === code)
    if (row) row.suspended = 0
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString()
}

onMounted(() => {
  if (token.value) loadReports(token.value)
})
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-2 mb-6">
      <button class="btn-icon" @click="router.push('/mine')">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-display-sm">{{ i18n.t('adminTitle') }}</h1>
    </div>

    <div v-if="!authed" class="card-filled p-5 max-w-sm mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <ShieldCheckIcon class="w-6 h-6" style="color: rgb(var(--md-primary))" />
        <span class="text-title-sm">{{ i18n.t('adminLogin') }}</span>
      </div>
      <input
        v-model="tokenInput"
        type="password"
        class="input-outlined w-full"
        :placeholder="i18n.t('adminTokenPlaceholder')"
        @keyup.enter="handleLogin"
      />
      <p v-if="error" class="text-sm" style="color: rgb(var(--md-error))">{{ error }}</p>
      <button class="btn-filled w-full" :disabled="loading || !tokenInput.trim()" @click="handleLogin">
        {{ i18n.t('joinConfirm') }}
      </button>
    </div>

    <div v-else-if="needChange" class="card-filled p-5 max-w-sm mx-auto space-y-4">
      <div class="text-title-sm" style="color: rgb(var(--md-error))">{{ i18n.t('adminForceChange') }}</div>
      <input v-model="newToken" type="password" class="input-outlined w-full" :placeholder="i18n.t('adminNewToken')" />
      <input v-model="newTokenConfirm" type="password" class="input-outlined w-full" :placeholder="i18n.t('adminNewTokenConfirm')" />
      <p v-if="error" class="text-sm" style="color: rgb(var(--md-error))">{{ error }}</p>
      <button class="btn-filled w-full" :disabled="!newToken.trim() || !newTokenConfirm.trim()" @click="handleChangeToken">
        {{ i18n.t('adminChangeToken') }}
      </button>
    </div>

    <template v-else>
      <p v-if="error" class="text-sm mb-3" style="color: rgb(var(--md-error))">{{ error }}</p>
      <p v-if="rows.length === 0" class="text-center py-10" style="color: rgb(var(--md-on-surface-variant))">
        {{ i18n.t('adminNoReports') }}
      </p>
      <div v-else class="space-y-3">
        <div v-for="r in rows" :key="r.code" class="card-outlined p-4 sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-title-sm truncate">{{ r.title || r.code }}</div>
              <div class="text-body-sm mt-0.5" style="color: rgb(var(--md-on-surface-variant))">
                {{ r.code }} · {{ fmtTime(r.last_reported_at) }}
              </div>
              <div v-if="r.last_reason" class="text-body-sm mt-1 truncate" style="color: rgb(var(--md-on-surface-variant))">
                {{ r.last_reason }}
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-bold"
                :style="r.suspended
                  ? { backgroundColor: 'rgb(var(--md-error-container))', color: 'rgb(var(--md-on-error-container))' }
                  : { backgroundColor: 'rgb(var(--md-secondary-container))', color: 'rgb(var(--md-on-secondary-container))' }"
              >{{ i18n.t('adminReportCount', { n: r.ip_count }) }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <button v-if="r.suspended" class="btn-tonal !h-8 !px-3 !text-xs" @click="handleRestore(r.code)">
              <ArrowPathIcon class="w-4 h-4" /> {{ i18n.t('adminRestore') }}
            </button>
            <button
              class="btn-outlined !h-8 !px-3 !text-xs"
              style="border-color: rgb(var(--md-error)); color: rgb(var(--md-error))"
              @click="handleDelete(r.code)"
            >
              <TrashIcon class="w-4 h-4" /> {{ i18n.t('pubDeleteRecord') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
