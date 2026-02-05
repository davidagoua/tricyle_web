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
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Gestion des Paiements</h1>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Scan Section -->
        <div class="lg:w-1/3 shrink-0">
          <div class="bg-white border border-[#dcdcde] shadow-sm">
            <div class="p-4 border-b bg-gray-50">
              <h2 class="text-sm font-semibold text-gray-700 uppercase">Scanner un QR Code</h2>
            </div>
            <div class="p-1">
              <ScanList />
            </div>
          </div>
        </div>

        <!-- Payments Table Section -->
        <div class="flex-1">
          <div class="bg-white border border-[#dcdcde] shadow-sm">
            <div class="p-4 border-b flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-700">Historique des transactions</h2>
              <UButton label="Exporter" icon="i-lucide-download" variant="ghost" size="xs" color="neutral" />
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr class="bg-gray-50 text-left">
                    <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                    <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent</th>
                    <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Semaine</th>
                    <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Statut</th>
                    <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="payment in paymentsFIltered" :key="payment.id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ payment.amount }} FCFA</td>
                    <td class="px-4 py-3 text-sm text-gray-700">{{ payment.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ new Date(payment.created).toLocaleDateString('fr-FR') }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ payment.numero_semaine }}</td>
                    <td class="px-4 py-3 text-center">
                      <UBadge v-if="payment.withdrawed" color="success" variant="subtle" size="xs">
                        <UIcon name="i-lucide-check-circle-2" class="mr-1" /> Encaissé
                      </UBadge>
                      <UBadge v-else color="warning" variant="subtle" size="xs">
                        <UIcon name="i-lucide-clock" class="mr-1" /> En attente
                      </UBadge>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <UButton 
                        v-if="!payment.withdrawed" 
                        @click="withdraw(payment)" 
                        label="Encaisser" 
                        size="xs" 
                        color="info" 
                        variant="soft"
                        icon="i-lucide-banknote"
                      />
                    </td>
                  </tr>
                  <tr v-if="paymentsFIltered.length === 0">
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500 text-sm italic">
                      Aucun paiement enregistré pour le moment.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>

</style>