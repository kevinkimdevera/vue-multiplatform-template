<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePlatform } from '@app/platform'
import { useCounterStore } from '../stores/counter'

const platform = usePlatform()
const counter = useCounterStore()
const version = ref('…')

onMounted(async () => {
  version.value = await platform.getAppVersion()
  await counter.load()
})
</script>

<template>
  <div>
    <p>Platform: {{ platform.name }}</p>
    <p>Version: {{ version }}</p>
    <button type="button" :disabled="!counter.loaded" @click="counter.increment">
      Count is {{ counter.count }}
    </button>
  </div>
</template>
