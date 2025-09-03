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
    background-color: red;
}

</style>