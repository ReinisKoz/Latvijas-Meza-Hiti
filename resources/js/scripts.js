import interact from 'interactjs'
import {Howl, Howler} from 'howler';
import * as Tone from 'tone';

function splitId(id) {
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

export const animalPositions = {}

export function enableDragDrop() {
  
  const dropzones = document.querySelectorAll('.dropzone')
  const snapTargets = []
  const snapTargetIds = {}
  var freeSnapTargets = []
  var animalsInDeck = document.querySelectorAll('.animal')
  var animalDeckPositions = {}
  var isSnappedToSomething = true;

  // Saglabā izejas pozīcijas dzīvniekiem
  animalsInDeck.forEach((animal) => {
    const rect = animal.getBoundingClientRect()
    animalDeckPositions[splitId(animal.id).letters] = 0
    // {
    //   // x: rect.left + rect.width / 2,
    //   // y: rect.top + rect.height / 2 - 400,
    //   lastI: 0
    // }
  })

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
        range: 61, 
        relativePoints: [{ x: 0.5, y: 0.5 }],
      })
    ],
    listeners: {
      start(event) {
        var dropzoneId;
        try {
          dropzoneId = event.relatedTarget.id;
        } catch (err) {
          const original = event.target;
          const clone = original.cloneNode(true);
          const splitedId = splitId(original.id);

          console.log(splitedId.number === 0);

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
            clone.id = splitedId.letters + '-' + String(++animalDeckPositions[splitedId.letters]);

            // Add to DOM
            original.parentNode.appendChild(clone);

            // Replace the dragged element with the clone
            // event.interactable.draggable().options.listeners.move(event);
            // event.interactable.draggable().options.listeners.end(event);
            
            // event.target = clone; // redirect dragging to the clone
            const interaction = event.interaction;

            if (!interaction.interacting()) {
              // dynamically pick a target to drag
              // const newTarget = document.querySelector('.dynamic-target');
              
              interaction.start(
                { name: 'drag' },   // action
                interact(clone), // new target
                clone            // element
              );
            }
          } else {
            
            delete animalPositions[Object.keys(animalPositions).find(key => animalPositions[key] === event.target.id)];
            for (var i = 0; i < snapTargets.length; i++) {
              freeSnapTargets[i] = snapTargets[i];
            }
            for (const dz in animalPositions) {
              delete freeSnapTargets[snapTargetIds[dz]];
            }
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
        const splitedId = splitId(target.id);
        if (splitedId.number === 0) {
          target = document.getElementById(splitedId.letters + '-' + String(animalDeckPositions[splitedId.letters]));
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
      ondragenter: (event) => {
        const animalId = event.relatedTarget.id;
        const dropzoneId = event.target.id;

        // Izdzēš iepriekšējo dzīvnieka pozīciju
        // if (dropzoneId in animalPositions) {
        //   if (animalPositions[dropzoneId] == animalId) {
        //     delete animalPositions[dropzoneId];
        //   }
        // }
      },
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
export function playAnimalBeat() {
    if (!animalPositions || Object.keys(animalPositions).length === 0) return;

    const entries = Object.entries(animalPositions);

    // Resume AudioContext on user gesture
    Tone.start().then(() => {
        console.log("AudioContext resumed");

        // Set BPM
        Tone.Transport.bpm.value = 90;

        // Map animals to players
        const players = entries.map(([dropzone, animal]) => {
            return new Tone.Player(`/sounds/${animal}.mp3`).toDestination();
        });

        // Create a simple 4-step beat sequence
        // You can expand this as you like
        const beatPattern = [
            [1, 0, 1, 0], // player 0 (kick)
            [0, 1, 0, 1], // player 1 (snare)
            [0, 1, 1, 1]  // player 2 (hi-hat)
        ];

        players.forEach((player, i) => {
            if (!beatPattern[i]) return; // skip extra players

            const seq = new Tone.Sequence((time, step) => {
                if (beatPattern[i][step]) player.start(time);
            }, [0, 1, 2, 3], "4n"); // 4 steps = 4 quarter notes

            seq.start(0);
        });

        Tone.Transport.start();
    });
}