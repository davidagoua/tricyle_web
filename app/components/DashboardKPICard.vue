<script setup lang="ts">
interface Props {
  name: string
  value: number
}

const {name, value}: Props = defineProps<Props>()

</script>

<template>
  <div class="bg-blue-900 text-white shadow rounded p-4">
    <h3 class="text-sm ">{{ name }}</h3>
    <p class="text-2xl font-semibold">{{ value }}</p>
  </div>
</template>

<style scoped>

</style>