<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  point: {
    type: Object,
    required: true,
    // Expecting { lat: number, lon: number }
  },
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

const initMap = async () => {
  if (!process.client || !mapContainer.value) return

  const L = await import('leaflet')
  import('leaflet/dist/leaflet.css')

  if (map) {
    map.remove()
  }

  const { lat, lon } = props.point
  // Default to a fallback if 0,0 or invalid, but typically we expect valid coords
  const center: [number, number] = [lat || 0, lon || 0]

  map = L.map(mapContainer.value).setView(center, 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Fix for default marker icons not showing in Nutx/Webpack environments
  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  marker = L.marker(center, { icon: defaultIcon }).addTo(map)
    .bindPopup(`Position du scan: ${lat?.toFixed(6)}, ${lon?.toFixed(6)}`)
    .openPopup()
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Small delay to ensure modal is rendered and container has dimensions
    setTimeout(initMap, 100)
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <UModal :model-value="isOpen" @update:model-value="emit('close')">
    <template #content>
      <div class="bg-white border shadow-sm">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 class="text-sm font-semibold text-gray-700 uppercase">Localisation du Paiement</h2>
          <UButton 
            variant="ghost" 
            color="neutral" 
            icon="i-lucide-x" 
            @click="emit('close')" 
          />
        </div>
        <div class="p-4">
          <div ref="mapContainer" class="h-[400px] w-full rounded border border-gray-200"></div>
          <div class="mt-4 text-xs text-gray-500 italic flex items-center gap-1">
            <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
            Coordonnées: {{ point.lat }}, {{ point.lon }}
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style>
/* Ensure leaflet controls are above other content but below modal z-index if needed */
.leaflet-container {
  z-index: 1;
}
</style>
