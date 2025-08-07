<script setup lang="ts">
interface Props {
  label: string
  link: string
  icon: string
  badge?: string
  active?: boolean
}

const {label, link, icon, badge, active} = defineProps<Props>()
</script>

<template>
<NuxtLink :to="link" active-class="bg-[#273c75]" class="p-4 flex space-x-3 text-white justify-between hover:bg-[#273c75] items-center text-xl flex items-center space-x-3">
  <div class="bg-[#273c75] p-2 pb-0 rounded">
    <UIcon :name="icon" />
  </div>

  <div class="grow">
    <span>{{ label }}</span><br>
  </div>
  <div>
    <u-badge v-if="badge" :label="badge"/>
  </div>

</NuxtLink>
</template>

<style scoped>

</style>