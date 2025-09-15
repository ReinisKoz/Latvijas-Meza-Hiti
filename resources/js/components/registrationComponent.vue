
<script setup>
import { reactive } from "vue";
const loginForm = reactive({
  Email: "",
  Password: ""
}); 
</script>
<template>
    <head>
        <title>Log in</title>
    </head>
        <form class="login-container">
            <h2>Login</h2>
            <input v-model="loginForm.Email" id="email" required type="email"/>
            <input v-model="loginForm.Password" id="password" required type="password" />
            <button type="submit">Log in</button>
        </form>
        
</template>

<style scoped>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f0fff4; /* light greenish background */
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .login-container {
        background-color: #ffffff; /* white card */
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        width: 350px;
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .login-container h2 {
      color: #4CAF50; /* light green text */
      margin-bottom: 30px;
    }

    #email,
    #password {
      width: 100%;
      padding: 12px 15px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }

    .login-container button {
      width: 100%;
      padding: 12px;
      background-color: #4CAF50; /* light green button */
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      margin-top: 15px;
      transition: background-color 0.3s;
    }

    .login-container button:hover {
      background-color: #45a049;
    }

    .login-container a {
      display: block;
      margin-top: 15px;
      color: #4CAF50;
      text-decoration: none;
      font-size: 14px;
    }

    .login-container a:hover {
      text-decoration: underline;
    }
  </style>