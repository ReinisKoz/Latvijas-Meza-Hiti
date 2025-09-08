<script setup>
import { onMounted } from 'vue'
import { enableDragDrop } from '/resources/js/scripts.js'

onMounted(() => {
  enableDragDrop()
})
</script>

<template>
  <div class="top-container">
    <div class="tree-row">
        <div id="dropzone1" class="dropzone">
            <img src="/public/tree1.png" alt="">
        </div>
        <div id="dropzone2" class="dropzone">
            <img src="/public/tree1.png" alt="">
        </div>
        <div id="dropzone3" class="dropzone">
            <img src="/public/tree1.png" alt="">
        </div>
        <div id="dropzone4" class="dropzone">
            <img src="/public/tree1.png" alt="">
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

.dropzone {
  width: 150px;
  height: 100%;
  border-right: 2px solid black;
}
.dropzone img{
  width: 100%;
  height: 100%;
  border-right: 2px solid black;
}
</style>
