import interact from 'interactjs'
import {Howl, Howler} from 'howler';
import axios from "axios";

let snapTargets = []; // make sure this is accessible globally
let dropzones = document.querySelectorAll('.dropzone');

// Async function to recalculate dropzone positions
async function updateSnapTargets() {
  snapTargets = []; // reset old values
  dropzones = document.querySelectorAll('.dropzone');

  dropzones.forEach((dz) => {
    const rect = dz.getBoundingClientRect();
    snapTargets.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  });

  return snapTargets; // useful if you want to await results
}

// Run once on load
updateSnapTargets();

// Run again whenever window resizes (debounced for performance)
let resizeTimeout;
window.addEventListener('resize', async () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
    await updateSnapTargets();
    console.log("Snap targets updated resize:", snapTargets);
  }, 150); // debounce delay
});

window.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.querySelector('.top-container'); // scrollable element
  if (scrollContainer) {
    let scrollTimeout;
    scrollContainer.addEventListener('scroll', async () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(async () => {
        await updateSnapTargets();
        console.log("Snap targets updated scroll:", snapTargets);
      }, 150);
    });
  } else {
    console.warn('Scrollable container not found!');
  }
});

// const scrollBox = document.querySelector('.scroll-box') // make sure this exists in DOM
// if (scrollBox) {
//   scrollBox.addEventListener('scroll', (event) => {
//     console.log('Element scrolled to:', event.target.scrollTop)
//   })
// }


function splitAnimalId(id) {
  console.log('split animaal ID');
  console.log(id);
  const parts = id.split('-'); // split by dash
  if (parts.length === 2) {
    const numberPart = parseInt(parts[1], 10); // convert to integer
    if (isNaN(numberPart)) {
      return null; // invalid number
    }
    console.log({letters: parts[0],
      number: numberPart});
    return {
      letters: parts[0],
      number: numberPart
    };
  } else {
    return null; // invalid format
  }
}

function splitDropZonelId(id) {
  console.log(id);
  const parts = id.split('-'); // split by dash
  if (parts.length === 2) {
    // const rowPart = parseInt(parts[1], 10); // convert to integer
    // if (isNaN(numberPart)) {
    //   return null; // invalid number
    // }
    const numberPart = parseInt(parts[1], 10); // convert to integer
    if (isNaN(numberPart)) {
      return null; // invalid number
    }
    return {
      letters: parts[0],
      row: numberPart % timeline.rows,
      col: Math.floor(numberPart / timeline.rows)
    };
  } else {
    return null; // invalid format
  }
}

export const animalPositions = {}

export function updateAnimalPositions() {

}

