<script setup lang="ts">
import { usePlatform } from '@app/platform'
import { useCounterStore } from '../stores/counter'

const platform = usePlatform()
const counter = useCounterStore()
</script>

<template>
  <div>
    <p>Counter from the shared Pinia store: {{ counter.count }}</p>
    <button type="button" @click="platform.openExternal('https://vuejs.org')">
      Open vuejs.org
    </button>
  </div>
</template>
