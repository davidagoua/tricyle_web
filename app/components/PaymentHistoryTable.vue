<script setup lang="ts">
const props = defineProps({
  payments: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['withdraw', 'showMap'])

const onWithdraw = (payment) => {
  emit('withdraw', payment)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr class="bg-gray-50 text-left">
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tricycle</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Semaine</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Statut</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100">
        <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ payment.expand?.car?.matricule || 'N/A' }}</td>
          <td class="px-4 py-3 text-sm text-gray-700">{{ payment.expand?.user?.name || 'N/A' }}</td> 
          <td class="px-4 py-3 text-sm text-gray-500">{{ new Date(payment.created).toLocaleDateString('fr-FR') }}</td>
          <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ payment.numero_semaine }}</td>
          <td class="px-4 py-3 text-center">
            <UBadge v-if="payment.withdrawed" color="success" variant="subtle" size="xs">
              <UIcon name="i-lucide-check-circle-2" class="mr-1" /> Encaissé
            </UBadge>
            <UBadge v-else color="warning" variant="subtle" size="xs">
              <UIcon name="i-lucide-clock" class="mr-1" /> En attente
            </UBadge>
          </td>
          <td class="px-4 py-3 text-right space-x-2">
            <UTooltip text="Voir sur la carte" v-if="payment.point?.lat && payment.point?.lon">
              <UButton 
                @click="emit('showMap', payment)" 
                size="xs" 
                color="neutral" 
                variant="ghost"
                icon="i-lucide-map"
              />
            </UTooltip>
            <UButton 
              v-if="!payment.withdrawed" 
              @click="onWithdraw(payment)" 
              label="Encaisser" 
              size="xs" 
              color="info" 
              variant="soft"
              icon="i-lucide-banknote"
            />
          </td>
        </tr>
        <tr v-if="payments.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-gray-500 text-sm italic">
            Aucun paiement enregistré pour le moment.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
