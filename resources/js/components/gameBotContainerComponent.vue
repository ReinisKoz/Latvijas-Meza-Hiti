<script setup>
import { onMounted, reactive, ref, watch, nextTick } from 'vue'
import axios from 'axios'
import { enableDragDrop, playAnimalBeat, stopAnimalBeat, timeline, loadAnimalSounds, animalPlayers, animalPositions, createAnimalClones } from '/resources/js/scripts.js'
import { Howler } from 'howler'
import * as Tone from 'tone'
import { useRouter, useRoute } from 'vue-router'



const route = useRoute()
const router = useRouter()
const projectId = ref(route.params.id)
const saveStatus = ref('')
const projectData = ref({})

// onMounted(async () => {
//   const res = await axios.get(`/api/projects/${projectId.value}`, { withCredentials: true })
//   projectData.value = res.data
//   if (projectData.value.data) {
//     Object.assign(timeline, projectData.value.data.timeline || {})
//     Object.assign(animalPositions, projectData.value.data.positions || {})
//   }
// })

// onMounted(async () => {
//   const res = await axios.get(`/api/projects/${projectId.value}`, { withCredentials: true })
//   projectData.value = res.data
//   if (projectData.value.data) {
//     Object.assign(timeline, projectData.value.data.timeline || {})
//     Object.assign(animalPositions, projectData.value.data.positions || {})
//   }
//   // const res = await axios.get(`/api/project/${timeline.project_id}`)
//   // const project = res.data
//   // timeline.bpm = project.bpm
//   // timeline.length = project.length
//   // timeline.volume = project.volume
//   const animalRes = await axios.get('/api/animal', { withCredentials: true })
//   animals.value = animalRes.data
//   // animals.value = project.animals // load base animal data
//   // Object.assign(animalPositions, project.animal_positions) // in-memory positions

//   await nextTick()
//   await createAnimalClones()
//   enableDragDrop()
// })


// 🧠 Save function
async function saveProject() {
  console.log("saving...")
  try {
    const payload = {
      data: {
        timeline: {
          bpm: timeline.bpm,
          length: timeline.length,
          volume: timeline.volume,
        },
        positions: animalPositions
      }
    }
    await axios.put(`/api/projects/${projectId.value}`, payload, { withCredentials: true })
    saveStatus.value = '💾 Saved!'
  } catch (err) {
    saveStatus.value = '⚠️ Save failed'
    console.error(err)
  }
}

watch(
  () => [timeline.bpm, timeline.length, timeline.volume, { ...animalPositions }],
  saveProject,
  { deep: true }
)


// timeline reactive copy
// const state = reactive({ ...timeline })

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

// onMounted(async () => {
//   loadAnimalSounds()
//   // const res = await axios.get('/api/animal')
//   // animals.value = res.data
//   const res = await axios.get('/api/animal', { withCredentials: true })
//   animals.value = res.data

// })

// Run drag-drop setup when animals change
// watch(animals, (newVal) => {
//   if (newVal.length > 0) {
//     nextTick(() => {
//       enableDragDrop()
//     })
//   }
// })

function play() {
  // loadAnimalSounds()
  // Howler.volume(state.volume)
  // playAnimalBeat()
  // console.log(state)
  Howler.volume(timeline.volume)
  playAnimalBeat()
  console.log(timeline)
}

function stop() {
  stopAnimalBeat()
}

// recalc cols on bpm/length change
watch(
  () => [timeline.bpm, timeline.length],
  ([newBpm, newLength]) => {
    timeline.cols = Math.ceil((newBpm / 60) * newLength)
    timeline.bpm = newBpm
    timeline.length = newLength
  },
  { immediate: true }
)

// sync volume
watch(
  () => timeline.volume,
  (newVol) => {
    const db = Tone.gainToDb(newVol)
    for (const pool of Object.values(animalPlayers)) {
      if (Array.isArray(pool)) {
        pool.forEach(player => {
          if (player && player.volume) player.volume.value = db
        })
      } else if (pool && pool.volume) {
        pool.volume.value = db
      }
    }
  }
)

const isRecording = ref(false)
const recordFormat = ref('wav')
let recorder = null
let recordedChunks = []

// Utility: Connect all Tone.js outputs to recorder
function connectRecorder() {
  const dest = Tone.context.createMediaStreamDestination()
  for (const pool of Object.values(animalPlayers)) {
    const players = Array.isArray(pool) ? pool : [pool]
    for (const player of players) {
      if (player && player.output) player.connect(dest)
    }
  }
  return dest
}

