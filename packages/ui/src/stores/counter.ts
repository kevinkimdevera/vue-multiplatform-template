import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePlatform } from '@app/platform'

const STORAGE_KEY = 'counter'

/** Example store persisted through the platform's storage adapter. */
export const useCounterStore = defineStore('counter', () => {
  // Setup stores can inject app-level provides, so the store gets the current shell's platform.
  const platform = usePlatform()
  const count = ref(0)
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    count.value = Number(await platform.storage.get(STORAGE_KEY)) || 0
    loaded.value = true
  }

  async function increment() {
    count.value++
    await platform.storage.set(STORAGE_KEY, String(count.value))
  }

  return { count, loaded, load, increment }
})
