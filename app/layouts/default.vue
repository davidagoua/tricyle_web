<script setup lang="ts">

import {usePocketbase} from "#imports";

const pb = usePocketbase()

const logout = () => {
  pb.authStore.clear()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top Admin Bar -->
    <header class="bg-wp-adminbar h-8 flex items-center px-4 shrink-0 z-50">
      <div class="flex items-center space-x-4 text-wp-sidebar-text text-sm font-medium">
        <UIcon name="i-lucide-car-taxi-front" class="w-4 h-4 text-wp-sidebar-highlight" />
        <span>Tricycle Gestion</span>
      </div>
      <div class="ml-auto flex items-center space-x-4">
        <UDropdownMenu
          :items="[[
            { label: 'Déconnexion', icon: 'i-lucide-log-out', color: 'error', onSelect: logout }
          ]]"
        >
          <UButton variant="ghost" color="neutral" icon="i-lucide-user" size="xs" label="Admin" />
        </UDropdownMenu>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-60 h-screen bg-wp-sidebar h-full overflow-y-auto shrink-0 z-40">
        <MainMenu />
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto bg-wp-body pt-2 px-5 pb-10">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>

</style>