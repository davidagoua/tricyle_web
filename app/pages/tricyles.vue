<script setup lang="ts">

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
  "nom": "test",
  "type": "test",
  "matricule": "test",
  "contact": "test",
  "user": "test",
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
            <form @submit.prevent="createTricyle">
              <div class="mb-3">
                <label for="">Nom</label><br>
                <UInput v-model="newCar.nom" />
              </div>
              <div class="mb-3">
                <label for="">Contact</label><br>
                <UInput class="w-full" v-model="newCar.contact" />
              </div>
              <div class="mb-3">
                <label for="">Matricule</label><br>
                <UInput v-model="newCar.matricule" />
              </div>
              <UButton type="submit">Enregistrer</UButton>
            </form>
          </div>
        </template>
      </UModal>
    </div>
    <div class="w-full p-3 bg-white ">
      <table class="w-full table-auto">

        <tr class="text-left">
          <th>Id</th>
          <th>Matricule</th>
          <th>Contact</th>
          <th>Proprio</th>
          <th>Actions</th>
        </tr>
        <tr v-show="loading">
          <td colspan="5">
            <UProgress/>
          </td>
        </tr>
        <tr v-for="tricyle in tricyles" :key="tricyle.id" class="text-left p-3">
          <td>{{ tricyle.id }}</td>
          <td>{{ tricyle.matricule}}</td>
          <td>{{ tricyle.contact}}</td>
          <td>{{ tricyle.user}}</td>
        </tr>
      </table>
    </div>
  </div>

</NuxtLayout>
</template>

<style scoped>

</style>