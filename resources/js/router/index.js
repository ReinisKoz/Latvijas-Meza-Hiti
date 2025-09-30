import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegistrationView from '../views/registrationView.vue';
import gameView from '../views/gameView.vue';

const routes = [
{
    path:'/',
    name: 'Login',
    component: LoginView,
},
{
    path:'/register',
    name: 'register',
    component: RegistrationView,
},
{
    path:'/gameview',
    name: 'gameview',
    component: gameView,
},

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;