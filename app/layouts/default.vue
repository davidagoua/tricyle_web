<script setup lang="ts">

</script>

<template>
<div class="">
  <div class="flex container space-x-5">
    <div class="bg-[#192a56] h-screen overflow-y-scroll w-2/12">
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