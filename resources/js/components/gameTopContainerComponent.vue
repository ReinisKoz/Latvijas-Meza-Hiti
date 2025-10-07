<script setup>
import { onMounted, reactive } from 'vue'
import { enableDragDrop } from '/resources/js/scripts.js'
import { timeline } from '/resources/js/scripts.js'
import { defineProps } from "vue";

// export const timelineSize = {
//   'cols': 10,
//   'rows': 5
// };

// const props = defineProps({
//   rows: { type: Number, default: 1 },          // rindu skaits
//   cols: { type: Number, default: timeline['cols'] },          // kolonnu skaits (koku skaits)
//   zonesPerTree: { type: Number, default: timeline['rows'] },  // rindu skaits (vietas katrā kokā)
// });

const props = reactive(timeline);

onMounted(() => {
  enableDragDrop()
})
</script>

<template>
  <div class="top-container">
    <!-- <div class="tree-row" v-for="rowIndex in rows" :key="rowIndex"> -->
    <div class="tree-row">
      <div class="dropzone-container" v-for="colIndex in props.cols" :key="colIndex">
        <div class="overlay">
          <div
            v-for="n in props.rows"
            :key="n"
            class="dropzone"
            :id="`dropzone-${colIndex * props.cols + n}`"
          ></div>
        </div>
        <img src="/public/tree1.png" alt="" class="unselectable"/>
      </div>
    </div>
  </div>
</template>

<style>
.tree-row {
  display: flex;
  height: 100%;
  flex-wrap: nowrap;     /* force items to stay on one line */
}

.top-container {
  width: 100%;
  height: 50vh;
  background: green;
  overflow-x: auto;     /* enable horizontal scrolling */
  overflow-y: hidden;   /* prevent vertical scroll inside */
  white-space: nowrap;  /* ensure columns stay in one row */
  /* z-index: -4; */
}

.overlay div {
  flex: 1;                     /* equal height for 3 divs */
  /* border: 1px solid white; */
  background-color: rgba(0, 0, 0, 0.0); /* semi-transparent overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  /* color: white; */
  font-weight: bold;
}

.dropzone-container {
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 2; /* ✅ force overlay above tree image */
}

.dropzone-container > img {
  min-width: 60%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 1; /* ✅ keep image below overlay */
}

.dropzone {
  flex: 1;
  margin: 0 10px;
  height: 100px;
  background-color: lightblue;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: relative;
  z-index: 3; /* ✅ animals/dropped elements are always on top */
}
.animal {
  width: 80px;
  height: 80px;
  color: white;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  position: relative;
  z-index: 5; /* ✅ highest layer */
  will-change: transform;
  margin: 0px;
  /* position: absolute;
  top: 0;
  left: 0; */
}

.unselectable {
  user-select: none;      /* modern browsers */
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none;     /* old IE/Edge */
  -moz-user-select: none;    /* old Firefox */
  pointer-events: none;      /* optional: disables all mouse interaction */
}
</style>