async function startRecording() {
  if (isRecording.value) return
  await Tone.start()

  const dest = connectRecorder()
  recordedChunks = []
  let mimeType = 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    mimeType = 'audio/webm;codecs=opus'
  } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
    mimeType = 'audio/ogg;codecs=opus'
  }

  recorder = new MediaRecorder(dest.stream, { mimeType })

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data)
  }

  recorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: recorder.mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `animal-beat.${recordFormat.value}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    isRecording.value = false
  }

  recorder.start()
  isRecording.value = true
  console.log(`🎙️ Recording started (${recordFormat.value.toUpperCase()})`)
}

function stopRecording() {
  if (recorder && isRecording.value) {
    stopAnimalBeat()
    recorder.stop()
    console.log('🛑 Recording stopped')
  }
}

async function instantDownload(cycles = 1) {
  await Tone.start()
  const dest = connectRecorder()

  const chunks = []
  // const mime = recordFormat.value === 'mp3' ? 'audio/mpeg' : 'audio/wav'
  // const rec = new MediaRecorder(dest.stream, { mimeType: mime })
  recordedChunks = []
  let mimeType = 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    mimeType = 'audio/webm;codecs=opus'
  } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
    mimeType = 'audio/ogg;codecs=opus'
  }
  rec = new MediaRecorder(dest.stream, { mimeType })
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  rec.onstop = () => {
    const blob = new Blob(chunks, { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `animal-beat.${recordFormat.value}`
    a.click()
    URL.revokeObjectURL(url)
  }

  rec.start()
  playAnimalBeat()

  // Stop after the beat cycles finish
  const totalMs = timeline.length * 1000 * cycles
  setTimeout(() => {
    stopAnimalBeat()
    rec.stop()
  }, totalMs)
}

// export function createAnimalClones() {
//   Object.entries(animalPositions).forEach(([dropzoneId, animalId]) => {
//     const dz = document.getElementById(dropzoneId)
//     if (!dz) return


    

//     const baseId = animalId.split('-')[0] // "bird"
//     const count = parseInt(animalId.split('-')[1]) || 0

//     const clone = document.createElement('img')
//     clone.id = `${baseId}-${count}`
//     clone.classList.add('draggable', 'animal')
//     // clone.src = `/images/${baseId}.png` // or from your animal data
//     clone.alt = baseId
//     clone.style.position = 'absolute'

//     animals.forEach(element => {
//       if (element.name == baseId){
//         clone.src = element.image
//       }
//     });
    
    
//     dz.appendChild(clone)
//   })
// }

onMounted(async () => {
  // Load project data
  const res = await axios.get(`/api/projects/${projectId.value}`, { withCredentials: true })
  projectData.value = res.data

  if (projectData.value.data) {
    Object.assign(timeline, projectData.value.data.timeline || {})
    Object.assign(animalPositions, projectData.value.data.positions || {})
  }

  // Load animal data
  const animalRes = await axios.get('/api/user-animals', { withCredentials: true })
  animals.value = animalRes.data

  // Load sounds
  await loadAnimalSounds()

  // Wait for DOM to render the dropzones and deck
  await nextTick()

  // Create clones *after everything else*
  await createAnimalClones()

  // Finally enable drag & drop
  enableDragDrop()
})

</script>

<template>
  <!-- <span>{{ animalPositions }}</span> -->
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
    <!-- 🎧 RECORDING BOX -->
    <div class="record-box">
      <h3>🎙️ Recording Studio</h3>

      <div class="format-select">
        <label>
          Format:
          <select v-model="recordFormat">
            <option value="wav">WAV</option>
            <option value="mp3">MP3</option>
          </select>
        </label>
      </div>
      <!-- <div class="format-select">
        <label>
          Filename:
          <input v-model="recordFormat"></input>
        </label>
      </div> -->

      <div class="record-controls">
        <button class="btn record-btn" @click="startRecording" :disabled="isRecording">
          🔴 Start Recording
        </button>
        <button class="btn stop-record-btn" @click="stopRecording" :disabled="!isRecording">
          ⏹️ Stop Recording
        </button>
        <!-- <button class="btn instant-btn" @click="instantDownload(1)">
          ⚡ Instant Download Beat
        </button>
        <button class="btn instant-btn" @click="instantDownload(2)">
          ⏱️ 2 Cycles
        </button> -->
      </div>
    </div>
    <!-- SONG OPTIONS BOX -->
    <div class="options-box">
      <div class="controls">
        <button class="btn play-btn" @click="play">▶ Play</button>
        <button class="btn stop-btn" @click="stop">■ Stop</button>
        <!-- <button class="btn download-btn" @click="downloadBeat" :disabled="isRecording">
          💾 Download
        </button> -->
      </div>

      <div class="options">
        <label>
          🔊 Volume
          <input type="range" min="0" max="1" step="0.05" v-model.number="timeline.volume">
        </label>
        <label>
          🎵 BPM
          <input type="number" min="30" max="300" v-model.number="timeline.bpm">
        </label>
        <label>
          ⏱️ Length (s)
          <input type="number" min="2" max="32767" v-model.number="timeline.length">
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
        <span>{{ animal.name }}</span>
        <img
          :id="animal.name.toLowerCase() + '-0'"
          :src="animal.image"
          :alt="animal.name"
          class="draggable animal"
        >
        
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
  grid-auto-flow: column;
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
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
  position: relative;
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

/* 🎙️ RECORD BOX */
.record-box {
  background: #fde68a;
  border: 3px solid #facc15;
  border-radius: 16px;
  padding: 16px 20px;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.record-box h3 {
  color: #854d0e;
  text-align: center;
  font-weight: bold;
}

.record-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.format-select select {
  margin-left: 6px;
  padding: 4px;
  border-radius: 8px;
  border: 2px solid #facc15;
}

.record-btn {
  background: linear-gradient(135deg, #f87171, #dc2626);
}

.stop-record-btn {
  background: linear-gradient(135deg, #fbbf24, #d97706);
}

.instant-btn {
  background: linear-gradient(135deg, #34d399, #059669);
}

</style>
