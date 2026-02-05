<script setup lang="ts">

import { useQRCode} from '@vueuse/integrations/useQRCode'

interface IProps {
  tricycle: any,
}

const pb = usePocketbase()

const {tricycle} : IProps = defineProps<IProps>()
const qrcode = useQRCode(shallowRef(tricycle.id))
const payments = ref([])

const title = ref(`Details Paiement #${tricycle.id}`)
onMounted(async () => {
  payments.value =   await pb.collection('payments').getFullList({
    filter: `car="${tricycle.id}"`
  })
})
</script>

<template>
<UModal :title>
  <UButton ><UIcon name="i-lucide-eye" /></UButton>
  <template #content>
    <div class="p-5">
      <div class="grid grid-cols-3 gap-3">
        <div>
          <small class="text-xs text-green-500">Proprietaire</small> <br>
          {{ tricycle.nom }}
        </div>
        <div>
          <small class="text-xs text-green-500">Contact</small> <br>
          {{ tricycle.contact }}
        </div>
        <div>
          <small class="text-xs text-green-500">Matricule</small> <br>
          {{ tricycle.matricule }}
        </div>
      </div>
      <div>
        <img :src="qrcode" :alt="tricycle.id">
      </div>
      <div class="grid grid-cols-4" v-for="payment in payments" :key="payment.id">
        <div>{{payment.id}}</div>
        <div></div>
        <div></div>
        <div></div>
      </div>

    </div>
  </template>
</UModal>
</template>

<style scoped>

</style>