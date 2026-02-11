<script setup lang="ts">
const pb = usePocketbase()
const toast = useToast()


const payments = ref([])
const paymentsFIltered = computed(()=>{
  return payments.value
})

const isScanSectionOpen = ref(false)

const onpenAddModal = ref(false)

onMounted(async()=>{
  payments.value = await pb.collection('payments').getFullList({
    expand: 'user,car',
  });
  console.log(payments);
  pb.collection('payments').subscribe('*', function (e) {
    if(e.action === 'create'){
      payments.value.push(e.record);
      toast.add({
        title: 'Nouveau paiement',
        description: `Paiement effectué: ${e.record.amount} FCFA`,
      })
    }
  });
})

const withdraw = async(payment) => {
  payment.withdrawed = true
  await pb.collection('payments').update(payment.id, payment)
  toast.add({ title: 'Succès', description: 'Paiement encaissé' })
}

const withdrawAllForAgent = async(agentId: string) => {
  const pendingPayments = payments.value.filter(p => p.user === agentId && !p.withdrawed)
  
  if (pendingPayments.length === 0) return
  
  try {
    const promises = pendingPayments.map(p => {
      const updated = { ...p, withdrawed: true }
      return pb.collection('payments').update(p.id, updated)
    })
    
    await Promise.all(promises)
    
    // Update local state for immediate feedback
    pendingPayments.forEach(p => p.withdrawed = true)
    
    toast.add({ 
      title: 'Succès', 
      description: `${pendingPayments.length} paiements encaissés pour cet agent` 
    })
  } catch (error) {
    toast.add({ 
      title: 'Erreur', 
      description: 'Certains paiements n\'ont pas pu être encaissés',
      color: 'error'
    })
  }
}

const activeTabIndex = ref('summary')
const tabs = [
  { value: 'summary', label: 'Cumul par Agent', icon: 'i-lucide-users', slot: 'summary' },
  { value: 'history', label: 'Historique des paiements', icon: 'i-lucide-history', slot: 'history' },
]

const isMapModalOpen = ref(false)
const selectedPaymentPoint = ref({ lat: 0, lon: 0 })

const openMapModal = (payment: any) => {
  if (payment.point) {
    selectedPaymentPoint.value = payment.point
    isMapModalOpen.value = true
  }
}

const exportToPDF = async () => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  
  const now = new Date().toLocaleDateString('fr-FR')
  doc.setFontSize(20)
  doc.text('Rapport des Paiements', 105, 15, { align: 'center' })
  doc.setFontSize(10)
  doc.text(`Généré le: ${now}`, 105, 22, { align: 'center' })

  if (activeTabIndex.value === 'summary') {
    // Agent Summary Export
    doc.setFontSize(14)
    doc.text('Cumul des paiements par Agent (En attente)', 10, 35)
    
    let y = 45
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Agent', 10, y)
    doc.text('Nombre', 100, y)
    doc.text('Total Cumulé', 150, y)
    
    doc.setFont('helvetica', 'normal')
    y += 10
    
    const summary = {}
    payments.value.forEach(payment => {
      if (!payment.withdrawed) {
        const agentId = payment.user
        const agentName = payment.expand?.user?.name || 'Inconnu'
        if (!summary[agentId]) summary[agentId] = { name: agentName, count: 0, total: 0 }
        summary[agentId].count++
        summary[agentId].total += payment.amount || 0
      }
    })

    Object.values(summary).forEach((agent: any) => {
      if (y > 280) { doc.addPage(); y = 20 }
      doc.text(agent.name, 10, y)
      doc.text(agent.count.toString(), 100, y)
      doc.text(new Intl.NumberFormat('fr-FR').format(agent.total) + ' FCFA', 150, y)
      y += 8
    })
  } else {
    // History Export
    doc.setFontSize(14)
    doc.text('Historique complet des transactions', 10, 35)
    
    let y = 45
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Tricycle', 10, y)
    doc.text('Agent', 40, y)
    doc.text('Date', 90, y)
    doc.text('S.', 120, y)
    doc.text('Montant', 135, y)
    doc.text('Statut', 170, y)
    
    doc.setFont('helvetica', 'normal')
    y += 8
    
    payments.value.forEach(payment => {
      if (y > 280) { doc.addPage(); y = 20 }
      doc.text(payment.expand?.car?.matricule || 'N/A', 10, y)
      doc.text(payment.expand?.user?.name || 'N/A', 40, y)
      doc.text(new Date(payment.created).toLocaleDateString('fr-FR'), 90, y)
      doc.text(payment.numero_semaine?.toString() || '', 120, y)
      doc.text(new Intl.NumberFormat('fr-FR').format(payment.amount || 0) + ' FCFA', 135, y)
      doc.text(payment.withdrawed ? 'Encaissé' : 'En attente', 170, y)
      y += 7
    })
  }
  
  doc.save(`rapport_paiements_${new Date().getTime()}.pdf`)
  toast.add({ title: 'Succès', description: 'PDF généré avec succès' })
}
</script>

<template>
  <NuxtLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Gestion des Paiements</h1>
      </div>

      <UModal v-model:open="isScanSectionOpen">
        <template #content>
          <div class="bg-white border shadow-sm">
            <div 
              class="p-4 border-b bg-gray-50 flex justify-between items-center"
            >
              <h2 class="text-sm font-semibold text-gray-700 uppercase">Scans sans paiement</h2>
              <UButton 
                variant="ghost" 
                color="neutral" 
                icon="i-lucide-x" 
                @click="isScanSectionOpen = false" 
              />
            </div>
            <div class="p-1">
              <ScanList />
            </div>
          </div>
        </template>
      </UModal>

      <div class="bg-white border border-[#dcdcde] shadow-sm overflow-hidden">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50/50">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-5 h-5 text-wp-sidebar-highlight" />
            <h2 class="text-lg font-semibold text-gray-700">Flux de Trésorerie</h2>
          </div>
          <div class="flex items-center gap-2">
            <UButton label="Exporter" icon="i-lucide-download" variant="ghost" size="xs" color="neutral" @click="exportToPDF" />
            <UButton variant="outline" color="neutral" icon="i-lucide-qr-code" @click="isScanSectionOpen = true" label="Scans sans paiement" />
          </div>
        </div>
        
        <UTabs v-model="activeTabIndex" :items="tabs" class="w-full">
          <template #history>
            <PaymentHistoryTable :payments="paymentsFIltered" @withdraw="withdraw" @show-map="openMapModal" />
          </template>
          
          <template #summary>
            <AgentSummaryTable :payments="payments" @withdraw-all="withdrawAllForAgent" />
          </template>
        </UTabs>
      </div>

      <PaymentMapModal 
        :is-open="isMapModalOpen" 
        :point="selectedPaymentPoint" 
        @close="isMapModalOpen = false" 
      />
    </div>
  </NuxtLayout>
</template>

<style scoped>

</style>