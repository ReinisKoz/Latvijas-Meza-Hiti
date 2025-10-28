// scripts.js
import interact from 'interactjs'
import { Howl } from 'howler'
import * as Tone from 'tone'
import axios from 'axios'
import { reactive, ref } from 'vue'

// --------------------------------------------------------------------
// Global state
// --------------------------------------------------------------------
let snapTargets = []                 // Dropzone snap positions
let dropzones = []                   // Cached dropzones

export const animalPositions = reactive({})    // Maps dropzone -> animal id

export const timeline = reactive({
  cols: 10,
  rows: 5,
  bpm: 60,
  length: 10,
  volume: 1.0
})

export const animalSounds = {}
const soundCounters = {}
let soundsLoaded = false

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------
function splitAnimalId(id) {
  const parts = id.split('-')
  if (parts.length === 2) {
    const numberPart = parseInt(parts[1], 10)
    if (isNaN(numberPart)) return null
    return { letters: parts[0], number: numberPart }
  }
  return null
}

function splitDropZonelId(id) {
  const parts = id.split('-')
  if (parts.length === 2) {
    const numberPart = parseInt(parts[1], 10)
    if (isNaN(numberPart)) return null
    return {
      letters: parts[0],
      row: numberPart % timeline.rows,
      col: Math.floor(numberPart / timeline.rows)
    }
  }
  return null
}


// --------------------------------------------------------------------
// Snap / dropzones
// --------------------------------------------------------------------
export async function updateSnapTargets() {
  snapTargets = []
  dropzones = document.querySelectorAll('.dropzone')

  dropzones.forEach((dz) => {
    const rect = dz.getBoundingClientRect()
    snapTargets.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  })
  return snapTargets
}

// --------------------------------------------------------------------
// Rebuild state from DOM
// --------------------------------------------------------------------
function rebuildAnimalPositions() {
  Object.keys(animalPositions).forEach(k => delete animalPositions[k])
  document.querySelectorAll('.dropzone .animal').forEach(animal => {
    const dz = animal.closest('.dropzone')
    if (dz) {
      animalPositions[dz.id] = animal.id
    }
  })
}

// --------------------------------------------------------------------
// Listeners
// --------------------------------------------------------------------
let resizeHandler = null
let scrollHandler = null

async function attachListeners() {
  // resize
  resizeHandler = () => {
    clearTimeout(window._resizeTimeout)
    window._resizeTimeout = setTimeout(updateSnapTargets, 150)
  }
  window.addEventListener('resize', resizeHandler)

  // scroll
  const scrollContainer = document.querySelector('.top-container')
  if (scrollContainer) {
    scrollHandler = () => {
      clearTimeout(window._scrollTimeout)
      window._scrollTimeout = setTimeout(updateSnapTargets, 150)
    }
    scrollContainer.addEventListener('scroll', scrollHandler)
  }
}

export async function createAnimalClones() {
  const animalImages = {}
  const res = await axios.get('/api/user-animals', { withCredentials: true })
  // animals.value = res.data
  console.log(res.data)
  res.data.forEach(element => {
      animalImages[element.name.toLowerCase()] = element.image;
    });
  console.log(animalImages)
  Object.entries(animalPositions).forEach(([dropzoneId, animalId]) => {
    const dz = document.getElementById(dropzoneId)
    if (!dz) return

    const baseId = animalId.split('-')[0] // "bird"
    const count = parseInt(animalId.split('-')[1]) || 0

    const clone = document.createElement('img')
    clone.id = `${baseId}-${count}`
    clone.classList.add('draggable', 'animal')
    // clone.src = `/images/${baseId}.png` // or from your animal data
    clone.src = animalImages[baseId]
    clone.alt = baseId
    clone.style.position = 'absolute'

    Object.assign(clone.style, {
      position: "relative",
      width: "80px",
      height: "80px",
      objectFit: "contain",
      cursor: "grab",
      userSelect: "none",
      zIndex: "5",
      willChange: "transform",
      margin: "0px"
    })
    dz.appendChild(clone)
  })
}

