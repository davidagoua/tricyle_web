export default defineNuxtRouteMiddleware((to) => {
    if (process.server) return
    const pb = usePocketbase()

    // Redirect to login if trying to access a protected page without being authenticated
    if (to.path !== '/login' && !pb.authStore.isValid) {
        return navigateTo('/login')
    }

    // Redirect to home if trying to access login page while already authenticated
    if (to.path === '/login' && pb.authStore.isValid) {
        return navigateTo('/')
    }
})