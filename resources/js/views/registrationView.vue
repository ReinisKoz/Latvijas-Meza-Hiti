<template>
  <div class="page">
    <!-- Mākoņi un putni -->
    <div class="cloud cloud1"></div>
    <div class="cloud cloud2"></div>
    <div class="cloud cloud3"></div>
    <div class="bird">🐦</div>
    <div class="bird" style="top: 30%; animation-delay: 5s;">🕊️</div>
    <div class="bird" style="top: 70%; animation-delay: 10s;">🐤</div>

    <!-- Reģistrācija -->
    <div class="login-container">
      <div class="login-header">
        <h1>CREATE ACCOUNT</h1>
        <p>Please fill in your details</p>
      </div>

      <form @submit.prevent="register">
        <div class="form-group">
          <label for="name">Name</label>
          <input
            type="text"
            id="name"
            v-model="name"
            placeholder="Enter your name"
            required
          />
        </div>

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

        <div class="form-group">
          <label for="password_confirmation">Confirm Password</label>
          <input
            type="password"
            id="password_confirmation"
            v-model="password_confirmation"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'CREATING ACCOUNT...' : 'REGISTER' }}
        </button>

        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
        <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
      </form>

      <div class="login-footer">
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "RegistrationPage",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      errorMessage: "",
      validationErrors: {},
      successMessage: "",
      loading: false
    };
  },
  methods: {
    async register() {
      this.errorMessage = "";
      this.validationErrors = {};
      this.successMessage = "";
      this.loading = true;

      try {
        // Izveidojam datu objektu
        const formData = {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation
        };

        // Izmantojam tikai axios, nevis api
        const response = await axios.post('http://localhost:8000/api/register', formData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        console.log('Registration success:', response.data);
        
        // Pārbaudām atbildes struktūru
        if (response.data.access_token) {
          localStorage.setItem('auth_token', response.data.access_token);
          localStorage.setItem('user', JSON.stringify(response.data.user || response.data.data));
          
          this.successMessage = "Reģistrācija veiksmīga! Novirzām uz galveno lapu...";
          
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 2000);
        } else {
          this.errorMessage = "Reģistrācija veiksmīga, bet trūkst autorizācijas datu.";
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        
        if (error.response && error.response.status === 422) {
          this.validationErrors = error.response.data.errors || {};
          this.errorMessage = "Lūdzu, izlabojiet validācijas kļūdas:";
          
          // Parādām pirmo kļūdu
          const firstError = Object.values(this.validationErrors)[0];
          if (firstError && firstError[0]) {
            this.errorMessage += " " + firstError[0];
          }
        } else if (error.response && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else if (error.request) {
          this.errorMessage = "Nevar sazināties ar serveri. Pārbaudiet, vai Laravel serveris darbojas.";
        } else {
          this.errorMessage = "Reģistrācija neizdevās. Lūdzu, mēģiniet vēlreiz.";
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Jūsu esošie stili paliek nemainīti */
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
  max-width: 450px;
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
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #ffd700;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
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
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  background-color: #ffa500;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-login:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
  font-weight: bold;
}

.success-message {
  color: #4caf50;
  text-align: center;
  margin-top: 15px;
  font-size: 16px;
  min-height: 20px;
  font-weight: bold;
}

/* Mākoņi */
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

/* Pozīcijas */
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

/* Putni */
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