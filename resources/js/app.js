import { createApp } from 'vue'
import ExampleComponent from './components/ExampleComponent.vue'
import registrationView from './views/RegistrationView.vue'
import gameView from './views/gameView.vue'
import LoginView from './views/LoginView.vue'

import '../css/app.css';
import RegistrationView from './views/RegistrationView.vue'

const app = createApp()
// app.component('example-component', ExampleComponent)
app.component('example-component', RegistrationView)
app.mount('#app')

