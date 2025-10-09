import interact from 'interactjs'
import { Howl } from 'howler';
import axios from "axios";

let snapTargets = []                 // Glabā visu aktīvo nomešanas zonu (dropzone) koordinātas, lai dzīvnieki varētu pievilkties pareizajai vietai
let dropzones = document.querySelectorAll('.dropzone')

// --------------------------------------------------------------------
// Funkcija, kas aprēķina un atjauno visu dropzone (nomešanas zonu)
// koordinātas. To izmanto, lai pareizi snapotu (pievilktu) dzīvniekus,
// neatkarīgi no loga izmēra, scrolla vai satura izmaiņām.
// --------------------------------------------------------------------
async function updateSnapTargets() {
  snapTargets = []
  dropzones = document.querySelectorAll('.dropzone')

  dropzones.forEach((dz) => {
    const rect = dz.getBoundingClientRect()
    snapTargets.push({
      x: rect.left + rect.width / 2,   // X koordināta zonas centrā
      y: rect.top + rect.height / 2,   // Y koordināta zonas centrā
    })
  })
  return snapTargets
}

// Inicializē dropzonu koordinātas uzreiz pēc lapas ielādes
updateSnapTargets()

// Kad maina loga izmēru, koordinātas ir jāpārrēķina.
// Tiek izmantots "debounce" (aizture), lai izvairītos no pārlieku biežas pārrēķināšanas.
let resizeTimeout
window.addEventListener('resize', async () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(async () => {
    await updateSnapTargets()
  }, 150)
})

// Tāpat atjaunina koordinātas, ja scrollē galveno konteineru (piemēram, timeline skatā).
window.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.querySelector('.top-container')
  if (scrollContainer) {
    let scrollTimeout
    scrollContainer.addEventListener('scroll', async () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(async () => {
        await updateSnapTargets()
      }, 150)
    })
  }
})

// --------------------------------------------------------------------
// Palīgfunkcijas ID sadalīšanai
// --------------------------------------------------------------------

// Dzīvnieku ID piemēram "bear-2" tiek sadalīts:
//   -> letters = "bear"
//   -> number = 2
// Tas ļauj atšķirt dzīvnieka tipu un tā kopijas kārtas numuru.
function splitAnimalId(id) {
  const parts = id.split('-')
  if (parts.length === 2) {
    const numberPart = parseInt(parts[1], 10)
    if (isNaN(numberPart)) return null
    return { letters: parts[0], number: numberPart }
  }
  return null
}

// Dropzonas ID piemēram "dropzone-6" tiek pārveidots rindas/kolonnas koordinātās.
//   -> row = dropzonas rinda timeline režģī
//   -> col = dropzonas kolonna timeline režģī
// Tas tiek izmantots, lai precīzi būvētu ritma matricu (beatPattern).
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
// Globāli stāvokļi un konfigurācija
// --------------------------------------------------------------------
export const animalPositions = {}    // Mapē saglabā, kurš dzīvnieks atrodas kurā dropzonā: { "dropzone-5": "bear-1", ... }

export const timeline = {
  cols: 5,       // Kolonnu skaits ritma matricā
  rows: 5,       // Rindu skaits ritma matricā (cik dažādi dzīvnieku slāņi var būt vienā reizē)
  bpm: 60,       // Beats per minute (ātrums)
  length: 5,     // Kopējais soļu skaits (ritma garums)
  volume: 1.0    // Skaļuma līmenis (no 0 līdz 1)
}

