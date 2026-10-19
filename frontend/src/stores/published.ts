import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface PublishedRecord {
  code: string
  title: string
  manageUrl: string
  publishedAt: number
}

const KEY = 'exameow-published'

function load(): PublishedRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export const usePublishedStore = defineStore('published', () => {
  const list = ref<PublishedRecord[]>(load())
  watch(list, (v) => localStorage.setItem(KEY, JSON.stringify(v)), { deep: true })

  function add(rec: PublishedRecord) {
    list.value.unshift(rec)
  }
  function remove(code: string) {
    list.value = list.value.filter((r) => r.code !== code)
  }
  return { list, add, remove }
})
