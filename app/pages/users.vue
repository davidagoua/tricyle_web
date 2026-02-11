<script setup lang="ts">

const pb = usePocketbase()
const toast = useToast()
const users = ref([])
const isEdit = ref(false)
const editingUserId = ref<string | null>(null)

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

const openModal = ref(false)
const showPassword = ref(false)

const openCreateModal = () => {
  isEdit.value = false
  editingUserId.value = null
  newUser.value = {
    "email": "",
    "emailVisibility": true,
    "name": "",
    "role": "agent",
    "password": "",
    "pseudo": "",
  }
  openModal.value = true
}

const openEditModal = (user: any) => {
  isEdit.value = true
  editingUserId.value = user.id
  newUser.value = {
    ...user,
    password: "" // Don't populate password
  }
  openModal.value = true
}

const saveUser = async() => {
  try {
    if (isEdit.value && editingUserId.value) {
      const data = { ...newUser.value }
      if (!data.password) delete data.password // Don't update password if empty
      
      await pb.collection('users').update(editingUserId.value, data)
      toast.add({ title: "Utilisateur mis à jour" })
    } else {
      newUser.value.email = newUser.value.pseudo + "@mail.com"
      newUser.value.passwordConfirm = newUser.value.password
      await pb.collection('users').create(newUser.value)
      toast.add({ title: "Utilisateur créé" })
    }
    await fetchUsers()
    openModal.value = false
  } catch(error) {
    console.log(error)
    toast.add({
      title: "Erreur",
      color: 'error'
    })
  }
}

const deleteModalOpen = ref(false)
const userToDelete = ref<string | null>(null)

const confirmDelete = (userId: string) => {
  userToDelete.value = userId
  deleteModalOpen.value = true
}

const deleteUser = async() => {
  if (!userToDelete.value) return
  
  try {
    await pb.collection('users').delete(userToDelete.value)
    await fetchUsers()
    toast.add({
      title: 'Succès',
      description: 'Utilisateur supprimé',
    })
    deleteModalOpen.value = false
    userToDelete.value = null
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer l\'utilisateur',
      color: 'error'
    })
  }
}
</script>

<template>
  <NuxtLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Utilisateurs</h1>
        
        <div class="flex items-center gap-2">
          <UButton label="Ajouter un utilisateur" icon="i-lucide-user-plus" color="info" @click="openCreateModal" />

          <UModal v-model:open="openModal">
            <template #content>
              <div class="p-4 bg-white border">
                <h3 class="text-lg font-semibold mb-4 border-b pb-2">
                  {{ isEdit ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur' }}
                </h3>
                <form @submit.prevent="saveUser" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-700">Pseudo</label>
                    <UInput v-model="newUser.pseudo" placeholder="Ex: jdoe" class="w-full" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-700">Nom Complet</label>
                    <UInput v-model="newUser.name" placeholder="Ex: Jean Doe" class="w-full" />
                  </div>
                  <div class="space-y-1 md:col-span-2">
                    <label class="text-sm font-medium text-gray-700">
                      Mot de passe {{ isEdit ? '(laisser vide pour ne pas changer)' : '' }}
                    </label>
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
                    <UButton type="submit" color="info">
                      {{ isEdit ? 'Mettre à jour' : 'Enregistrer' }}
                    </UButton>
                  </div>
                </form>
              </div>
            </template>
          </UModal>
        </div>
      </div>

      <!-- Confirmation Delete Modal -->
      <UModal v-model:open="deleteModalOpen">
        <template #content>
          <div class="p-4 bg-white border">
            <h3 class="text-lg font-semibold mb-2">Confirmer la suppression</h3>
            <p class="text-sm text-gray-600 mb-4">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
            <div class="flex justify-end space-x-2">
              <UButton variant="ghost" @click="deleteModalOpen = false">Annuler</UButton>
              <UButton color="error" @click="deleteUser">Supprimer</UButton>
            </div>
          </div>
        </template>
      </UModal>

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
                  <div class="text-sm font-medium text-wp-sidebar-highlight">{{ user.pseudo || user.email?.split('@')[0] || 'N/A' }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ user.name }}</td>
                <td class="px-4 py-3">
                  <UBadge size="xs" color="neutral" variant="subtle" class="capitalize">{{ user.role }}</UBadge>
                </td>
                <td class="px-4 py-3 text-sm text-right space-x-2">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-pencil" @click="openEditModal(user)" />
                  <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash" @click="confirmDelete(user.id)" />
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