export function enableDragDrop() {
  
  // const dropzones = document.querySelectorAll('.dropzone')
  // const snapTargets = []
  const snapTargetIds = {}
  var freeSnapTargets = []
  var animalsInDeck = document.querySelectorAll('.animal')
  var animalTypes = {}
  var animalDeckPositions = {}
  var isSnappedToSomething = true;
  const animalDeck = document.getElementById('animal-deck');

  // Saglabā izejas pozīcijas dzīvniekiem
  animalsInDeck.forEach((animal) => {
    const rect = animal.getBoundingClientRect()
    const animalType = splitAnimalId(animal.id).letters;
    animalTypes[animalType] = 0
    animalDeckPositions[animalType] = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    
    // {
    //   // x: rect.left + rect.width / 2,
    //   // y: rect.top + rect.height / 2 - 400,
    //   lastI: 0
    // }
  })
  console.log('animal positions a')
  console.log(animalDeckPositions);
  console.log(animalTypes);

  let i = 0;
  dropzones.forEach((dz) => {
    console.log(i);
    console.log(snapTargetIds);
    console.log(dz);

    // Saaglabā pzīcijas nomešanas zonām
    const rect = dz.getBoundingClientRect()
    snapTargets.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })

    // Saglabā nomešanas zonu identifikātorus
    snapTargetIds[dz.id] = i;
    i++;
    
  })
  console.log('snapTargetIds');
  console.log(snapTargetIds);
  console.log(dropzones);

  // Izveido dziļo kopiju nomešanas zonām
  freeSnapTargets = structuredClone(snapTargets);

  
  interact('.draggable').draggable({
    // Inicializē nomešanas zonas
    modifiers: [
      interact.modifiers.snap({
        targets: freeSnapTargets,
        range: 100, 
        relativePoints: [{ x: 0.5, y: 0.5 }],
      })
    ],
    listeners: {
      start(event) {
        var dropzoneId;
        const original = event.target;
        original.style.zIndex = 2000;

        // original.parentNode()

        // console.log('animal-' + splitAnimalId(original.id).letters);
        // document.getElementById(splitAnimalId(original.id).letters + '-card').appendChild(original);
        // original.style.transform = `translate(${0}px, ${0}px)`;
        var animalRectBefore = original.getBoundingClientRect();
        
        console.log('pos after start');
        console.log(animalDeckPositions['bird']);
        console.log(animalRectBefore);

        // original.style.position = 'absolute';
        // // console.log(document.getElementById('animal-deck'));
        // // document.body.appendChild(event.target)

        // // // console.log(document.getElementById('animal-deck'));
        // // // // document.getElementById('animal-deck').appendChild(original);
        // const animalRectAfter = original.getBoundingClientRect();

        // const deltaX = animalRectAfter.left - animalRectBefore.left;
        // const deltaY = animalRectAfter.top - animalRectBefore.top;
        // original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
        // if (splitAnimalId(original).number != 0) {
        //   const animalRectAfter = original.getBoundingClientRect();

        //   const deltaX = animalRectAfter.left - animalRectBefore.left;
        //   const deltaY = animalRectAfter.top - animalRectBefore.top;
        //   original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
        // } else {
        //   const animalPos = animalDeckPositions[splitAnimalId(original)];
        //   original.style.transform = `translate(${animalPos.x}px, ${animalPos.y}px)`;
        // }
        

        try {
          dropzoneId = event.relatedTarget.id;
          const drrect = event.relatedTarget.getBoundingClientRect();
          document.body.appendChild(original)

          original.style.transform = `translate(${drrect.x}px, ${drrect.y}px)`;

          console.log(`translate(${drrect.x}px, ${drrect.y}px) original translate from dz`);
        } catch (err) {

          // original.style.transform = `translate(${0}px, ${0}px)`;
          // console.log('animal-' + splitAnimalId(original.id).letters);
          // document.getElementById(splitAnimalId(original.id).letters + '-card').appendChild(original);
          
          // const animalRectBefore = original.getBoundingClientRect();
          // original.style.position = 'absolute';
          // const animalRectAfter = original.getBoundingClientRect();

          // const deltaX = animalRectAfter.left - animalRectBefore.left;
          // const deltaY = animalRectAfter.top - animalRectBefore.top;
          // original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
          
          const clone = original.cloneNode(true);

          // clone.style.zIndex = 1000;
          
          const splitedId = splitAnimalId(original.id);

          console.log(splitedId.number === 0);

          delete animalPositions[Object.keys(animalPositions).find(key => animalPositions[key] === event.target.id)];
          for (var i = 0; i < snapTargets.length; i++) {
            freeSnapTargets[i] = snapTargets[i];
          }
          
          console.log('delete filled dropzones');
          for (const dz in animalPositions) {
            console.log('delete');
            console.log(dz);
            console.log(snapTargetIds[dz]);
            delete freeSnapTargets[snapTargetIds[dz]];
          }
          
          console.log(freeSnapTargets);

          if (splitedId.number === 0) {

            

            
            // Position clone exactly over the original
            // const rect = getBoundingClientRect(original);
            clone.style.position = 'absolute';

            clone.style.transform = `translate(${0}px, ${0}px)`;
            // clone.style.left = original.offsetLeft + 'px';
            // clone.style.top = original.offsetTop + 'px';
            clone.style.margin = 0; // remove margins to avoid offsets

            // Mark the clone as draggable
            clone.classList.add('draggable');
            
            console.log('aanimal types');
            console.log(animalTypes);
            console.log('new id');
            console.log(splitedId);
            console.log(splitAnimalId(original.id));
            // console.log(++animalDeckPositions[splitedId.letters])
            clone.id = splitedId.letters + '-0';
            original.id = splitedId.letters + '-' + String(++animalTypes[splitedId.letters]);

            console.log(splitAnimalId(clone.id));
            console.log(splitAnimalId(original.id));

            // const animalRectBefore = original.getBoundingClientRect();

            clone.classList.add('animal');
            clone.style.zIndex = 1000;
        

            
            // console.log(document.getElementById('animal-deck'));
            // document.getElementById('animal-deck').appendChild(original);
            // const animalRectAfter = original.getBoundingClientRect();

            // const deltaX = animalRectAfter.left - animalRectBefore.left;
            // const deltaY = animalRectAfter.top - animalRectBefore.top;
            // original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

            

            // Add to DOM
            // original.parentNode.appendChild(clone);
            document.getElementById(splitAnimalId(clone.id).letters + '-card').appendChild(clone);
            
            // animalRectBefore = original.getBoundingClientRect();
            document.body.appendChild(original)
            const orgrct = original.getBoundingClientRect();
            const clrect = clone.getBoundingClientRect();

            // original.style.position = 'absolute';

            // console.log(document.getElementById('animal-deck'));
            // // document.getElementById('animal-deck').appendChild(original);
            // var animalRectAfter = original.getBoundingClientRect();

            var deltaX = (orgrct.x - clrect.x);
            var deltaY = (orgrct.y - clrect.y);
            console.log(`translate(${clrect.x}px, ${clrect.y}px)`)
            // original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
            original.style.left = `${clrect.x}px`;
            original.style.top = `${clrect.y}px`;
            console.log(orgrct);
            console.log(clrect);
            console.log(original.getBoundingClientRect());
            // original.style.left = +deltaX + 'px';
            // original.style.top = +deltaY + 'px';

            // console.log('the transforms');
            // console.log(animalRectBefore);
            // console.log(animalRectAfter);
            // console.log(original.style.transform);


            // Replace the dragged element with the clone
            // event.interactable.draggable().options.listeners.move(event);
            // event.interactable.draggable().options.listeners.end(event);
            
            // event.target = clone; // redirect dragging to the clone

            

            // const interaction = event.interaction;
            // interaction.start(
            //   { name: 'drag' },   // action
            //   interact(clone), // new target
            //   clone            // element
            // );
            
            // if (!interaction.interacting()) {
            //   // dynamically pick a target to drag
            //   // const newTarget = document.querySelector('.dynamic-target');
              
              
            // }
          } else {
            
            
          }
          
        }
        // if (dropzoneId in animalPositions) {
        //   // if (animalPositions[dropzoneId] == event.target.id) {
        //   delete animalPositions[dropzoneId];
        //   // }
        // }
        console.log(animalPositions);
        console.log('bear-0');
        console.log(document.getElementById('bear-0'));
        // console.log('bear-1');
        // console.log(document.getElementById('bear-1'));

        console.log('start rect');
        console.log( original.getBoundingClientRect());

        var animalRectAfter = original.getBoundingClientRect();

        // var deltaX = -(animalRectAfter.x - animalRectBefore.x);
        // var deltaY = (animalRectAfter.y - animalRectBefore.y);
        // // original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
        // original.style.left = +deltaX + 'px';
        // original.style.top = +deltaY + 'px';

        console.log('the transforms');
        console.log(animalRectBefore);
        console.log(animalRectAfter);
        console.log(original.style.transform);

        // console.log('start transform1');
      },
      move(event) {
        var target = event.target
        console.log('move transform');
        console.log(target.getBoundingClientRect());

        // Iegūst nomešanas zonas identifikātoru
        // isSnappedToSomething = true;
        // var dropzoneId;
        // try {
        //   dropzoneId = event.dropzone.id;
        // } catch (err) {
        //   isSnappedToSomething = false;
        // }

        // const splitedId = splitAnimalId(target.id);
        // if (splitedId.number === 0) {
        //   target = document.getElementById(splitedId.letters + '-' + String(animalTypes[splitedId.letters]));
        // }

        // Kustina mērķi līdzi pelei
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        target.style.transform = `translate(${x}px, ${y}px)`
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)

        
      },
      end(event) {
        console.log('bear-0');
        console.log(document.getElementById('bear-0'));
        console.log('bear-1');
        console.log(document.getElementById('bear-1'));
        const animal = event.target;
        var dropzoneId;
        try {
          dropzoneId = event.relatedTarget.id;
          console.log(animalPositions[dropzoneId]);
          console.log('dropzoneIdaaa');

          if (animalPositions[dropzoneId] != animal.id) {
            animal.remove();
          } else {
            
            // target.setAttribute('data-x', 0)
            // target.setAttribute('data-y', 0)
            const animalRectBefore = animal.getBoundingClientRect();
            animal.style.transform = `translate(${0}px, ${0}px)`;
            animal.position = 'absolute';
            event.relatedTarget.appendChild(animal);
            const animalRectAfter = animal.getBoundingClientRect();
            animal.style.left = '0px';
            animal.style.top = '0px';

            // const pos = snapTargets[snapTargetIds[dropzoneId]];
            const pos = event.relatedTarget.getBoundingClientRect();
            // animal.style.transform = `translate(${}px, ${pos.y}px)`;
            // animal.style.left = +pos.left + 'px';
            // animal.style.top = +pos.top + 'px';
            // x: rect.left + rect.width / 2,
            // y: rect.top + rect.height / 2,
            animal.style.transform = `translate(${pos.width / 2 - 40}px, ${-pos.height / 2 + 20}px)`;

            console.log('animal reltarget rect');
            console.log(animal.getBoundingClientRect());
            console.log(event.relatedTarget.getBoundingClientRect());

            // const deltaX = animalRectAfter.left - animalRectBefore.left;
            // const deltaY = animalRectAfter.top - animalRectBefore.top;
            // animal.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
            

          }
          // if (dropzoneId === undefined) {
          //   event.target.remove();
          // }
          // Atjauno nomešanas zonas
          // for (var i = 0; i < snapTargets.length; i++) {
          //   freeSnapTargets[i] = snapTargets[i];
          // }
          // for (const dz in animalPositions) {
          //     delete freeSnapTargets[snapTargetIds[dz]];
          //   }
          // Izdzēš aizņemtās pozīcijas
          // if (isSnappedToSomething) {
            
          // }
        } catch (err) {
          // console.log(animal.id);
          // // console.log(animalDeckPositions);
          // const deckPosition = animalDeckPositions[animal.id];
          // // console.log(deckPosition);
          // const x = deckPosition['x'];
          // const y = deckPosition['y'];

          // animal.style.transform = `translate(${x}px, ${y}px)`
          // animal.setAttribute('data-x', x)
          // animal.setAttribute('data-y', y)
          console.log(dropzoneId);
          animal.remove();
          
        }

        

        // if (isSnappedToSomething === false) {
        // }
        
      }
    },
  })
  // Islēdz nomešanas zonas
  interact('.dropzone')
    .dropzone({
      // ondragenter: (event) => {
      //   const animalId = event.relatedTarget.id;
      //   const dropzoneId = event.target.id;

      //   // Izdzēš iepriekšējo dzīvnieka pozīciju
      //   // if (dropzoneId in animalPositions) {
      //   //   if (animalPositions[dropzoneId] == animalId) {
      //   //     delete animalPositions[dropzoneId];
      //   //   }
      //   // }
      // },
      ondrop: (event) => {
        const animalId = event.relatedTarget.id;
        const dropzoneId = event.target.id;

        // Saglabā jauno dzīvnieka pozīciju
        if (animalPositions[dropzoneId] === undefined) {
          animalPositions[dropzoneId] = animalId; 
        }
        
    },
    })
    .on('dropactivate', (event) => {
      // const animal = event.relatedTarget;
      
      event.target.classList.add('drop-activated')

      // if (isSnappedToSomething === false) {
      //   console.log(animal.id);
      //   console.log(animalDeckPositions);
      //   const deckPosition = animalDeckPositions[animal.id];
      //   console.log(deckPosition);
      //   const x = deckPosition['x'];
      //   const y = deckPosition['y'];

      //   animal.style.transform = `translate(${x}px, ${y}px)`
      //   animal.setAttribute('data-x', x)
      //   animal.setAttribute('data-y', y)
      // }
    })
    
}

