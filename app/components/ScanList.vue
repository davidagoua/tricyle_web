<script setup lang="ts">

const pb = usePocketbase()
const toast = useToast()

const {status, data: scans, refresh, error} = await useAsyncData('scans', async() => await pb.collection('scans').getFullList({
  expand: "user,car"
}))

onMounted(async() => {
  refresh()
  console.table(scans.value)

  pb.collection('scans').subscribe('*', function (e) {
    console.log(e.action);
    console.log(e.record);
    if(e.action === 'create'){
      toast.add({
        title: "Nouveau Scan sans paiement",
        description: `Le tricycle ${e.record.expand.car?.matricule} viens d'être scanné`,
      })
      scans.value.push(e.record)
    }
  }, { expand: "car,user"});
})
</script>

<template>
<div class="">
  <div class="p-3 border-b-gray-300 border-b">
    <h2 class="text-center text-sm items-center space-x-1"><UIcon name="i-lucide-cloud-alert"/> Scans sans paiements <UBadge :label="scans?.length ?? 0" /></h2>
  </div>
  <div v-for="scan in scans" :key="scan.id" class="flex p-3 hover:bg-gray-100 items-center space-x-3">
    <UIcon class="text-red-500" name="i-lucide-cloud-alert" />
    <div>
      <h2>{{scan.expand.car?.matricule}}</h2>
      <small class="text-xs text-gray-500">{{ scan.created}}</small> <br>
      <small class="text-xs text-gray-500">Scanner par: {{ scan.expand.user?.name}}</small>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>