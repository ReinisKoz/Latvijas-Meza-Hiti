import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegistrationView from "../views/registrationView.vue";
import gameView from "../views/gameView.vue";
import LoggedView from "../views/LoggedView.vue";
import wheel from "../views/wheel.vue";
import AdmindashboardView from "../views/AdmindashboardView.vue";
import ForgotPasswordView from "../views/ForgotPasswordView.vue";

const routes = [
    {
        path: "/",
        name: "Login",
        component: LoginView,
    },
    {
        path: "/register",
        name: "register",
        component: RegistrationView,
    },
    {
        path: "/gameview",
        name: "gameview",
        component: gameView,
    },
    {
        path: "/loggedview",
        name: "loggedview",
        component: LoggedView,
    },
    {
        path: "/wheel",
        name: "wheel",
        component: wheel,
    },
    {
        path: "/admindashboard",
        name: "admindashboard",
        component: AdmindashboardView,
    },
    {
        path: "/forgotpassword",
        name: "forgotpassword",
        component: ForgotPasswordView,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;