export const timeline = {
  'cols': 5,
  'rows': 5,
  'bpm': 60,
  'length': 5,
  'volume': 1.0
};

// GLOBALS for sounds
export const animalSounds = {}      // { "bird": [Howl, Howl2], "bear": [Howl] }
const soundCounters = {}           // for round-robin selection per animal
let soundsLoaded = false

/**
 * Normalize an audio path returned from the API into a usable URL.
 * If the API gives 'storage/dzivnieki/audio/xxx.mp3' -> '/storage/dzivnieki/audio/xxx.mp3'
 * If it's already absolute (http://...) we keep it.
 */
function normalizeAudioUrl(url) {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith('/')) return url
  return '/' + url.replace(/^\/+/, '')
}

/**
 * Load animal sounds from API and populate animalSounds map.
 * Returns a Promise that resolves when all Howls have finished loading (best-effort).
 */
export async function loadAnimalSounds(apiPath = '/api/animal') {
  console.log('started loading sounds0')
  try {
    const res = await axios.get(apiPath)
    const list = res.data || []
    const loadPromises = []

    // reset
    for (const k in animalSounds) delete animalSounds[k]
    for (const k in soundCounters) delete soundCounters[k]
    soundsLoaded = false

    console.log('started loading sounds1')

    list.forEach(item => {
      // flexible property names: nosaukums, name, etc.
      const rawName = item.nosaukums ?? item.name ?? item.nosaukums_lv ?? 'unknown'
      const key = String(rawName).toLowerCase().trim().replace(/\s+/g, '-')

      // flexible audio fields: audio, sound, audio_path ...
      const audioField = item.audio ?? item.sound ?? item.audio_path ?? item.audio_url
      if (!audioField) {
        console.warn('Animal entry has no audio field, skipping:', item)
        return
      }

      const audioUrl = normalizeAudioUrl(audioField)

      console.log('Preparing Howl:', key, audioUrl)


      // create Howl and store
      const howl = new Howl({
        src: [audioUrl],
        volume: 1.0,
        html5: true, 
        preload: true
      })
      howl.on('load', () => console.log('✅ Loaded', audioUrl))
      howl.on('loaderror', (id, err) => console.log('❌ Load error', audioUrl, err))

      if (!animalSounds[key]) animalSounds[key] = []
      animalSounds[key].push(howl)
      soundCounters[key] = 0

      // promise that resolves when this howl loads (don't reject whole batch on loaderror)
      loadPromises.push(new Promise(resolve => {
        howl.once('load', () => resolve({ key, url: audioUrl, success: true }))
        howl.once('loaderror', (id, err) => {
          console.error('Howl loaderror', audioUrl, err)
          resolve({ key, url: audioUrl, success: false })
        })
      }))
      console.log('started loading sounds2')
    })
    console.log('started loading sounds3')
    // wait for all available howls to finish loading (best-effort)
    await Promise.all(loadPromises)
    console.log('started loading sounds4')
    soundsLoaded = true
    console.log('Animal sounds loaded:', Object.keys(animalSounds))
    return { success: true, count: Object.keys(animalSounds).length }
  } catch (err) {
    console.error('Failed to load animal sounds from API', err)
    return { success: false, error: err }
  }
}

