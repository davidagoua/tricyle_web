// plugins/pocketbase.client.ts
import PocketBase from 'pocketbase'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const pb = new PocketBase(config.public.pocketbaseUrl)

    // (optionnel) Restaurer l'authentification si déjà présente
    if (process.client) {
        const authData = localStorage.getItem('pb_auth')
        if (authData) {
            try {
                pb.authStore.loadFromCookie(`pb_auth=${authData}`)
            } catch (e) {
                console.warn('Impossible de restaurer l\'auth', e)
            }
        }

        // Met à jour localStorage à chaque changement d’auth
        pb.authStore.onChange(() => {
            const token = pb.authStore.exportToCookie().split('=')[1]
            localStorage.setItem('pb_auth', token ?? '')
        })
    }

    // Injection de PocketBase globalement
    return {
        provide: {
            pb,
        },
    }
})
