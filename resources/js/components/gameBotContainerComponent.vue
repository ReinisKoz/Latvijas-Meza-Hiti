<script setup>
import { onMounted, reactive, watch } from 'vue'
import { enableDragDrop, playAnimalBeat, timeline, updateAnimalPositions } from '/resources/js/scripts.js'
import * as Tone from 'tone'

onMounted(() => {
  enableDragDrop()
})

// Make timeline reactive inside Vue
// const state = reactive(timeline)

function play() {
  // apply updated options before playing
  Tone.Transport.bpm.value = state.bpm
  // Tone.Transport.seconds = state.length
  Tone.Destination.volume.value = state.volume

  playAnimalBeat()
}

// Recalculate cols whenever bpm or length changes
// watch(
//   () => [state.bpm, state.length],
//   ([newBpm, newLength]) => {
//     state.cols = Math.floor((newBpm / 60) * newLength)
//     console.log(timeline);
//     updateAnimalPositions();

//   },
//   { immediate: true } // run on mount too
  
// )

function stop() {
  Tone.Transport.stop()
  Tone.Transport.cancel()
}
</script>

<template>
  <div class="bottom-container">
    <!-- SONG OPTIONS BOX -->
    <div class="options-box">
      <div class="controls">
        <button class="btn play-btn" @click="play">▶ Play</button>
        <button class="btn stop-btn" @click="stop">■ Stop</button>
      </div>

      <div class="options">
        <label>
          🔊 Volume
          <!-- <input type="range" min="0" max="1" step="0.05" v-model.number="state.volume"> -->
          <input type="range" min="0" max="1" step="0.05">
        </label>
        <label>
          🎵 BPM
          <!-- <input type="number" min="30" max="1000" v-model.number="state.bpm"> -->
          <input type="number" min="30" max="1000">
        </label>
        <label>
          ⏱️ Length (s)
          <!-- <input type="number" min="1" max="32767" v-model.number="state.length"> -->
          <input type="number" min="1" max="32767">
        </label>
      </div>
    </div>

    <!-- ANIMAL DECK -->
    <div class="animal-deck" id="animal-deck">
      <div class="animal-card" id="bird-card">
        <img id="bird-0" src="/public/bird1.png" alt="Bird" class="draggable animal" style="position: absolute;">
        <span>Bird</span>
      </div>
      <div class="animal-card" id="bear-card">
        <img id="bear-0" src="/public/bear1.png" alt="Bear" class="draggable animal">
        <span>Bear</span>
      </div>
      <!-- 🔮 Future animals -->
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
  grid-template-columns: repeat(auto-fill, 120px);
  gap: 16px;
  align-content: flex-start;
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
</style>
