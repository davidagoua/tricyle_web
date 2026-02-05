

export default defineNuxtRouteMiddleware((to, from) => {
    const pb = usePocketbase()
    //console.log(pb)
    return true
    // Vérifie si la route a besoin d'authentification
    if (to.path !== '/login' && ! pb.authStore.isValid) {
        return navigateTo('/login')
    }
})