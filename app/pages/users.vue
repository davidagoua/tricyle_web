<script setup lang="ts">

const pb = usePocketbase()
const toast = useToast()
const users = ref([])
const isEdit = ref(false)

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
  try{
    newUser.value.email = newUser.value.pseudo+"@mail.com"
    newUser.value.passwordConfirm = newUser.value.password
    await pb.collection('users').create(newUser.value)
    await fetchUsers()
    toast.add({
      title: "Utilisateur crée",
      description: "Utilisateur crée"
    })
    openModal.value = false
  }catch(error){
    console.log(error)
    toast.add({
      title: "error",
      color: 'error'
    })
  }

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
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Utilisateurs</h1>
        
        <UModal v-model:open="openModal">
          <UButton label="Ajouter un utilisateur" icon="i-lucide-user-plus" color="info" />

          <template #content>
            <div class="p-4 bg-white border">
              <h3 class="text-lg font-semibold mb-4 border-b pb-2">Créer un nouvel utilisateur</h3>
              <form @submit.prevent="createUser" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Pseudo</label>
                  <UInput v-model="newUser.pseudo" placeholder="Ex: jdoe" class="w-full" />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-700">Nom Complet</label>
                  <UInput v-model="newUser.name" placeholder="Ex: Jean Doe" class="w-full" />
                </div>
                <div class="space-y-1 md:col-span-2">
                  <label class="text-sm font-medium text-gray-700">Mot de passe</label>
                  <UInput 
                    v-model="newUser.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    placeholder="••••••••" 
                    class="w-full"
                    :ui="{ trailing: 'pe-1' }"
                  >
                    <template #trailing>
                      <UButton 
                        variant="ghost" 
                        color="neutral" 
                        size="xs" 
                        :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" 
                        @click="showPassword = !showPassword" 
                      />
                    </template>
                  </UInput>
                </div>
                <div class="md:col-span-2 pt-2 border-t mt-2 flex justify-end space-x-2">
                  <UButton variant="ghost" @click="openModal = false">Annuler</UButton>
                  <UButton type="submit" color="info">Enregistrer l'utilisateur</UButton>
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
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Pseudo / Email</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-wp-sidebar-highlight">{{ user.pseudo || user.email.split('@')[0] }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ user.name }}</td>
                <td class="px-4 py-3">
                  <UBadge size="xs" color="neutral" variant="subtle" class="capitalize">{{ user.role }}</UBadge>
                </td>
                <td class="px-4 py-3 text-sm text-right space-x-2">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-pencil" />
                  <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash" @click="deleteUser(user.id)" />
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