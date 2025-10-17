// scripts.js
import interact from 'interactjs'
import { Howl } from 'howler'
// import * as Tone from 'tone'
import axios from 'axios'

// --------------------------------------------------------------------
// Global state
// --------------------------------------------------------------------
let snapTargets = []                 // Dropzone snap positions
let dropzones = []                   // Cached dropzones

export const animalPositions = {}    // Maps dropzone -> animal id

export const timeline = {
  cols: 10,
  rows: 5,
  bpm: 60,
  length: 10,
  volume: 1.0
}

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

function normalizeAudioUrl(url) {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^\/+/, '')
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

function detachListeners() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  const scrollContainer = document.querySelector('.top-container')
  if (scrollContainer && scrollHandler) {
    scrollContainer.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
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
          clone.style.position = 'absolute'
          clone.style.transform = `translate(0px, 0px)`
          clone.style.margin = 0
          clone.classList.add('draggable', 'animal')
          clone.id = splitedId.letters + '-0'
          original.id = splitedId.letters + '-' + String(++animalTypes[splitedId.letters])
          document.getElementById(splitedId.letters + '-card').appendChild(clone)

          const rect = original.getBoundingClientRect()
          document.body.appendChild(original)
          original.style.position = 'absolute'
          original.style.left = rect.left + 'px'
          original.style.top = rect.top + 'px'
          original.setAttribute('data-x', 0)
          original.setAttribute('data-y', 0)
          original.style.transform = 'translate(0px, 0px)'
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
export async function loadAnimalSounds(apiPath = '/api/animal') {
  try {
    const res = await axios.get(apiPath)
    const list = res.data || []
    const loadPromises = []

    for (const k in animalSounds) delete animalSounds[k]
    for (const k in soundCounters) delete soundCounters[k]
    soundsLoaded = false

    list.forEach(item => {
      const rawName = item.nosaukums ?? item.name ?? item.nosaukums_lv ?? 'unknown'
      const key = String(rawName).toLowerCase().trim().replace(/\s+/g, '-')
      const audioField = item.audio ?? item.sound ?? item.audio_path ?? item.audio_url
      if (!audioField) return
      const audioUrl = normalizeAudioUrl(audioField)

      const howl = new Howl({
        src: [audioUrl],
        volume: 1.0,
        html5: true,
        preload: true
      })

      if (!animalSounds[key]) animalSounds[key] = []
      animalSounds[key].push(howl)
      soundCounters[key] = 0

      loadPromises.push(new Promise(resolve => {
        howl.once('load', () => resolve({ key, url: audioUrl, success: true }))
        howl.once('loaderror', () => resolve({ key, url: audioUrl, success: false }))
      }))
    })

    await Promise.all(loadPromises)
    soundsLoaded = true
    return { success: true, count: Object.keys(animalSounds).length }
  } catch (err) {
    return { success: false, error: err }
  }
}

function getHowlFor(typeKey) {
  const arr = animalSounds[typeKey]
  if (!arr || arr.length === 0) return null
  if (arr.length === 1) return arr[0]
  const idx = soundCounters[typeKey] % arr.length
  soundCounters[typeKey] = idx + 1
  return arr[idx]
}

// --------------------------------------------------------------------
// Beat loop
// --------------------------------------------------------------------
let intervalId = null

export function stopAnimalBeat() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function playAnimalBeat() {
  stopAnimalBeat()
  if (!soundsLoaded) return
  if (!animalPositions || Object.keys(animalPositions).length === 0) return

  const animals = Object.keys(animalSounds)
  if (animals.length === 0) return

  const beatPattern = Array.from({ length: animals.length }, () => Array(timeline.cols).fill(0))

  Object.keys(animalPositions).forEach(pos => {
    const animalId = animalPositions[pos]
    const { row, col } = splitDropZonelId(pos)
    const type = splitAnimalId(animalId)?.letters
    if (!type) return
    const key = String(type).toLowerCase()
    const idx = animals.indexOf(key)
    if (idx >= 0 && col >= 0 && col < timeline.cols) {
      beatPattern[idx][col] = 1
    }
  })

  const hasNote = beatPattern.some(r => r.some(cell => cell === 1))
  if (!hasNote) return

  let step = 0
  const msPerBeat = (60 / timeline.bpm) * 1000
  const totalSteps = Math.max(1, timeline.cols)

  intervalId = setInterval(() => {
    beatPattern.forEach((row, i) => {
      if (row[step]) {
        const typeKey = animals[i]
        const howl = getHowlFor(typeKey)
        if (howl) {
          howl.volume(timeline.volume ?? 1.0)
          howl.play()
        }
      }
    })
    step = (step + 1) % totalSteps
  }, msPerBeat)
}

// --------------------------------------------------------------------
// HMR cleanup
// --------------------------------------------------------------------
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window._animalDragInitialized = false
    detachListeners()
  })
}
