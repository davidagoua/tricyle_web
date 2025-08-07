// composables/usePocketbase.ts
export const usePocketbase = () => {
    return useNuxtApp().$pb as import('pocketbase').default
}
