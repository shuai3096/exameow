import { ref } from 'vue'

const _inputs = ref<(string | File)[]>([])
const _names = ref<string[]>([])

export function setFileInputs(values: (string | File)[]) {
  _inputs.value = values
  _names.value = values.map(v =>
    typeof v === 'string'
      ? v.replace(/\\/g, '/').split('/').pop() || v
      : v.name,
  )
}

export function addFileInputs(values: (string | File)[]) {
  _inputs.value.push(...values)
  _names.value.push(...values.map(v =>
    typeof v === 'string'
      ? v.replace(/\\/g, '/').split('/').pop() || v
      : v.name,
  ))
}

export function removeFileInput(index: number) {
  _inputs.value.splice(index, 1)
  _names.value.splice(index, 1)
}

export function getFileInputs() {
  return _inputs.value
}

export function getFileNames() {
  return _names.value
}

export function clearFileInputs() {
  _inputs.value = []
  _names.value = []
}

export const fileInputsRef = _inputs
export const fileNamesRef = _names
