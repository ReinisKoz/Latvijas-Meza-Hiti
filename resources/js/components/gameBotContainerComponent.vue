<script setup>
import { onMounted } from 'vue'
import { enableDragDrop, playAnimalBeat } from '/resources/js/scripts.js'

onMounted(() => {
  enableDragDrop()
})

function play() {
  playAnimalBeat()
}
</script>

<template>
  <div class="bottom-container">
    <img id="bird1" src="/public/bird1.png" alt="Bird" class="draggable animal">
    <img id="bear1" src="/public/bear1.png" alt="bear" class="draggable animal">

    <!-- Vue way -->
    <button @click="play">Play</button>
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
