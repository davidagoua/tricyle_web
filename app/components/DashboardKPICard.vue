<script setup lang="ts">
interface Props {
  name: string
  value: number
}

const {name, value}: Props = defineProps<Props>()

</script>

<template>
  <div class="bg-white border border-[#dcdcde] shadow-sm p-4 hover:shadow-md transition-shadow">
    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">{{ name }}</h3>
    <p class="text-3xl font-bold text-gray-800 mt-1">{{ value }}</p>
  </div>
</template>

<style scoped>

</style>