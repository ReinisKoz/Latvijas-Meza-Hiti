<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const sendResetLink = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    const response = await axios.post('/api/password/email', {
      email: email.value
    });

    successMessage.value = 'Password reset link sent! Check your email.';
  } catch (error) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Failed to send reset link. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <!-- Clouds -->
    <div class="cloud cloud1"></div>
    <div class="cloud cloud2"></div>
    <div class="cloud cloud3"></div>

    <!-- Birds -->
    <div class="bird">🐦</div>
    <div class="bird" style="top: 30%; animation-delay: 5s;">🕊️</div>
    <div class="bird" style="top: 70%; animation-delay: 10s;">🐤</div>

    <!-- Forgot Password Box -->
    <div class="login-container">
      <div class="login-header">
        <h1>Forgot Password</h1>
        <p>Enter your email to reset your password</p>
      </div>

      <form @submit.prevent="sendResetLink">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <div class="success-message">{{ successMessage }}</div>
        <div class="error-message">{{ errorMessage }}</div>
      </form>

      <div class="login-footer">
        <p>Remembered your password? <router-link to="/">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Copy most of the login page styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", cursive, sans-serif;
}

.page {
  background: linear-gradient(135deg, #87ceeb, #b3e0ff);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container {
  background-color: #228b22;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  color: white;
  width: 100%;
  max-width: 420px;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.login-header h1 {
  font-size: 32px;
  color: #ffd700;
  text-shadow: 2px 2px 0 #000;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 18px;
  color: #ffffff;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  color: #ffd700;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  background-color: #f8f8f8;
  outline: none;
}

.form-group input:focus {
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.5);
}

.btn-login {
  width: 100%;
  padding: 15px;
  background-color: #ff8c00;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  margin-top: 10px;
}

.btn-login:hover {
  background-color: #ffa500;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-login:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
}

.login-footer a {
  color: #ffd700;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 15px;
  font-size: 16px;
  min-height: 20px;
}

.success-message {
  color: #00ff7f;
  text-align: center;
  margin-top: 15px;
  font-size: 16px;
  min-height: 20px;
}

/* Clouds */
.cloud {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 
    60px 0px 0 20px white, 
    120px 10px 0 30px white, 
    180px -10px 0 25px white;
  width: 100px;
  height: 100px;
  opacity: 0.9;
  z-index: 0;
}

.cloud1 {
  top: 15%;
  left: 10%;
  transform: scale(1.5);
}
.cloud2 {
  top: 30%;
  right: 15%;
  transform: scale(2);
}
.cloud3 {
  bottom: 20%;
  left: 20%;
  transform: scale(1.8);
}

/* Birds */
.bird {
  position: absolute;
  font-size: 30px;
  z-index: 0;
  animation: fly 20s linear infinite;
}

@keyframes fly {
  from {
    transform: translateX(-100vw);
  }
  to {
    transform: translateX(100vw);
  }
}
</style>
