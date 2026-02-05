<script setup lang="ts">

import { useQRCode } from '@vueuse/integrations/useQRCode'


const pb = usePocketbase();
const toast = useToast()
const openModal = ref(false)
const tricyles = ref([])
const tricylesFiltered = computed(()=> tricyles.value)
const loading = ref(false)

onMounted(async() => {
  await fetchData();
})


const tableColumns = [
  {cell: ({row})=> row.getValue('matricule')},
]


const fetchData = async () => {
  try{
    loading.value = true
    tricyles.value = await pb.collection('cars').getFullList({
      fields: 'id,nom,matricule,contact',
    })

    await pb.collection('cars').subscribe('cars', function (e) {
      console.log(e.action);
      tricyles.value.push(e.record);
    });

  }
  finally{
    loading.value = false
  }
}




const newCar = ref({
  "nom": "",
  "type": "",
  "matricule": "",
  "contact": "",
  "user": "",
  "actif": true
})
const createTricyle = async () => {
  try{
    loading.value = true
    pb.collection('cars').create(newCar.value)
    toast.add({
      title: "Success",
      description: "Tricyle Enregistré"
    })

    await fetchData()
    openModal.value = false
  }
  finally{
    loading.value = false
    emit('close', true)
  }
}

const downloadQRCode = async (tricyle) => {
  const qrCodeBase64 = useQRCode(tricyle.id)
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF()
  pdf.addImage(qrCodeBase64.value, 'PNG', 10, 20, 100, 100)
  pdf.save(`${tricyle.name}_qrcode.pdf`)
}
</script>

<template>
  <NuxtLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Liste des Tricycles</h1>
        
        <UModal v-model:open="openModal">
          <UButton label="Ajouter un véhicule" icon="i-lucide-plus" color="info" />

          <template #content>
            <div class="p-4 bg-white border">
              <h3 class="text-lg font-semibold mb-4 border-b pb-2">Ajouter un nouveau tricycle</h3>
              <form @submit.prevent="createTricyle" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Nom du propriétaire</label>
                  <UInput v-model="newCar.nom" placeholder="Ex: Jean Dupont" class="w-full" />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Numéro de contact</label>
                  <UInput v-model="newCar.contact" placeholder="Ex: 0700000000" class="w-full" />
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-sm font-medium text-gray-700">Matricule</label>
                  <UInput v-model="newCar.matricule" placeholder="Ex: AA-123-BB" class="w-full" />
                </div>
                <div class="md:col-span-2 pt-2 border-t mt-2 flex justify-end space-x-2">
                  <UButton variant="ghost" @click="openModal = false">Annuler</UButton>
                  <UButton type="submit" color="info" :loading="loading">Enregistrer le tricycle</UButton>
                </div>
              </form>
            </div>
          </template>
        </UModal>
      </div>

      <div class="bg-white border border-[#dcdcde] shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rang</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Matricule</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Propriétaire</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-show="loading">
                <td colspan="5" class="p-4">
                  <UProgress />
                </td>
              </tr>
              <tr v-for="(tricycle, index) in tricyles" :key="tricycle.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-sm text-gray-500">{{ index + 1 }}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ tricycle.matricule }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ tricycle.contact }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ tricycle.nom }}</td>
                <td class="px-4 py-3 text-sm text-right space-x-2">
                  <UTooltip text="Télécharger QR Code">
                    <UButton size="xs" variant="ghost" @click="downloadQRCode(tricycle)" icon="i-lucide-qr-code" color="neutral" />
                  </UTooltip>
                  <DetailsPayment :tricycle />
                  <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash" />
                </td>
              </tr>
              <tr v-if="tricyles.length === 0 && !loading">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500 text-sm italic">
                  Aucun tricycle trouvé.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>

</style>