<script setup lang="ts">
const props = defineProps({
  payments: {
    type: Array,
    required: true
  }
})

const agentSummary = computed(() => {
  const summary = {}
  
  props.payments.forEach(payment => {
    if (!payment.withdrawed) {
      const agentId = payment.user
      const agentName = payment.expand?.user?.name || 'Inconnu'
      
      if (!summary[agentId]) {
        summary[agentId] = {
          id: agentId,
          name: agentName,
          count: 0,
          total: 0
        }
      }
      
      summary[agentId].count++
      summary[agentId].total += payment.amount || 0
    }
  })
  
  return Object.values(summary).sort((a: any, b: any) => b.total - a.total)
})

const emit = defineEmits(['withdrawAll'])

const onWithdrawAll = (agentId: string) => {
  emit('withdrawAll', agentId)
}

const formatFcfa = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr class="bg-gray-50 text-left">
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Nombre de paiements</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Total Cumulé</th>
          <th class="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100">
        <tr v-for="agent in (agentSummary as any[])" :key="agent.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ agent.name }}</td>
          <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ agent.count }}</td>
          <td class="px-4 py-3 text-sm font-bold text-wp-sidebar-highlight text-right">{{ formatFcfa(agent.total) }}</td>
          <td class="px-4 py-3 text-right">
            <UButton 
              size="xs" 
              color="info" 
              variant="soft" 
              icon="i-lucide-banknote" 
              label="Tout encaisser" 
              @click="onWithdrawAll(agent.id)" 
            />
          </td>
        </tr>
        <tr v-if="agentSummary.length === 0">
          <td colspan="4" class="px-4 py-8 text-center text-gray-500 text-sm italic">
            Aucun paiement en attente de retrait.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
