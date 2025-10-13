<script setup>
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import axios from 'axios'
import { enableDragDrop, playAnimalBeat, stopAnimalBeat, timeline, loadAnimalSounds } from '/resources/js/scripts.js'
import { Howler } from 'howler'
import { useRouter } from 'vue-router'

const router = useRouter()

// timeline reactive copy
const state = reactive({ ...timeline })

// animals loaded from backend
const animals = ref([])

// async function fetchAnimals() {
//   try {
//     const res = await axios.get('/api/animal')
//     animals.value = res.data
//     console.log('Animals loaded:', animals.value)
//   } catch (err) {
//     console.error('❌ Failed to load animals:', err)
//   }
// }
function goToWheel() {
  router.push('/wheel') // adjust route if needed
}

onMounted(async () => {
  loadAnimalSounds()
  const res = await axios.get('/api/animal')
  animals.value = res.data
})

// Run drag-drop setup when animals change
watch(animals, (newVal) => {
  if (newVal.length > 0) {
    nextTick(() => {
      enableDragDrop()
    })
  }
})

function play() {
  // loadAnimalSounds()
  Howler.volume(state.volume)
  playAnimalBeat()
  console.log(state)
}

function stop() {
  stopAnimalBeat()
}

// recalc cols on bpm/length change
watch(
  () => [state.bpm, state.length],
  ([newBpm, newLength]) => {
    state.cols = Math.floor((newBpm / 60) * newLength)
    timeline.cols = state.cols
    timeline.bpm = newBpm
    timeline.length = newLength
    // updateAnimalPositions()
  },
  { immediate: true }
)

// sync volume
watch(
  () => state.volume,
  (newVol) => {
    timeline.volume = newVol
    Howler.volume(newVol)
  }
)
</script>

<template>
  <div class="bottom-container">
    <div class="wheel-box">
      <h3>Get new animals</h3>
      <img
        src="/public/wheel-preview.png"
        alt="Wheel of Fortune"
        class="wheel-image"
      >
      <button class="btn wheel-btn" @click="goToWheel">
        Spin the Wheel
      </button>
    </div>
    <!-- SONG OPTIONS BOX -->
    <div class="options-box">
      <div class="controls">
        <button class="btn play-btn" @click="play">▶ Play</button>
        <button class="btn stop-btn" @click="stop">■ Stop</button>
      </div>

      <div class="options">
        <label>
          🔊 Volume
          <input type="range" min="0" max="1" step="0.05" v-model.number="state.volume">
        </label>
        <label>
          🎵 BPM
          <input type="number" min="30" max="300" v-model.number="state.bpm">
        </label>
        <label>
          ⏱️ Length (s)
          <input type="number" min="2" max="32767" v-model.number="state.length">
        </label>
      </div>
    </div>

    <!-- ANIMAL DECK -->
    <div class="animal-deck" id="animal-deck">
      <div
        v-for="animal in animals"
        :key="animal.id"
        class="animal-card"
        :id="animal.name.toLowerCase() + '-card'"
      >
        <img
          :id="animal.name.toLowerCase() + '-0'"
          :src="animal.image"
          :alt="animal.name"
          class="draggable animal"
        >
        <span>{{ animal.name }}</span>
      </div>
    </div>
  </div>
</template>


<style scoped>
.bottom-container {
  width: 100%;
  height: 50vh;
  background-color: #e6f7e6;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 20px;
  gap: 40px;
  box-sizing: border-box;
  font-family: 'Comic Sans MS', 'Comic Neue', cursive;
}

/* OPTIONS BOX */
.options-box {
  background: #a7e9af;
  border: 3px solid #6cc070;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.controls {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: center;
}

.btn {
  font-size: 1.1rem;
  font-weight: bold;
  padding: 10px 22px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease-in-out;
}

.play-btn {
  background: linear-gradient(135deg, #4ade80, #16a34a);
}

.stop-btn {
  background: linear-gradient(135deg, #f87171, #ef4444);
}

.btn:hover {
  transform: scale(1.05);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #064e3b;
  font-size: 0.95rem;
}

.options label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ANIMAL DECK */
.animal-deck {
  display: grid;
  grid-auto-flow: column;      /* 🟢 Fill grid by columns, not rows */
  grid-template-rows: repeat(2, 1fr); /* 🟢 Always 2 rows vertically */
  gap: 16px;
  align-content: start;
}

.animal-card {
  width: 120px;
  height: 140px;
  background: #d9f99d;
  border: 3px solid #84cc16;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.animal-card:hover {
  transform: scale(1.05);
}

.animal {
  position: absolute;
  width: 80px;
  height: 80px;
  object-fit: contain;
  cursor: grab;
  user-select: none;
  z-index: 5;
  will-change: transform;
  margin: 0px;
}

.animal-card span {
  font-size: 0.9rem;
  font-weight: bold;
  color: #166534;
}

/* 🟢 WHEEL BOX */
.wheel-box {
  background: #c9f5ff;
  border: 3px solid #38bdf8;
  border-radius: 16px;
  padding: 16px 20px;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.wheel-box h3 {
  color: #0369a1;
  text-align: center;
  font-weight: bold;
}

.wheel-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid #38bdf8;
  background: white;
}

.wheel-btn {
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  font-size: 1rem;
  padding: 10px 16px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.wheel-btn:hover {
  transform: scale(1.05);
}
</style>
