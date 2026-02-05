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
  <NuxtLink 
    :to="link" 
    active-class="bg-wp-sidebar-highlight text-white !border-l-4 border-white"
    class="px-3 py-2 flex items-center space-x-3 text-wp-sidebar-text hover:text-wp-sidebar-highlight hover:bg-[#2c3338] transition-colors border-l-4 border-transparent text-sm"
  >
    <UIcon :name="icon" class="w-5 h-5 shrink-0" />
    <span class="font-medium grow">{{ label }}</span>
    <UBadge v-if="badge" :label="badge" size="xs" color="neutral" variant="subtle" class="ml-auto" />
  </NuxtLink>
</template>

<style scoped>

</style>