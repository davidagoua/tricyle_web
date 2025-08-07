<script setup lang="ts">
const pb = usePocketbase()
const payments = ref([])
const paymentsFIltered = computed(()=>{
  return payments.value
})

const onpenAddModal = ref(false)

onMounted(async()=>{
  payments.value = await pb.collection('payments').getFullList();
  console.log(payments.value)
})
</script>

<template>
<NuxtLayout>
  <div class="card shadow">
    <div class="flex justify-between p-3 bg-white">
      <h2 class="text-2xl">Liste de paiements</h2>
      <UModal >
        <UButton label="Ajouter" color="neutral" variant="subtle" />

        <template #content>

        </template>
      </UModal>
    </div>
    <div class="w-full p-3 bg-white ">
      <UTable loading loading-animation="carousel" :data="paymentsFIltered" class="flex-1" />
    </div>
  </div>



</NuxtLayout>
</template>

<style scoped>

</style>