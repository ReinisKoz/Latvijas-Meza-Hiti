import interact from 'interactjs'

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
        const animalId = event.relatedTarget.id
        const dropzoneId = event.target.id

        // save globally
        animalPositions[dropzoneId] = animalId
      }
    })
    .on('dropactivate', (event) => {
      event.target.classList.add('drop-activated')
    })
}
export function printLocations(){
  console.log(animalPositions)
}