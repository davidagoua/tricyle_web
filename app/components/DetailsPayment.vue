<script setup lang="ts">
interface IProps {
  tricycle: any,
}

const pb = usePocketbase()

const {tricycle} : IProps = defineProps<IProps>()
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
    <div>
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