<script setup>
import { onMounted } from 'vue'
import { enableDragDrop } from '/resources/js/scripts.js'

onMounted(() => {
  enableDragDrop()
})
</script>

<template>
  <div class="bottom-container">
    <img id="bird1" src="/public/bird1.png" alt="Bird" class="draggable">
  </div>
</template>

<style>
.bottom-container {
  width: 100%;
  height: 50vh;
  background-color: red;
}

.draggable {
  width: 80px;
  height: 80px;
  color: white;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
}
</style>
