<script setup>
import { onMounted } from 'vue'
import { enableDragDrop } from '/resources/js/scripts.js'
import { defineProps } from "vue";

const props = defineProps({
  rows: { type: Number, default: 1 },          // rindu skaits
  cols: { type: Number, default: 10 },          // kolonnu skaits (koku skaits)
  zonesPerTree: { type: Number, default: 5 },  // rindu skaits (vietas katrā kokā)
});
onMounted(() => {
  enableDragDrop()
})
</script>

<template>
  <div class="top-container">
    <div class="tree-row" v-for="rowIndex in rows" :key="rowIndex">
      <div class="dropzone-container" v-for="colIndex in cols" :key="colIndex">
        <div class="overlay">
          <div
            v-for="n in zonesPerTree"
            :key="n"
            class="dropzone"
            :id="`dropzone${rowIndex}${colIndex}${n}`"
          ></div>
        </div>
        <img src="/public/tree1.png" alt="" />
      </div>
    </div>
  </div>
</template>

<style>
.tree-row{
    display: flex;
    height: 100%;

}
.top-container {
  width: 100%;
  height: 50vh;
  background: green;
}

.overlay div {
  flex: 1;                     /* equal height for 3 divs */
  border: 1px solid white;
  background-color: rgba(0, 0, 255, 0.3); /* semi-transparent overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.overlay {
  position: absolute;          /* position over image */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;      /* stack divs vertically */
}

.dropzone-container {
  width: 150px;
  height: 100%;
  border-right: 2px solid black;
  display: flex;           /* Enable Flexbox */
  align-items: center;     /* Vertically center content if needed */
  justify-content: space-between; /* Distribute space evenly */
  flex-direction: column;
  position: relative;
}

.dropzone {
  flex: 1;                 /* All divs take equal width */
  margin: 0 10px;          /* Optional spacing between divs */
  height: 100px;
  background-color: lightblue;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.dropzone-container img{
  width: 100%;
  height: 100%;
  border-right: 2px solid black;
  object-fit: cover;
  display: block;
}
</style>
