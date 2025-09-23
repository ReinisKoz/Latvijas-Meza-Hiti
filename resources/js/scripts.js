import interact from 'interactjs'
import {Howl, Howler} from 'howler';
import * as Tone from 'tone';

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
    console.log("Snap targets updated:", snapTargets);
  }, 150); // debounce delay
});


function splitAnimalId(id) {
  console.log(id);
  const parts = id.split('-'); // split by dash
  if (parts.length === 2) {
    const numberPart = parseInt(parts[1], 10); // convert to integer
    if (isNaN(numberPart)) {
      return null; // invalid number
    }
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

  console.log(animalDeckPositions);

  let i = 0;
  dropzones.forEach((dz) => {

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
        // original.parentNode()

        // console.log('animal-' + splitAnimalId(original.id).letters);
        // document.getElementById(splitAnimalId(original.id).letters + '-card').appendChild(original);
        // original.style.transform = `translate(${0}px, ${0}px)`;
        // const animalRectBefore = original.getBoundingClientRect();
        

        // original.style.position = 'absolute';
        // // console.log(document.getElementById('animal-deck'));
        // // document.getElementById('animal-deck').appendChild(original);
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
        } catch (err) {

          original.style.transform = `translate(${0}px, ${0}px)`;
          console.log('animal-' + splitAnimalId(original.id).letters);
          document.getElementById(splitAnimalId(original.id).letters + '-card').appendChild(original);
          
          const animalRectBefore = original.getBoundingClientRect();
          original.style.position = 'absolute';
          const animalRectAfter = original.getBoundingClientRect();

          const deltaX = animalRectAfter.left - animalRectBefore.left;
          const deltaY = animalRectAfter.top - animalRectBefore.top;
          original.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
          
          const clone = original.cloneNode(true);
          const splitedId = splitAnimalId(original.id);

          console.log(splitedId.number === 0);

          delete animalPositions[Object.keys(animalPositions).find(key => animalPositions[key] === event.target.id)];
          for (var i = 0; i < snapTargets.length; i++) {
            freeSnapTargets[i] = snapTargets[i];
          }
          for (const dz in animalPositions) {
            delete freeSnapTargets[snapTargetIds[dz]];
          }

          if (splitedId.number === 0) {

            

            
            // Position clone exactly over the original
            clone.style.position = 'absolute';
            clone.style.left = original.offsetLeft + 'px';
            clone.style.top = original.offsetTop + 'px';
            clone.style.margin = 0; // remove margins to avoid offsets

            // Mark the clone as draggable
            clone.classList.add('draggable');
            
            console.log(splitedId);
            // console.log(++animalDeckPositions[splitedId.letters])
            clone.id = splitedId.letters + '-0';
            original.id = splitedId.letters + '-' + String(++animalTypes[splitedId.letters]);

            // Add to DOM
            original.parentNode.appendChild(clone);

            // Replace the dragged element with the clone
            // event.interactable.draggable().options.listeners.move(event);
            // event.interactable.draggable().options.listeners.end(event);
            
            // event.target = clone; // redirect dragging to the clone

            

            const interaction = event.interaction;
            interaction.start(
              { name: 'drag' },   // action
              interact(clone), // new target
              clone            // element
            );
            
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
      },
      move(event) {
        var target = event.target

        // Iegūst nomešanas zonas identifikātoru
        isSnappedToSomething = true;
        var dropzoneId;
        try {
          dropzoneId = event.dropzone.id;
        } catch (err) {
          isSnappedToSomething = false;
        }
        const splitedId = splitAnimalId(target.id);
        if (splitedId.number === 0) {
          target = document.getElementById(splitedId.letters + '-' + String(animalTypes[splitedId.letters]));
        }

        // Kustina mērķi līdzi pelei
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        target.style.transform = `translate(${x}px, ${y}px)`
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)

        
      },
      end(event) {
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
            event.relatedTarget.appendChild(animal);
            const animalRectAfter = animal.getBoundingClientRect();

            const deltaX = animalRectAfter.left - animalRectBefore.left;
            const deltaY = animalRectAfter.top - animalRectBefore.top;
            animal.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

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
  'cols': 120,
  'rows': 5,
  'bpm': 60,
  'length': 10,
  'volume': 1.0
};

export function playAnimalBeat() {
    if (!animalPositions || Object.keys(animalPositions).length === 0) return;

    const entries = Object.entries(animalPositions);

    // Resume AudioContext on user gesture
    Tone.start().then(() => {
        console.log("AudioContext resumed");

        // Set BPM
        Tone.Transport.bpm.value = 60;

        // Map animals to players
        // const players = entries.map(([dropzone, animal]) => {
        //     return new Tone.Player(`/sounds/${splitAnimalId(animal).letters + +1}.mp3`).toDestination();
        // });
        const animals = ['bird', 'bear'];
        const players = [];
        animals.forEach((animal) => {
          players.push(new Tone.Player(`/sounds/${animal + +1}.mp3`).toDestination());
        });

        // const players = 

        // Create a simple 4-step beat sequence
        // You can expand this as you like
        // const beatPattern = [
        //     [1, 0, 1, 0], // player 0 (kick)
        //     [0, 1, 0, 1], // player 1 (snare)
        //     [0, 1, 1, 1]  // player 2 (hi-hat)
        // ];

        const beatPattern = Array.from({ length: animals.length }, () => Array(timeline.cols).fill(0));
        console.log(beatPattern);
        Object.keys(animalPositions).forEach(pos => {
          const animal = animalPositions[pos];
          console.log(splitDropZonelId(pos));
          const { letters, row, col } = splitDropZonelId(pos);
          // console.log(col);
          // console.log('efefef0');
          // console.log(animals.indexOf(splitAnimalId(animal).letters));
          // console.log('efefef1');
          beatPattern[animals.indexOf(splitAnimalId(animal).letters)][col] = 1;
        });
        console.log(beatPattern);

        players.forEach((player, i) => {
            if (!beatPattern[i]) return; // skip extra players

            const seq = new Tone.Sequence((time, step) => {
                if (beatPattern[i][step]) player.start(time);
            }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "10n"); // 4 steps = 4 quarter notes

            seq.start(0);
        });

        Tone.Transport.start();
    });
}