import { defineStore } from 'pinia'


export const usePaymentStore = defineStore('payment', {
    state: () => ({
        payments: [],
        loading: false,
        error: null,
    })
})
