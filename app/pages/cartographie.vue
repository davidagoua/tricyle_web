<template>
  <NuxtLayout>
    <div class="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-[#1d2327]">Cartographie des Paiements</h1>
        <div class="text-sm text-gray-500">
          {{ paymentsWithCoords.length }} points localisés
        </div>
      </div>

      <div class="flex flex-1 gap-6 overflow-hidden min-h-0">
        <!-- Tricycle List (2/3) -->
        <div class="w-1/4    bg-white border border-[#dcdcde] shadow-sm flex flex-col min-h-0">
          <div class="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <UIcon name="i-lucide-car-taxi-front" class="w-5 h-5 text-wp-sidebar-highlight" />
              Liste des Tricycles
            </h2>
            <UButton 
              v-if="selectedCarId" 
              label="Voir tous" 
              variant="ghost" 
              size="xs" 
              icon="i-lucide-filter-x"
              @click="selectedCarId = null"
            />
          </div>
          
          <div class="overflow-y-auto flex-1">
            <div v-if="loadingCars" class="p-4">
              <UProgress />
            </div>
            <table v-else class="min-w-full divide-y divide-gray-200">
              <thead class="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Matricule</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Propriétaire</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr 
                  v-for="car in cars" 
                  :key="car.id"
                  class="hover:bg-blue-50 cursor-pointer transition-colors"
                  :class="{'bg-blue-100 border-l-4 border-wp-sidebar-highlight': selectedCarId === car.id}"
                  @click="selectedCarId = car.id"
                >
                  <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ car.matricule }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ car.nom }}</td>
                  
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Map (1/3) -->
        <div class="w-3/4 bg-white border border-[#dcdcde] shadow-sm overflow-hidden relative">
          <div v-if="loading" class="absolute inset-0 z-20 bg-white/80 flex flex-col items-center justify-center p-4 text-center">
            <UProgress />
            <p class="mt-2 text-sm italic text-gray-500">Mise à jour de la carte...</p>
          </div>
          <div ref="mapContainer" class="h-full w-full"></div>
          
          <!-- Badge for status -->
          <div v-if="selectedCarId" class="absolute top-4 left-4 z-10">
             <UBadge color="info" size="sm" class="shadow-md">
                Filtré par véhicule
             </UBadge>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'

const pb = usePocketbase()
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let markersGroup: any = null
const payments = ref<any[]>([])
const cars = ref<any[]>([])
const loading = ref(true)
const loadingCars = ref(true)
const selectedCarId = ref<string | null>(null)

const paymentsWithCoords = computed(() => {
  let filtered = payments.value.filter(p => p.point?.lat && p.point?.lon)
  if (selectedCarId.value) {
    filtered = filtered.filter(p => p.car === selectedCarId.value)
  }
  return filtered
})

const carHasPayments = (carId: string) => {
  return payments.value.some(p => p.car === carId && p.point?.lat && p.point?.lon)
}

const fetchPayments = async () => {
  try {
    loading.value = true
    payments.value = await pb.collection('payments').getFullList({
      expand: 'user,car',
      sort: '-created'
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
  } finally {
    loading.value = false
  }
}

const fetchCars = async () => {
  try {
    loadingCars.value = true
    cars.value = await pb.collection('cars').getFullList({
      sort: 'matricule'
    })
  } catch (error) {
    console.error('Error fetching cars:', error)
  } finally {
    loadingCars.value = false
  }
}

const initMap = async () => {
  if (!process.client || !mapContainer.value) return

  const L = await import('leaflet')
  import('leaflet/dist/leaflet.css')

  if (!map) {
    const defaultCenter: [number, number] = [5.36, -3.99] 
    map = L.map(mapContainer.value).setView(defaultCenter, 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    
    markersGroup = L.featureGroup().addTo(map)
  }

  updateMarkers(L)
}

const updateMarkers = (L: any) => {
  if (!markersGroup) return
  
  markersGroup.clearLayers()

  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  paymentsWithCoords.value.forEach(p => {
    const amount = new Intl.NumberFormat('fr-FR').format(p.amount)
    const agent = p.expand?.user?.name || 'Inconnu'
    const car = p.expand?.car?.matricule || 'Sans matricule'
    const date = new Date(p.created).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

    const popupContent = `
      <div class="p-1">
        <div class="font-bold text-wp-sidebar-highlight text-lg mb-1">${amount} FCFA</div>
        <div class="text-xs text-gray-600 mb-2">${date}</div>
        <div class="space-y-1">
          <div class="flex items-center gap-1 text-sm"><span class="font-semibold">Agent:</span> ${agent}</div>
          <div class="flex items-center gap-1 text-sm"><span class="font-semibold">Tricycle:</span> ${car}</div>
        </div>
      </div>
    `

    L.marker([p.point.lat, p.point.lon], { icon: defaultIcon })
      .addTo(markersGroup)
      .bindPopup(popupContent)
  })

  if (paymentsWithCoords.value.length > 0) {
    map.fitBounds(markersGroup.getBounds(), { padding: [30, 30] })
  }
}

watch(paymentsWithCoords, async () => {
  if (process.client) {
    const L = await import('leaflet')
    updateMarkers(L)
  }
})

onMounted(async () => {
  await Promise.all([fetchPayments(), fetchCars()])
  setTimeout(initMap, 200)
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.leaflet-container {
  z-index: 1;
}
.leaflet-popup-content-wrapper {
    border-radius: 4px;
    padding: 0;
}
.leaflet-popup-content {
    margin: 12px;
}
</style>
