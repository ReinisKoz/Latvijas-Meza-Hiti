import interact from 'interactjs'
import {Howl, Howler} from 'howler';
import * as Tone from 'tone';


export const animalPositions = {}

export function enableDragDrop() {
  
  const dropzones = document.querySelectorAll('.dropzone')
  const snapTargets = []

  dropzones.forEach((dz) => {
    const rect = dz.getBoundingClientRect()
    snapTargets.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  })

  
  interact('.draggable').draggable({
    modifiers: [
      interact.modifiers.snap({
        targets: snapTargets,
        range: 100, 
        relativePoints: [{ x: 0.5, y: 0.5 }]
      })
    ],
    listeners: {
      move(event) {
        const target = event.target
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        target.style.transform = `translate(${x}px, ${y}px)`
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
      }
    }
  })

  // Enable dropzones
  interact('.dropzone')
    .dropzone({
      ondrop: (event) => {
        const animalId = event.relatedTarget.id;
        const dropzoneId = event.target.id;

        // Remove previous positions for this animal
        for (const dz in animalPositions) {
            if (animalPositions[dz] === animalId) {
                delete animalPositions[dz];
            }
        }

        // Save new position
        animalPositions[dropzoneId] = animalId;
    }
    })
    .on('dropactivate', (event) => {
      event.target.classList.add('drop-activated')
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