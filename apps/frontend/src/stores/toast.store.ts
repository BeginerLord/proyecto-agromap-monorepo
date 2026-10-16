import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

let sequence = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(message: string, kind: ToastKind = 'info', timeout = 3800) {
    const id = ++sequence
    toasts.value.push({ id, kind, message })
    setTimeout(() => dismiss(id), timeout)
  }

  return {
    toasts,
    dismiss,
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error', 5200),
    info: (message: string) => push(message, 'info'),
  }
})
