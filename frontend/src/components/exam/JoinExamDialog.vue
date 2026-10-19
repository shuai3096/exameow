<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { useJoinedStore } from '@/stores/joined'

const emit = defineEmits<{ (e: 'close'): void }>()
const i18n = useI18nStore()
const router = useRouter()
const joinedStore = useJoinedStore()

const code = ref('')
const name = ref('')

function handleJoin() {
  const c = code.value.trim().toUpperCase()
  if (c.length !== 6 || !name.value.trim()) return
  joinedStore.add(c, name.value.trim())
  router.push({ path: `/take/${c}`, query: { name: name.value.trim() } })
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0,0,0,0.4)" @click.self="emit('close')">
    <div class="card-filled w-full max-w-sm p-5 space-y-4">
      <h2 class="text-title-lg">{{ i18n.t('joinDialogTitle') }}</h2>
      <div>
        <label class="text-label-sm">{{ i18n.t('joinCodeLabel') }}</label>
        <input v-model="code" maxlength="6" class="input-outlined w-full mt-1 text-center text-2xl tracking-[0.3em] uppercase" />
      </div>
      <div>
        <label class="text-label-sm">{{ i18n.t('joinNameLabel') }}</label>
        <input v-model="name" class="input-outlined w-full mt-1" />
      </div>
      <div class="flex gap-2 justify-end">
        <button class="btn-outlined" @click="emit('close')">{{ i18n.t('pubCancel') }}</button>
        <button class="btn-filled" :disabled="code.trim().length !== 6 || !name.trim()" @click="handleJoin">
          {{ i18n.t('joinConfirm') }}
        </button>
      </div>
    </div>
  </div>
</template>
