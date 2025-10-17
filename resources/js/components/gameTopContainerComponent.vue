<script setup>
import { onMounted, reactive, ref } from 'vue'
import { enableDragDrop } from '/resources/js/scripts.js'
import { timeline } from '/resources/js/scripts.js'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = ref({ ...timeline })

function goBack() {
  router.push('/loggedview')
}

// onMounted(() => {
//   enableDragDrop()
// })
</script>

<template>
  <div class="top-page-container">
    <!-- 🔙 Go Back poga -->
    <button class="btn back-btn" @click="goBack">⬅ Go Back</button>

    <div class="top-container">
      <div class="tree-row">
        <div class="dropzone-container" v-for="colIndex in props.cols" :key="colIndex">
          <div class="overlay">
            <div
              v-for="n in props.rows"
              :key="n"
              class="dropzone"
              :id="`dropzone-${(colIndex - 1) * props.cols + (n - 1)}`"
            ></div>
          </div>
          <img src="/public/tree1.png" alt="" class="unselectable"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-page-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 🔙 Go Back poga */
.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  font-size: 1rem;
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 1000;
}

.back-btn:hover {
  transform: scale(1.05);
}

.tree-row {
  display: flex;
  height: 100%;
  flex-wrap: nowrap;
}

.top-container {
  width: 100%;
  height: 50vh;
  background: green;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.overlay div {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.0);
  display: flex;
  align-items: center;
  justify-content: center;
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
  z-index: 2;
}

.dropzone-container > img {
  min-width: 60%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: relative;
  z-index: 1;
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
  z-index: 3;
}

.animal {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  position: relative;
  z-index: 5;
  will-change: transform;
  margin: 0px;
}

.unselectable {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
  pointer-events: none;
}
</style>
