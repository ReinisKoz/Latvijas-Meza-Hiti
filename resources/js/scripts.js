import interact from 'interactjs'

export function enableDragDrop() {
  // Collect all drop zones and get their center positions
  const dropzones = document.querySelectorAll('.dropzone')
  const snapTargets = []

  dropzones.forEach((dz) => {
    const rect = dz.getBoundingClientRect()
    snapTargets.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  })

  // Make draggables snap to those positions
  interact('.draggable').draggable({
    modifiers: [
      interact.modifiers.snap({
        targets: snapTargets,
        range: 100,           // optional: max snap distance
        relativePoints: [{ x: 0.5, y: 0.5 }] // snap to the center of the draggable
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
        console.log(event.relatedTarget.id + ' was dropped into ' + event.target.id)
      }
    })
    .on('dropactivate', (event) => {
      event.target.classList.add('drop-activated')
    })
}
