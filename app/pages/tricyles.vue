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
  pdf.addImage(qrCodeBase64.value, 'PNG', 10, 20, 50, 50)
  pdf.save(`${tricyle.name}_qrcode.pdf`)
}
</script>

<template>
<NuxtLayout>

  <div class="card shadow">
    <div class="flex justify-between p-3 bg-white">
      <h2 class="text-2xl">Liste des tricyles</h2>
      <UModal v-model:open="openModal" >
        <UButton label="Ajouter" color="neutral" variant="subtle" />

        <template #content>
          <div class="p-3">
            <form @submit.prevent="createTricyle" class="grid grid-cols-1 gap-x-2 md:grid-cols-2 gap-3">
              <div class="mb-3">
                <label for="">Nom</label><br>
                <UInput v-model="newCar.nom" />
              </div>
              <div class="mb-3">
                <label for="">Contact</label><br>
                <UInput class="w-full" v-model="newCar.contact" />
              </div>
              <div class="mb-3 col-span-2">
                <label for="">Matricule</label><br>
                <UInput v-model="newCar.matricule" class=" w-full" />
              </div>
              <UButton type="submit">Enregistrer</UButton>
            </form>
          </div>
        </template>
      </UModal>
    </div>
    <div class="w-full p-3 bg-white ">
      <table class="w-full table table-auto">

        <tr class="text-left">
          <th class="p-3">Id</th>
          <th class="p-3">Matricule</th>
          <th class="p-3">Contact</th>
          <th class="p-3">Proprio</th>
          <th class="p-3">Actions</th>
        </tr>
        <tr v-show="loading">
          <td colspan="5">
            <UProgress/>
          </td>
        </tr>
        <tr v-for="tricyle in tricyles" :key="tricyle.id" class="text-left m-3 p-3">
          <td class="p-3">{{ tricyle.id }}</td>
          <td class="p-3">{{ tricyle.matricule}}</td>
          <td class="p-3">{{ tricyle.contact}}</td>
          <td class="p-3">{{ tricyle.user}}</td>
          <td class="p-3">
            <UButton @click="downloadQRCode(tricyle)"><UIcon name="i-lucide-qr-code"/></UButton>
          </td>
        </tr>
      </table>
    </div>
  </div>

</NuxtLayout>
</template>

<style scoped>

</style>