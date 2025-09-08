<script setup>
    import gameTopContainerComponent from '../components/gameTopContainerComponent.vue'
    import gameBotContainerComponent from '../components/gameBotContainerComponent.vue'
</script>
<template>
    <div class="game-container">
        <gameTopContainerComponent/>
        <gameBotContainerComponent/>
    </div>
</template>

<style>
.game-container{
    height: 100%;
    width: 100%;
}


</style>