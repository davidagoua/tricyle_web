<script setup lang="ts">

const pb = usePocketbase()
const toast = useToast()
const users = ref([])

onMounted(async()=>{
  await fetchUsers()
  console.log(users.value)
})

const fetchUsers = async () => {
  users.value = await pb.collection('users').getFullList();
}

const newUser = ref({
    "email": "",
    "emailVisibility": true,
    "name": "",
    "role": "agent",
    "password": "",
    "pseudo": "",
})
const createUser = async() => {
  newUser.value.email = newUser.value.pseudo+"@mail.com"
  newUser.value.passwordConfirm = newUser.value.password
  await pb.collection('users').create(newUser.value)
  await fetchUsers()
  openModal.value = false
}
const showPassword = ref(false)
const openModal = ref(false)

const deleteUser = async(userId: string) => {
  await pb.collection('users').delete(userId)
  await fetchUsers()
  toast.add({
    title: 'Success',
    description: 'Utilisateur supprimé',
  })
}
</script>

<template>
<NuxtLayout>
  <div class="flex justify-between items-center mb-3">
    <h2 class="text-2xl font-bold">Liste des utilisateurs</h2>
    <UModal v-model:open="openModal" >
      <UButton label="Ajouter" color="neutral" variant="subtle" />

      <template #content>
        <div class="p-3 ">
          <form @submit.prevent="createUser" class="grid grid-cols-1 gap-x-2 md:grid-cols-2 gap-3">
            <div class="mb-3">
              <label for="">Pseudo</label><br>
              <UInput v-model="newUser.pseudo" type="text" name="pseudo" placeholder="Pseudo" />
            </div>
            <div class="mb-3">
              <label for="">Nom</label><br>
              <UInput class="w-full" v-model="newUser.name" type="text" name="name" placeholder="Nom" />
            </div>
            <div class="mb-3 col-span-2">
              <label for="">Mot de passe</label><br>
              <UInput :ui="{ trailing: 'pe-1' }" v-model="newUser.password" class=" w-full" :type="showPassword ? 'text' : 'password'" name="password" placeholder="Mot de passe" >
                <template #trailing>
                  <UIcon @click="showPassword = ! showPassword" :name=" !showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"  />
                </template>
              </UInput>
            </div>
            <UButton type="submit">Enregistrer</UButton>
          </form>
        </div>
      </template>
    </UModal>
  </div>
  <div>
    <div class="grid bg-gray-300 p-3 grid-cols-5 mb-4 gap-4">
      <div>ID</div>
      <div>EMAIL</div>
      <div>NOM</div>
      <div>ROLE</div>
    </div>
    <div v-for="user in users" :key="user.id"  class="grid hover:bg-gray-50 grid-cols-5 p-3 gap-4">
      <div>{{user.id}}</div>
      <div>{{user.email}}</div>
      <div>{{user.name}}</div>
      <div>{{user.role}}</div>
      <div>
        <UButton label="Modifier" color="neutral" variant="subtle" />
        <UButton @click="deleteUser(user.id)" label="Supprimer" color="error"  />
      </div>
    </div>
  </div>
</NuxtLayout>
</template>

<style scoped>

</style>