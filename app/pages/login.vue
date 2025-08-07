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
<div class="h-screen m-auto flex itemce-center ">
  <div class=" w-4/12 mt-16 p-5 shadow-lg contain-content rounded mx-auto">
    <form @click="login">
      <h3 class="text-center text-2xl font-bold">Se connecter</h3>
      <div class="mb-3">
        <label for="">Email</label><br>
        <UInput class="w-full p-3" v-model="loginForm.email"/>
      </div>
      <div class="mb-3">
        <label for="">Mot de passe</label><br>
        <UInput class="w-full p-3" v-model="loginForm.password"/>
      </div>
      <div class="mt-2">
        <UButton type="submit" label="Se connecter" :loading/>
      </div>
    </form>
  </div>
</div>
</template>

<style scoped>

</style>