// --------------------------------------------------------------------
// Drag & drop funkcionalitāte
// --------------------------------------------------------------------
export function enableDragDrop() {
  const snapTargetIds = {}           // Karte starp dropzonu ID un to indeksu snapTargets masīvā
  var freeSnapTargets = []           // Aktīvie snap punkti, kas vēl nav aizņemti
  var animalsInDeck = document.querySelectorAll('.animal')
  var animalTypes = {}               // Skaita katra tipa dzīvniekus (lai var ģenerēt jaunas kopijas)
  var animalDeckPositions = {}       // Saglabā katra dzīvnieka sākotnējo pozīciju "deckā"

  // Inicializē sākuma datus visiem dzīvniekiem "deckā"
  animalsInDeck.forEach((animal) => {
    const rect = animal.getBoundingClientRect()
    const animalType = splitAnimalId(animal.id).letters
    animalTypes[animalType] = 0
    animalDeckPositions[animalType] = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  })

  // Saglabā dropzonu koordinātas un indeksus
  let i = 0
  dropzones.forEach((dz) => {
    const rect = dz.getBoundingClientRect()
    snapTargets.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    snapTargetIds[dz.id] = i
    i++
  })

  freeSnapTargets = structuredClone(snapTargets)

  // Aktivizē dzīvnieku pārvilkšanu ar interact.js
  interact('.draggable').draggable({
    modifiers: [
      interact.modifiers.snap({
        targets: freeSnapTargets,              // snap punkti ir dropzonu centri
        range: 100,                            // snap tuvuma rādiuss pikseļos
        relativePoints: [{ x: 0.5, y: 0.5 }],  // snap notiek pēc objekta centra
      })
    ],
    listeners: {
      // Notiek, kad lietotājs sāk vilkt dzīvnieku
      start(event) {
      const original = event.target
      original.style.zIndex = 2000

      const clone = original.cloneNode(true)
      const splitedId = splitAnimalId(original.id)

      // Free snap targets again
      delete animalPositions[Object.keys(animalPositions).find(key => animalPositions[key] === original.id)]
      for (let i = 0; i < snapTargets.length; i++) {
        freeSnapTargets[i] = snapTargets[i]
      }
      for (const dz in animalPositions) {
        delete freeSnapTargets[snapTargetIds[dz]]
      }

      // 🟢 Only handle reparenting for first (deck) instance
      if (splitedId.number === 0) {
        // Put back a fresh copy into the deck
        clone.style.position = 'absolute'
        clone.style.transform = `translate(0px, 0px)`
        clone.style.margin = 0
        clone.classList.add('draggable', 'animal')
        clone.id = splitedId.letters + '-0'
        original.id = splitedId.letters + '-' + String(++animalTypes[splitedId.letters])
        document.getElementById(splitedId.letters + '-card').appendChild(clone)

        // 🟢 FIX: preserve screen position when moving original into <body>
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
      // Notiek, kamēr lietotājs velk dzīvnieku
      move(event) {
        var target = event.target
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
        target.style.transform = `translate(${x}px, ${y}px)`
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
      },
      // Notiek, kad lietotājs atlaiž dzīvnieku (vilkšana beidzas)
      end(event) {
      const animal = event.target
      try {
        const dropzoneEl = event.relatedTarget
        if (!dropzoneEl) throw new Error("No dropzone")

        const dropzoneId = dropzoneEl.id

        if (animalPositions[dropzoneId] && animalPositions[dropzoneId] !== animal.id) {
          // Already occupied → remove the dragged animal
          animal.remove()
          return
        }

        // ✅ Snapshot before reparenting
        const rect = dropzoneEl.getBoundingClientRect()

        // Move into dropzone
        dropzoneEl.appendChild(animal)
        animal.style.position = "absolute"

        // ✅ Reset positioning relative to new parent
        const centerX = rect.width / 2 - animal.offsetWidth / 2
        const centerY = rect.height / 2 - animal.offsetHeight / 2
        animal.style.left = centerX + "px"
        animal.style.top = centerY + "px"

        // Reset transforms/offsets
        animal.style.transform = "translate(0px, 0px)"
        animal.setAttribute("data-x", 0)
        animal.setAttribute("data-y", 0)

        // Register position
        animalPositions[dropzoneId] = animal.id
      } catch (err) {
        // If invalid drop → remove
        animal.remove()
      }
    }

    },
  })

  // Aktivizē dropzonas — tās pieņem dzīvniekus, kas tiek nomesti virsū
  interact('.dropzone')
    .dropzone({
      ondrop: (event) => {
        const animalId = event.relatedTarget.id
        const dropzoneId = event.target.id
        // Ja šajā dropzonā vēl nav dzīvnieka, saglabā pozīciju
        if (animalPositions[dropzoneId] === undefined) {
          animalPositions[dropzoneId] = animalId
        }
      },
    })
    .on('dropactivate', (event) => {
      // Vizualizācija — dropzona kļūst aktīva, kad to var izmantot
      event.target.classList.add('drop-activated')
    })
}

// --------------------------------------------------------------------
// Skaņu sistēma
// --------------------------------------------------------------------
export const animalSounds = {}      // Glabā visas dzīvnieku skaņas kā Howl objektus: { "bird": [Howl1, Howl2], "bear": [Howl] }
const soundCounters = {}            // Saglabā, kuru no vairākām skaņām jāatskaņo nākamo (round-robin princips)
let soundsLoaded = false            // Vai skaņas ir ielādētas

// Normalizē audio ceļu, lai būtu derīgs URL
// - Ja ceļš jau ir absolūts (http:// vai https://), atstāj kā ir
// - Ja tas ir relatīvs, pievieno sākumā "/"
function normalizeAudioUrl(url) {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^\/+/, '')
}

// Ielādē dzīvnieku skaņas no API
// - Izveido Howl objektus katrai skaņai
// - Pievieno tos animalSounds mapē
// - Atzīmē, kad viss ielādēts
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

// Iegūst atbilstošo Howl objektu dzīvnieka tipam
// Ja vienam dzīvniekam ir vairākas skaņas, izvēlas nākamo secībā (round-robin)
function getHowlFor(typeKey) {
  const arr = animalSounds[typeKey]
  if (!arr || arr.length === 0) return null
  if (arr.length === 1) return arr[0]
  const idx = soundCounters[typeKey] % arr.length
  soundCounters[typeKey] = idx + 1
  return arr[idx]
}

// --------------------------------------------------------------------
// Beat atskaņošana
// --------------------------------------------------------------------
let intervalId = null

// Aptur ritma ciklu
export function stopAnimalBeat() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Atskaņo ritmu balstoties uz dzīvnieku izvietojumu dropzonās
export function playAnimalBeat() {
  stopAnimalBeat()  // Pārliecinās, ka netiek atskaņoti vairāki cikli vienlaikus

  if (!soundsLoaded) return
  if (!animalPositions || Object.keys(animalPositions).length === 0) return

  const animals = Object.keys(animalSounds)
  if (animals.length === 0) return

  // Izveido ritma matricu: [dzīvnieks][kolonna] = 1 ja jāatskaņo, 0 ja klusums
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

  // Regulāri atskaņo skaņas, ejot pa beatPattern matricu
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

// Automātiski mēģina ielādēt skaņas pie moduļa ielādes
loadAnimalSounds().catch(() => { })
