<script setup lang="ts">
const pb = usePocketbase()
const toast = useToast()


const payments = ref([])
const paymentsFIltered = computed(()=>{
  return payments.value
})

const onpenAddModal = ref(false)

onMounted(async()=>{
  payments.value = await pb.collection('payments').getFullList({
    expand: 'user.name,car.matricule',
  });
  console.log(payments);
  pb.collection('payments').subscribe('*', function (e) {
    console.log(e.action);
    console.log(e.record);

    if(e.action === 'create'){
      payments.value.push(e.record);
      toast.add({
        title: 'Nouveau paiement',
        description: `Paiement effectué: ${e.record.amount} FCFA`,
      })

    }

  });

})


const withdraw = async(payment) => {
  payment.withdrawed = true
  await pb.collection('payments').update(payment.id, payment)
}

</script>

<template>
<NuxtLayout>
  <div class="flex space-x-3">
    <div class="card shadow w-4/12">
      <ScanList/>
    </div>
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
        <div>
          <div class="grid bg-gray-300 p-3 grid-cols-6 mb-4 gap-4">
            <div>Montant</div>
            <div>Agent</div>
            <div>Date</div>
            <div>Semaine</div>
            <div>Encaissé</div>
            <div>Actions</div>
          </div>
          <div v-for="payment in paymentsFIltered" :key="payment.id" class="grid hover:bg-gray-50 grid-cols-6 p-3 gap-4">
            <div>{{payment.amount}} FCFA</div>
            <div>{{payment.name}}</div>
            <div class="text-sm">{{payment.created}}</div>
            <div>{{payment.numero_semaine}}</div>
            <div>
              <UBadge v-if="payment.withdrawed" >
                <UIcon name="i-lucide-check" />
              </UBadge>
              <UBadge v-else  color="neutral" >
                <UIcon name="i-lucide-clock-3"/>
              </UBadge>
            </div>
            <div>
              <UButton v-if="!payment.withdrawed" @click="withdraw(payment)" label="Encaisser" color="neutral" variant="subtle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>



</NuxtLayout>
</template>

<style scoped>

</style>