<script setup>
import { ref } from 'vue'
import { Howl } from 'howler'

const droppedImage = ref(null)

// Initialize sound
const dropSound = new Howl({
  src: ['/sounds/sound1.mp3']
})

function handleDrop(event) {
  event.preventDefault()
  const data = event.dataTransfer.getData('text/plain')
  droppedImage.value = data
  dropSound.play() // play sound on drop
}

function handleDragOver(event) {
  event.preventDefault()
}
</script>

<template>
  <div class="drag-container">
    <h3>Drag the bird and drop it below</h3>
    <img
      src="/public/bird1.png"
      alt="Bird"
      draggable="true"
      @dragstart="event => event.dataTransfer.setData('text/plain', '/bird1.png')"
      class="draggable-img"
    />

    <div
      class="drop-zone"
      @drop="handleDrop"
      @dragover="handleDragOver"
    >
      <p v-if="!droppedImage">Drop here</p>
      <img v-if="droppedImage" :src="droppedImage" alt="Dropped" />
    </div>
  </div>
</template>

<style>
.drag-container {
  text-align: center;
  margin-top: 20px;
}

.draggable-img {
  width: 150px;
  cursor: grab;
}

.drop-zone {
  width: 300px;
  height: 200px;
  margin: 20px auto;
  border: 2px dashed gray;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.drop-zone img {
  max-width: 100%;
  max-height: 100%;
}
</style>
