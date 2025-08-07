<script setup lang="ts">

const pb = usePocketbase()

const users = ref([])

onMounted(async()=>{
  users.value = await pb.collection('users').getFullList();
  console.log(users.value)
})
</script>

<template>
<NuxtLayout>
  <h2 class="text-2xl font-bold">Liste des utilisateurs</h2>
</NuxtLayout>
</template>

<style scoped>

</style>