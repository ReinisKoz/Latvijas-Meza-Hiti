<script setup>
import { ref, computed, onMounted } from "vue";
import axios from 'axios';
import { useRouter } from 'vue-router';

const renameTarget = ref(null);
const renameTitle = ref("");
const router = useRouter();

const profileName = ref("");
const userInitials = computed(() =>
  profileName.value.split(" ").map((n) => n[0]).join("")
);

const showUploadModal = ref(false);
const showMusicList = ref(false);
const showRenameModal = ref(false);

const newMusic = ref({ title: "" });
const myMusic = ref([]);

// 🔍 Search and Sort Controls
const searchQuery = ref("");
const sortOption = ref("modified"); // default sort

// 🧩 Load user + their projects
onMounted(async () => {
  try {
    const response = await axios.get('/api/authuser', { withCredentials: true });
    if (response.data.isAuthenticated) {
      profileName.value = response.data.user.name;
      await fetchProjects();
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('auth error:', error);
    router.push('/');
  }
});

async function fetchProjects() {
  try {
    const res = await axios.get('/api/projects', { withCredentials: true });
    console.log(res.data)
    myMusic.value = res.data.map(p => ({
      id: p.id,
      title: p.name,
      bpm: p.data.timeline.bpm || 120, // optional field for future
      date: new Date(p.updated_at || p.created_at),
    }));
    console.log(myMusic)
  } catch (err) {
    console.error("❌ Failed to load projects:", err);
  }
}

// 🟢 Create new project
async function createProject() {
  try {
    const res = await axios.post(
      '/api/projects',
      { name: newMusic.value.title, data: {} },
      { withCredentials: true }
    );
    router.push(`/gameview/${res.data.id}`);
  } catch (err) {
    console.error("❌ Failed to create project:", err);
  }
}

function viewMyMusic() {
  showMusicList.value = true;
}

function playMusic(project) {
  router.push(`/gameview/${project.id}`);
}

// 🧭 Sorting + Filtering Logic
const filteredAndSortedMusic = computed(() => {
  // Filter by search
  let filtered = myMusic.value.filter(m =>
    m.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  // Sort
  switch (sortOption.value) {
    case "name":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "bpm":
      filtered.sort((a, b) => (a.bpm || 0) - (b.bpm || 0));
      break;
    case "modified":
      filtered.sort((a, b) => b.date - a.date);
      break;
  }

  return filtered;
});

const logout = async () => {
  try {
    await axios.post('/api/logout');
    router.push('/');
  } catch (error) {
    console.error('logout error:', error);
  }
};
// ✏️ Rename project
function openRenameModal(project) {
  renameTarget.value = project;
  renameTitle.value = project.title;
  showRenameModal.value = true;
}

async function renameProject() {
  try {
    await axios.put(`/api/projects/${renameTarget.value.id}`, { name: renameTitle.value });
    showRenameModal.value = false;
    await fetchProjects();
  } catch (err) {
    console.error("❌ Rename failed:", err);
  }
}

// 📄 Duplicate project
async function duplicateProject(project) {
  try {
    const newName = prompt("Jaunais nosaukums:", `${project.title} (1)`);
    if (!newName) return;

    const fullRes = await axios.get(`/api/projects/${project.id}`);
    const fullProject = fullRes.data;

    const res = await axios.post(
      '/api/projects',
      {
        name: newName,
        data: fullProject.data || {},
      },
      { withCredentials: true }
    );

    const newId = res.data.id; // Laravel should return the new ID
    await fetchProjects();

    // ✅ Redirect user to the new beat editor
    router.push(`/gameview/${newId}`);
  } catch (err) {
    console.error("❌ Duplicate failed:", err);
  }
}


// 🗑 Delete project
async function deleteProject(project) {
  if (!confirm(`Vai tiešām dzēst "${project.title}"?`)) return;
  try {
    await axios.delete(`/api/projects/${project.id}`);
    await fetchProjects();
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
}


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

      <!-- 🔍 Search + Sort Controls -->
      <div class="music-controls">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="🔍 Meklēt pēc nosaukuma..."
          class="search-input"
        />
        <select v-model="sortOption" class="sort-select">
          <option value="modified">📅 Pēc datuma</option>
          <option value="name">🔤 Pēc nosaukuma</option>
          <option value="bpm">🎚️ Pēc BPM</option>
        </select>
      </div>

      <div v-if="filteredAndSortedMusic.length > 0">
        <div
          class="music-item"
          v-for="(music, index) in filteredAndSortedMusic"
          :key="index"
        >
          <div class="music-info">
            <div class="music-title">{{ music.title }}</div>
            <div class="music-date">
              BPM: {{ music.bpm }} | Pēdējoreiz: {{ music.date.toLocaleDateString() }}
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" @click="playMusic(music)">Turpināt darbu</button>
            <button class="btn btn-secondary" @click="openRenameModal(music)">Pārsaukt</button>
            <button class="btn btn-secondary" @click="duplicateProject(music)">Klonēt</button>
            <button class="btn btn-danger" @click="deleteProject(music)">Dzēst</button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <p>Vēl nav pievienota neviena mūzikas kompozīcija</p>
      </div>
    </div>

    <!-- ✏️ Rename Modal -->
    <div class="modal" v-if="showRenameModal">
      <div class="modal-content">
        <h3 class="modal-title">Pārsaukt "{{ renameTarget?.title }}"</h3>
        <div class="form-group">
          <label class="form-label">Jaunais nosaukums</label>
          <input
            type="text"
            class="form-input"
            v-model="renameTitle"
            placeholder="Ievadi jauno nosaukumu"
          />
        </div>
        <div class="btn-group">
          <button class="btn btn-secondary" @click="showRenameModal = false">
            Atcelt
          </button>
          <button class="btn btn-primary" @click="renameProject">
            Saglabāt
          </button>
        </div>
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
          <button to="/gameview" class="btn btn-primary" @click="createProject">
            Izveidot
          </button>
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

.music-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 15px;
}

.sort-select {
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #ffcc00;
  color: #333;
  font-weight: 600;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-danger {
  background: #ff4444;
  color: white;
}

.btn-danger:hover {
  background: #dd2222;
}

</style>
