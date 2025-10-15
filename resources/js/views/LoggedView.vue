<script setup>
import { ref, computed, onMounted } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const profileName = ref("");





const userInitials = computed(() =>
  profileName.value
    .split(" ")
    .map((n) => n[0])
    .join("")
);

const showUploadModal = ref(false);
const showMusicList = ref(false);

const newMusic = ref({
  title: "",
  file: null,
});
onMounted(async () => {
  try {
  const response = await axios.get('/api/authuser');

  if (response.data.isAuthenticated === true) {
    profileName.value = response.data.user.name;
  } else {
    router.push('/');
  }

} catch (error) {
  console.error('auth error:', error);
  router.push('/');
}
})

const logout = async () => {

  try {
    const response = await axios.post('/api/logout');

    console.log('Logout successful:', response.data);
    
   
    router.push('/');

  } catch (error) {
    console.error('logout error:', error);
    
  } 
};

const myMusic = ref([
  { id: 1, title: "Rīta saule", date: "2023-10-15" },
  { id: 2, title: "Vakara vējš", date: "2023-09-22" },
  { id: 3, title: "Pilsētas ritms", date: "2023-08-05" },
]);



const viewMyMusic = () => {
  showMusicList.value = true;
};

const playMusic = (music) => {
  alert(`Atskaņo: ${music.title}`);
};
</script>  

<template>
  <div id="app">
    <div class="header">
      <div class="profile-section">
        <div class="profile-pic">{{ userInitials }}</div>
        <div class="profile-name">{{ profileName }}</div>
      </div>
      <button v-on:click="logout" class="logout-btn">👋 Izlogoties</button>
    </div>

    <div class="main-content">
      <div class="action-card" @click="showUploadModal = true">
        <div class="card-icon">🎵</div>
        <h3 class="card-title">Izveidot jaunu mūziku</h3>
        <p class="card-description">
          Augšupielādēt jaunu mūzikas failu un padalīties ar to
        </p>
      </div>

      <div class="action-card" @click="viewMyMusic">
        <div class="card-icon">🎧</div>
        <h3 class="card-title">Apskatīt savu izveidoto mūziku</h3>
        <p class="card-description">
          Skatīt visus savus augšupielādētos mūzikas failus
        </p>
      </div>
    </div>

    <div class="music-list" v-if="showMusicList">
      <h3 class="section-title">🎶 Mana mūzika</h3>
      <div v-if="myMusic.length > 0">
        <div class="music-item" v-for="(music, index) in myMusic" :key="index">
          <div class="music-info">
            <div class="music-title">{{ music.title }}</div>
            <div class="music-date">Pievienots: {{ music.date }}</div>
          </div>
          <button class="btn btn-secondary" @click="playMusic(music)">
            ▶ Atskaņot
          </button>
        </div>
      </div>
      <div class="empty-state" v-else>
        <p>Vēl nav pievienota neviena mūzikas kompozīcija</p>
      </div>
    </div>

    <div class="modal" v-if="showUploadModal">
      <div class="modal-content">
        <h3 class="modal-title">Izveidot jaunu mūziku</h3>
        <div class="form-group">
          <label class="form-label">Nosaukums</label>
          <input
            type="text"
            class="form-input"
            v-model="newMusic.title"
            placeholder="Ievadi mūzikas nosaukumu"
          />
        </div>
        <div class="btn-group">
          <button class="btn btn-secondary" @click="showUploadModal = false">
            Atcelt
          </button>
          <router-link to="/gameview" class="btn btn-primary">
            Izveidot
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

 

<style scoped>
/* 🌤️ Debesu fons ar mākoņiem */

/* Noņem linka stilus */
a {
  text-decoration: none;
  color: inherit;
}

body,
#app {
  background: linear-gradient(to bottom, #a8e6ff 0%, #7fd0ff 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: #333;
  padding: 30px;
  font-family: "Segoe UI", sans-serif;
}

/* Mākoņi */
body::before,
body::after {
  content: "";
  position: absolute;
  background: white;
  opacity: 0.9;
  border-radius: 50%;
  filter: blur(2px);
}

body::before {
  width: 600px;
  height: 250px;
  top: 10%;
  left: 15%;
  box-shadow: 200px 50px 0 50px white, 400px 30px 0 80px white;
}

body::after {
  width: 700px;
  height: 300px;
  bottom: 10%;
  right: 10%;
  box-shadow: -250px 60px 0 70px white, -450px 20px 0 100px white;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1d9122;
  padding: 15px 25px;
  border-radius: 15px;
  color: white;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ffcc00;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
}

.logout-btn {
  background: #ff8c00;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #e67a00;
  transform: translateY(-2px);
}

/* GALVENAIS SATURS */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 40px;
}

.action-card {
  background: #1d9122;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  background: #18851e;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.card-title {
  font-size: 22px;
  color: #ffcc00;
  font-weight: 700;
  margin-bottom: 8px;
}

.card-description {
  font-size: 16px;
  color: #fff;
}

/* MŪZIKAS SARAKSTS */
.music-list {
  background: #1d9122;
  color: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  color: #ffcc00;
  margin-bottom: 20px;
}

.music-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.music-title {
  font-weight: 600;
}

.music-date {
  color: #ffeeaa;
}

/* POGAS */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #ff8c00;
  color: white;
}

.btn-primary:hover {
  background: #e67a00;
}

.btn-secondary {
  background: #ffeeaa;
  color: #333;
}

.btn-secondary:hover {
  background: #ffcc00;
}

/* MODAL */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #1d9122;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  color: white;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.form-label {
  color: #ffcc00;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  margin-top: 5px;
  font-size: 15px;
}
</style>
