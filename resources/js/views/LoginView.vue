<template>
  <div class="page">
    <!-- Mākoņi (nekustīgi) -->
    <div class="cloud cloud1"></div>
    <div class="cloud cloud2"></div>
    <div class="cloud cloud3"></div>

    <!-- Putni (kustīgi) -->
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
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
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

        <button type="submit" class="btn-login">LOGIN</button>

        <div class="error-message">{{ errorMessage }}</div>
      </form>

      <div class="login-footer">
        <p>Don't have an account? <a href="#">Sign Up</a></p>
        <p><a href="#">Forgot Password?</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    login() {
      if (!this.username || !this.password) {
        this.errorMessage = "Please fill in all fields!";
        return;
      }

      this.errorMessage = "Logging in...";

      setTimeout(() => {
        if (this.username === "admin" && this.password === "password") {
          this.errorMessage = "Login successful! Redirecting...";
        } else {
          this.errorMessage = "Invalid username or password!";
        }
      }, 1000);
    },
  },
};
</script>

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

/* Login box */
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

/* Mākonīši */
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
  transform: scale(1.5); /* lielāks */
}
.cloud2 {
  top: 30%;
  right: 15%;
  transform: scale(2); /* vēl lielāks */
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
