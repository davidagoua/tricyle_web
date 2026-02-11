<template>
  <NuxtLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Tableau de Bord</h1>
      </div>

      <!-- KPIs Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKPICard name="Tricycles" :value="stats.tricycles" />
        <DashboardKPICard name="Agents" :value="stats.agents" />
        <DashboardKPICard name="Paiements" :value="stats.paiements" />
        <DashboardKPICard name="Montant Total" :value="formatFcfa(stats.totalMontant)" />
      </div>

      <!-- Paiement par semaine -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white border border-[#dcdcde] shadow-sm p-5">
          <h2 class="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Montants par semaine</h2>
          <ul class="divide-y divide-gray-100">
            <li v-for="(amount, week) in stats.montantParSemaine" :key="week" class="py-2 flex justify-between">
              <span class="text-gray-600">Semaine {{ week }}-{{ (new Date()).getFullYear()}}</span>
              <span class="font-semibold text-gray-900">{{ formatFcfa(amount) }}</span>
            </li>
          </ul>
        </div>
        <div class="bg-white border border-[#dcdcde] shadow-sm p-5">
          <h2 class="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Récapitulatif Encaissements</h2>
          <div class="space-y-4 text-center py-4">
            <p class="text-sm text-gray-500 uppercase">Total encaissé</p>
            <p class="text-4xl font-bold text-green-600">{{ formatFcfa(stats.totalMontantwithDrawed) }}</p>
          </div>
        </div>
      </div>

      <!-- Tableau somme par utilisateur -->
      <div class="bg-white border border-[#dcdcde] shadow-sm">
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-700">Montant total par agent</h2>
        </div>
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-50 text-left border-b">
              <th class="p-4 text-sm font-semibold text-gray-600">Agent</th>
              <th class="p-4 text-sm font-semibold text-gray-600">Montant total</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="user in stats.parUser" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4 text-sm text-gray-700">{{ user.name }}</td>
              <td class="p-4 text-sm font-medium text-gray-900">{{ formatFcfa(user.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import PocketBase from 'pocketbase'
import {usePocketbase} from "#imports";
import DashboardKPICard from "~/components/DashboardKPICard.vue";

// 💡 Remplace par ton URL
const pb = usePocketbase()

const stats = reactive({
  tricycles: 0,
  agents: 0,
  paiements: 0,
  totalMontant: 0,
  montantParSemaine: {},
  parUser: [],
  paiementsWithDrawed: 0,
  totalMontantwithDrawed: 0
})

const fetchStats = async () => {
  // Nombre de tricycles
  const tricycles = await pb.collection('cars').getFullList({ $autoCancel: false })
  stats.tricycles = tricycles.length

  // Nombre d'agents
  const agents = await pb.collection('users').getFullList({
    filter: 'role="agent"',
    $autoCancel: false,
  })
  stats.agents = agents.length

  // Paiements
  const paiements = await pb.collection('payments').getFullList({ $autoCancel: false, })
  stats.paiements = paiements.length
  stats.totalMontant = paiements.reduce((acc, p) => acc + (p.amount || 0), 0)

  const paiementsWithDrawed = await pb.collection('payments').getFullList({ $autoCancel: false, filter: 'withdrawed=true' })
  stats.paiementsWithDrawed = paiementsWithDrawed.length
  stats.totalMontantwithDrawed = paiementsWithDrawed.reduce((acc, p) => acc + (p.amount || 0), 0)

  // Paiements par semaine
  stats.montantParSemaine = {}
  for (const p of paiements) {
    const date = new Date(p.created)
    const week = getWeekNumber(date)
    stats.montantParSemaine[week] = (stats.montantParSemaine[week] || 0) + (p.amount || 0)
  }

  // Montants par user
  const mapUser = new Map<string, number>()
  for (const p of paiements) {
    const user = p.expand?.user?.name || p.user
    mapUser.set(user, (mapUser.get(user) || 0) + (p.amount || 0))
  }
  stats.parUser = Array.from(mapUser.entries()).map(([name, total]) => ({ name, total }))
}

onMounted(fetchStats)

// Helper pour le numéro de semaine
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

function formatFcfa(amount: number) {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })
}
</script>

<!-- 💳 Composant KPI simple -->
<script lang="ts">
export default {
  components: {
    KpiCard: {
      props: ['title', 'value'],
      template: `
        <div class="bg-white shadow rounded p-4">
          <h3 class="text-sm text-gray-500">{{ title }}</h3>
          <p class="text-2xl font-semibold">{{ value }}</p>
        </div>
      `,
    },
  },
}
</script>
