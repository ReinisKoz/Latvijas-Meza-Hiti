<script setup>
import axios from 'axios';

axios.defaults.headers.common['X-CSRF-TOKEN'] = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute('content');

</script>


<template>
<router-view>
    
</router-view>
</template>