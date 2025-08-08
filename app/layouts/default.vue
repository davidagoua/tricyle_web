<script setup lang="ts">

import {usePocketbase} from "#imports";

const pb = usePocketbase()

onMounted(async()=>{

})
</script>

<template>
<div class="">
  <div class="flex container space-x-5">
    <div class="bg-[#192a56] h-screen overflow-y-scroll min-w-[210px]">
      <MainMenu/>
    </div>
    <div class="mt-5 w-10/12">
      <slot/>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>