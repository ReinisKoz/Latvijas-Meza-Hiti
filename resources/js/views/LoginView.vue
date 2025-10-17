<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const login = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    const response = await axios.post('/api/login', {
      email: email.value,
      password: password.value
    });

    console.log('Login successful:', response.data);

    // ✅ Saglabā lietotāja datus un tokenu lokāli
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);

    successMessage.value = 'Login successful! Redirecting...';

    // ✅ Pārbauda lietotāja lomu un novirza
    const userRole = response.data.user.role;

    setTimeout(() => {
      if (userRole === 'admin') {
        router.push('/admindashboard');
      } else {
        router.push('/loggedview');
      }
    }, 1500);

  } catch (error) {
    console.error('Login error:', error);

    if (error.response) {
      if (error.response.data.errors) {
        const errors = error.response.data.errors;
        errorMessage.value = Object.values(errors)[0][0];
      } else if (error.response.data.message) {
        errorMessage.value = error.response.data.message;
      } else {
        errorMessage.value = 'Login failed. Please try again.';
      }
    } else if (error.request) {
      errorMessage.value = 'Network error. Please check your connection.';
    } else {
      errorMessage.value = 'An unexpected error occurred.';
    }
  } finally {
    loading.value = false;
  }
};

// ✅ Kad lapa ielādējas, pārbauda, vai jau ir ielogots lietotājs
onMounted(async () => {
  try {
    const response = await axios.get('/api/authuser');

    if (response.data.isAuthenticated) {
      const userRole = response.data.user.role;
      if (userRole === 'admin') {
        router.push('/admindashboard');
      } else {
        router.push('/loggedview');
      }
    }
  } catch (error) {
    console.warn('Auth check failed or not logged in.');
  }
});
</script>

<template>
  <div class="page">
    <!-- Mākoņi -->
    <div class="cloud cloud1"></div>
    <div class="cloud cloud2"></div>
    <div class="cloud cloud3"></div>

    <!-- Putni -->
    <div class="bird">🐦</div>
    <div class="bird" style="top: 30%; animation-delay: 5s;">🕊️</div>
    <div class="bird" style="top: 70%; animation-delay: 10s;">🐤</div>

    <!-- Login -->
    <div class="login-container">
      <div class="login-header">
        <h1>WELCOME BACK!</h1>
        <p>Please login to your account</p>
      </div>

      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">E-mail</label>
          <input
            type="text"
            id="username"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Logging in...' : 'LOGIN' }}
        </button>

        <div class="error-message">{{ errorMessage }}</div>
        <div class="success-message">{{ successMessage }}</div>
      </form>

      <div class="login-footer">
        <p>Don't have an account? <router-link to="/register">Sign up</router-link></p>
        <p><router-link to="/forgotpassword">Password?</router-link></p>
      </div>
      <div class="social-links">
        <a href="https://www.instagram.com/YOUR_USERNAME" target="_blank" aria-label="Instagram">📸</a>
        <a href="https://www.facebook.com/YOUR_USERNAME" target="_blank" aria-label="Facebook">📘</a>
        <a href="https://x.com/YOUR_USERNAME" target="_blank" aria-label="X (Twitter)">🐦</a>
        <a href="https://www.youtube.com/@YOUR_CHANNEL" target="_blank" aria-label="YouTube">▶️</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  color: #90ee90;
  text-align: center;
  margin-top: 10px;
  font-size: 16px;
  min-height: 20px;
}

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

.cloud1 { top: 15%; left: 10%; transform: scale(1.5); }
.cloud2 { top: 30%; right: 15%; transform: scale(2); }
.cloud3 { bottom: 20%; left: 20%; transform: scale(1.8); }

.bird {
  position: absolute;
  font-size: 30px;
  z-index: 0;
  animation: fly 20s linear infinite;
}
.social-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
}

.social-links a {
  font-size: 30px;
  text-decoration: none;
  transition: transform 0.3s ease, color 0.3s ease;
}

.social-links a:hover {
  transform: scale(1.2);
}


.social-links a[aria-label="Instagram"] { color: #e1306c; }
.social-links a[aria-label="Facebook"] { color: #1877f2; }
.social-links a[aria-label="X (Twitter)"] { color: #000; }
.social-links a[aria-label="YouTube"] { color: #ff0000; }


@keyframes fly {
  from { transform: translateX(-100vw); }
  to { transform: translateX(100vw); }
}
</style>
