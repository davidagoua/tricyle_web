<script setup lang="ts">
const pb = usePocketbase()
const toast = useToast()

const loading = ref(false)

const loginForm = ref({
  email: "",
  password: ""
})
const login = async () => {
  try{
    loading.value = true
    const authData = await pb.collection('users').authWithPassword(loginForm.value.email, loginForm.value.password)
    if (pb.authStore.isValid) {
      navigateTo("/")
    }else{
      toast.add({
        color: 'error',
        title: "Login failed",
        description: "Email ou Mot de passe incorrect"
      })
    }
  }catch(error){
    console.log(error)
    toast.add({
      title: "Error",
      description: error,
    })
  }
  finally{
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f0f0f1] flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-6">
        <UIcon name="i-lucide-car-taxi-front" class="w-12 h-12 text-wp-sidebar-highlight mx-auto mb-2" />
        <h1 class="text-xl font-bold text-[#1d2327]">Tricycle CMS</h1>
      </div>
      
      <div class="bg-white border border-[#dcdcde] shadow-sm p-6">
        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Identifiant ou E-mail</label>
            <UInput v-model="loginForm.email" class="w-full" size="md" />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Mot de passe</label>
            <UInput v-model="loginForm.password" type="password" class="w-full" size="md" />
          </div>
          <div class="flex items-center justify-between pt-2">
            <UCheckbox label="Se souvenir de moi" size="xs" />
            <UButton type="submit" label="Se connecter" color="info" :loading="loading" />
          </div>
        </form>
      </div>
      
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-xs text-[#2271b1] hover:text-[#135e96]">← Retour vers le site</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>