/**
 * Return a single Howl instance for a given type key.
 * If multiple variations exist, choose in round-robin fashion.
 */
function getHowlFor(typeKey) {
  const arr = animalSounds[typeKey]
  if (!arr || arr.length === 0) return null
  if (arr.length === 1) return arr[0]
  const idx = soundCounters[typeKey] % arr.length
  soundCounters[typeKey] = idx + 1
  return arr[idx]
}

// --------------------------------------------------------------------
// PLAY / STOP logic updated to use animalSounds safely
// --------------------------------------------------------------------

let intervalId = null

export function stopAnimalBeat() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    console.log('Beat stopped')
  }
}

export function playAnimalBeat() {
  stopAnimalBeat() // prevent duplicates

  if (!soundsLoaded) {
    console.log(soundsLoaded)
    console.warn('Sounds not loaded yet — call loadAnimalSounds() first or wait for it to finish.')
    return
  }

  if (!animalPositions || Object.keys(animalPositions).length === 0) {
    console.warn('No animals placed — nothing to play.')
    return
  }

  const animals = Object.keys(animalSounds)
  if (animals.length === 0) {
    console.warn('No loaded animal sounds available.')
    return
  }

  // Build beatPattern based on available animals
  const beatPattern = Array.from({ length: animals.length }, () => Array(timeline.cols).fill(0))
  console.log(beatPattern);

  Object.keys(animalPositions).forEach(pos => {
    const animalId = animalPositions[pos]                 // e.g. "bird-3"
    const { row, col } = splitDropZonelId(pos)
    const type = splitAnimalId(animalId)?.letters
    if (!type) return
    const key = String(type).toLowerCase()               // should match keys in animalSounds
    const idx = animals.indexOf(key)
    if (idx >= 0 && col >= 0 && col < timeline.cols) {
      beatPattern[idx][col] = 1
    }
  })

  console.log(beatPattern);

  // nothing to play?
  const hasNote = beatPattern.some(r => r.some(cell => cell === 1))
  if (!hasNote) {
    console.warn('Beat pattern empty — nothing to play.')
    return
  }

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
        } else {
          console.warn('No howl for', typeKey)
        }
      }
    })

    step = (step + 1) % totalSteps
  }, msPerBeat)

  console.log('Playback started — msPerBeat:', msPerBeat, 'steps:', totalSteps)
}

// Kick off sound loading at module init (optional). You can remove this and call loadAnimalSounds() from Vue instead.
loadAnimalSounds().catch(() => { /* ignored */ console.log('err loading sounds') })

// ... rest of your file continues unchanged (enableDragDrop, timeline export, etc.)