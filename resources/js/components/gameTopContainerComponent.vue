<script setup>
import { Howl, Howler } from 'howler'
// Example: play a sound
const sound = new Howl({
  src: ['/sounds/example.mp3']  // path to your audio file
})

function playSound() {
  sound.play()
}

</script>

<template>
    <div class="top-game-container">
        Šis ir spēles logs
        <button @click="playSound">Play Sound</button>
        <div class="tree-row">
            <img src="/public/tree1.png" alt="">
            <button @click="playSound">Play Sound</button>
        </div>
        <button @click="playSound">Play Sound</button>
    </div>
</template>

<style>
.top-game-container {
    height: 50vh; /* half of screen height */
    background-color: green;
    text-align: center;
    overflow: hidden;
    box-shadow: black 2px solid;


}
.tree-row{
    height: 100%;
    width: 100%;
}
.tree-row img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
