import { createApp } from 'vue'
import ExampleComponent from './components/ExampleComponent.vue'
import registrationView from './views/registrationView.vue'
import gameView from './views/gameView.vue'

import '../css/app.css';

const app = createApp()
// app.component('example-component', ExampleComponent)
app.component('example-component', gameView)
app.mount('#app')