// --------------------------------------------------------------------
// Drag & Drop
// --------------------------------------------------------------------
export async function enableDragDrop() {
  if (window._animalDragInitialized) return
  window._animalDragInitialized = true

  await updateSnapTargets()
  rebuildAnimalPositions()
  await attachListeners()

  const snapTargetIds = {}
  let freeSnapTargets = []
  const animalsInDeck = document.querySelectorAll('.animal')
  const animalTypes = {}

  animalsInDeck.forEach((animal) => {
    const type = splitAnimalId(animal.id).letters
    animalTypes[type] = 0
  })

  let i = 0
  dropzones.forEach((dz) => {
    snapTargetIds[dz.id] = i++
  })
  freeSnapTargets = structuredClone(snapTargets)

  interact('.draggable').draggable({
    modifiers: [
      interact.modifiers.snap({
        targets: freeSnapTargets,
        range: 100,
        relativePoints: [{ x: 0.5, y: 0.5 }],
      })
    ],
    listeners: {
      start(event) {
        const original = event.target
        original.style.zIndex = 2000

        const clone = original.cloneNode(true)
        const splitedId = splitAnimalId(original.id)

        // free targets again
        delete animalPositions[
          Object.keys(animalPositions).find(key => animalPositions[key] === original.id)
        ]
        for (let i = 0; i < snapTargets.length; i++) {
          freeSnapTargets[i] = snapTargets[i]
        }
        for (const dz in animalPositions) {
          delete freeSnapTargets[snapTargetIds[dz]]
        }

        if (splitedId.number === 0) {
          clone.style.position = 'relative'
          clone.style.margin = 0
          clone.classList.add('draggable', 'animal')
          clone.id = splitedId.letters + '-0'
          original.id = splitedId.letters + '-' + String(++animalTypes[splitedId.letters])
          

          const rect = original.getBoundingClientRect()
          document.body.appendChild(original)
          original.style.position = 'absolute'
          original.style.left = rect.left + 'px'
          original.style.top = rect.top + 'px'
          original.setAttribute('data-x', 0)
          original.setAttribute('data-y', 0)
          original.style.transform = 'translate(0px, 0px)'
          document.getElementById(splitedId.letters + '-card').appendChild(clone)
        }
      },
      move(event) {
        const target = event.target
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
        target.style.transform = `translate(${x}px, ${y}px)`
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
      },
      end(event) {
        const animal = event.target
        try {
          const dropzoneEl = event.relatedTarget
          if (!dropzoneEl) throw new Error("No dropzone")

          const dropzoneId = dropzoneEl.id
          if (animalPositions[dropzoneId] && animalPositions[dropzoneId] !== animal.id) {
            animal.remove()
            return
          }

          const rect = dropzoneEl.getBoundingClientRect()
          dropzoneEl.appendChild(animal)
          animal.style.position = "absolute"

          const centerX = rect.width / 2 - animal.offsetWidth / 2
          const centerY = rect.height / 2 - animal.offsetHeight / 2
          animal.style.left = centerX + "px"
          animal.style.top = centerY + "px"

          animal.style.transform = "translate(0px, 0px)"
          animal.setAttribute("data-x", 0)
          animal.setAttribute("data-y", 0)

          animalPositions[dropzoneId] = animal.id
        } catch {
          animal.remove()
        }
      }
    }
  })

  interact('.dropzone')
    .dropzone({
      ondrop: (event) => {
        const animalId = event.relatedTarget.id
        const dropzoneId = event.target.id
        if (animalPositions[dropzoneId] === undefined) {
          animalPositions[dropzoneId] = animalId
        }
      },
    })
    .on('dropactivate', (event) => {
      event.target.classList.add('drop-activated')
    })
}

// --------------------------------------------------------------------
// Sound loading
// --------------------------------------------------------------------
export const animalPlayers = {}
const playerIndices = {}

export async function loadAnimalSounds(apiPath = '/api/animal') {
  const res = await axios.get(apiPath)
  const list = res.data || []

  for (const item of list) {
    const name = (item.nosaukums || item.name || 'unknown').toLowerCase()
    const audioUrl = item.audio || item.sound || item.audio_url

    // preload 4 polyphonic players
    animalPlayers[name] = Array.from({ length: 4 }, () =>
      new Tone.Player(audioUrl).toDestination()
    )
    playerIndices[name] = 0
  }

  console.log('✅ Loaded', Object.keys(animalPlayers).length, 'animal sounds')
}

// --------------------------------------------------------------------
// Beat loop
// --------------------------------------------------------------------
let toneLoop = null

export function stopAnimalBeat() {
  if (toneLoop) {
    toneLoop.stop()
    toneLoop = null
  }
  Tone.Transport.stop()
}

const isRecording = ref(false)
let recorder = null
let recordedChunks = []


export async function playAnimalBeat() {
  stopAnimalBeat()
  if (Object.keys(animalPlayers).length === 0) return

  const beatPattern = Array.from({ length: Object.keys(animalPlayers).length }, () =>
    Array(timeline.cols).fill(0)
  )

  Object.keys(animalPositions).forEach(pos => {
    const animalId = animalPositions[pos]
    const { row, col } = splitDropZonelId(pos)
    const type = splitAnimalId(animalId)?.letters
    const key = type.toLowerCase()
    const idx = Object.keys(animalPlayers).indexOf(key)
    if (idx >= 0 && col < timeline.cols) beatPattern[idx][col] = 1
  })

  const animals = Object.keys(animalPlayers)
  const stepLength = 60 / timeline.bpm

  await Tone.start()
  Tone.Transport.bpm.value = timeline.bpm

  let step = 0
  toneLoop = new Tone.Loop((time) => {
    animals.forEach((key, i) => {
      if (beatPattern[i][step]) {
        const pool = animalPlayers[key]
        const idx = playerIndices[key]
        const player = pool[idx]

        if (player && player.buffer.loaded) {
          player.start(time)
          player.volume.value = Tone.gainToDb(timeline.volume)
        }

        playerIndices[key] = (idx + 1) % pool.length
      }
    })
    step = (step + 1) % timeline.cols
  }, stepLength).start(0)

  Tone.Transport.start()
}

