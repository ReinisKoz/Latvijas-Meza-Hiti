<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const animals = ref([])
const newAnimal = ref({
  nosaukums: '',
  bilde: null,
  audio: null
})

const fetchAnimals = async () => {
  try {
    const response = await axios.get('/api/dzivnieki')
    animals.value = response.data
  } catch (error) {
    console.error('Kļūda ielādējot dzīvniekus:', error)
  }
}

const handleFileChange = (e, type) => {
  if (type === 'bilde') newAnimal.value.bilde = e.target.files[0]
  if (type === 'audio') newAnimal.value.audio = e.target.files[0]
}

const addAnimal = async () => {
  try {
    // Sagatavo FormData
    const formData = new FormData()
    formData.append('nosaukums', newAnimal.value.nosaukums)
    if (newAnimal.value.bilde) formData.append('bilde', newAnimal.value.bilde)
    if (newAnimal.value.audio) formData.append('audio', newAnimal.value.audio)

    // Debug: pārbaudi, ko sūti
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1])
    }

    // POST pieprasījums
    await axios.post('/api/dzivnieki', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // Reset formas laukus
    newAnimal.value = { nosaukums: '', bilde: null, audio: null }

    // Ielādē dzīvniekus atkārtoti
    fetchAnimals()

  } catch (error) {
    // Ja Laravel atgriež validācijas kļūdas
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors
      console.error('Validācijas kļūdas:', errors)

      // Parādi kļūdas lietotājam
      let message = 'Neizdevās pievienot dzīvnieku:\n'
      for (const field in errors) {
        message += `${field}: ${errors[field].join(', ')}\n`
      }
      alert(message)
    } else {
      console.error('Kļūda pievienojot dzīvnieku:', error)
      alert('Kļūda pievienojot dzīvnieku. Pārbaudiet konsoli.')
    }
  }
}

const deleteAnimal = async (id) => {
  try {
    await axios.delete(`/api/dzivnieki/${id}`)
    fetchAnimals()
  } catch (error) {
    console.error('Kļūda dzēšot dzīvnieku:', error)
  }
}

const logout = () => {
  // Pievienojiet savu logout loģiku šeit
  localStorage.removeItem('authToken') // vai cits autentifikācijas tokens
  window.location.href = '/' // vai cita login lapa
}

// onMounted(fetchAnimals)

// Existing code...
const codes = ref([])
const newCode = ref({ reward: '', expires_at: '' })

const fetchCodes = async () => {
  try {
    const res = await axios.get('/api/codes')
    codes.value = res.data
  } catch (err) {
    console.error('Error fetching codes:', err)
  }
}

const addCode = async () => {
  if (!newCode.value.reward) return alert('Enter reward type!')
  try {
    const res = await axios.post('/api/codes', newCode.value)
    codes.value.unshift(res.data)
    newCode.value = { reward: '', expires_at: '' }
  } catch (err) {
    console.error(err)
  }
}

const deleteCode = async (id) => {
  if (!confirm('Delete this code?')) return
  try {
    await axios.delete(`/api/codes/${id}`)
    codes.value = codes.value.filter(c => c.id !== id)
  } catch (err) {
    console.error(err)
  }
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert(`✅ Code "${code}" copied to clipboard!`)
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('❌ Could not copy code.')
  }
}

onMounted(() => {
  fetchAnimals()
  fetchCodes()
})
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

    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>🐾 Admin Panelis — Dzīvnieki</h1>
        <button @click="logout" class="btn-logout">🚪 Iziet</button>
      </div>
      
      <div class="dashboard-content">
        <div class="section">
          <div class="section-header">
            <h2>➕ Pievienot jaunu dzīvnieku</h2>
          </div>
          <div class="form">
            <div class="form-group">
              <label>Nosaukums:</label>
              <input v-model="newAnimal.nosaukums" placeholder="Dzīvnieka nosaukums" />
            </div>
            
            <div class="form-group">
              <label>Bilde:</label>
              <input type="file" @change="e => handleFileChange(e, 'bilde')" accept="image/*" />
            </div>
            
            <div class="form-group">
              <label>Audio:</label>
              <input type="file" @change="e => handleFileChange(e, 'audio')" accept="audio/*" />
            </div>
            
            <button @click="addAnimal" class="btn-primary">✅ Pievienot dzīvnieku</button>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>📋 Esošie dzīvnieki</h2>
          </div>
          <div class="animal-grid">
            <div v-for="dz in animals" :key="dz.id" class="animal-card">
              <div class="animal-image-container">
                <img
                  v-if="dz.bilde_url"
                  :src="dz.bilde_url"
                  class="animal-image"
                  alt="Dzīvnieka bilde"
                />
                <div v-else class="no-image">📷 Nav bildes</div>
              </div>
              <div class="animal-info">
                <h3>{{ dz.nosaukums }}</h3>
                <div class="audio-container">
                  <audio v-if="dz.audio_url" :src="dz.audio_url" controls></audio>
                  <div v-else class="no-audio">🔇 Nav audio</div>
                </div>
                <button @click="deleteAnimal(dz.id)" class="btn-danger">🗑️ Dzēst</button>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>🎁 Pārvaldīt atlīdzību kodus</h2>
          </div>
          <div class="form">
            <div class="form-group">
              <label>Atlīdzības veids:</label>
              <input v-model="newCode.reward" placeholder="piem., freespin, bonus100" />
            </div>
            
            <div class="form-group">
              <label>Derīguma termiņš (neobligāti):</label>
              <input type="date" v-model="newCode.expires_at" />
            </div>
            
            <button class="btn-primary" @click="addCode">✅ Ģenerēt kodu</button>
          </div>

          <h3>Esošie kodi</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Kods</th>
                  <th>Atlīdzība</th>
                  <th>Izmantots?</th>
                  <th>Derīgs līdz</th>
                  <th>Darbības</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in codes" :key="c.id">
                  <td class="code-cell">
                    <span>{{ c.code }}</span>
                    <button class="btn-copy" @click="copyCode(c.code)">📋</button>
                  </td>
                  <td>{{ c.reward }}</td>
                  <td>{{ c.is_used ? '✅' : '❌' }}</td>
                  <td>{{ c.expires_at ? new Date(c.expires_at).toLocaleDateString('lv-LV') : '-' }}</td>
                  <td>
                    <button class="btn-danger" @click="deleteCode(c.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="section troubleshooting">
          <div class="section-header">
            <h2>⚠️ Problēmu risināšana</h2>
          </div>
          <div class="issue">
            <h4>Bildes nerādās?</h4>
            <ul>
              <li>Pārbaudiet, vai faila formāts ir atbalstīts (jpg, png, gif)</li>
              <li>Pārbaudiet, vai back-end pareizi apstrādā failu augšupielādi</li>
              <li>Pārbaudiet, vai <code>bilde_url</code> atgriež pareizo ceļu</li>
              <li>Pārbaudiet browsera console kļūdas</li>
            </ul>
          </div>
          <div class="issue">
            <h4>Audio neskan?</h4>
            <ul>
              <li>Pārbaudiet, vai audio formāts ir atbalstīts (mp3, wav, ogg)</li>
              <li>Pārbaudiet, vai audio fails ir augšupielādēts serverī</li>
              <li>Pārbaudiet, vai <code>audio_url</code> atgriež pareizo ceļu</li>
              <li>Mēģiniet atvērt audio URL tieši browserā</li>
            </ul>
          </div>
        </div>
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
  padding: 20px;
  position: relative;
  overflow-x: hidden;
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

.cloud1 { top: 5%; left: 5%; transform: scale(1.2); }
.cloud2 { top: 15%; right: 10%; transform: scale(1.5); }
.cloud3 { bottom: 10%; left: 15%; transform: scale(1.3); }

.bird {
  position: absolute;
  font-size: 30px;
  z-index: 0;
  animation: fly 20s linear infinite;
}

@keyframes fly {
  from { transform: translateX(-100vw); }
  to { transform: translateX(100vw); }
}

.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background-color: #228b22;
  border-radius: 20px;
  padding: 20px 30px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  color: white;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #ffd700;
  text-shadow: 2px 2px 0 #000;
  margin: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  background-color: #228b22;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  color: white;
}

.section-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #ffd700;
  padding-bottom: 10px;
}

.section-header h2 {
  color: #ffd700;
  text-shadow: 1px 1px 0 #000;
  font-size: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: #ffd700;
  font-size: 18px;
}

.form-group input {
  padding: 12px 15px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  background-color: #f8f8f8;
  outline: none;
}

.form-group input:focus {
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.5);
}

button {
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  font-size: 16px;
}

.btn-primary {
  background-color: #ff8c00;
  color: white;
  align-self: flex-start;
}

.btn-primary:hover {
  background-color: #ffa500;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-logout {
  background-color: #6c757d;
  color: white;
}

.btn-logout:hover {
  background-color: #5a6268;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.btn-copy {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-copy:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.animal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.animal-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  text-align: center;
  transition: 0.3s ease-in-out;
  color: #333;
}

.animal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.animal-image-container {
  height: 200px;
  overflow: hidden;
}

.animal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image, .no-audio {
  background: #f8f9fa;
  padding: 20px;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.animal-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.animal-info h3 {
  color: #228b22;
  margin: 0;
}

.audio-container {
  margin: 10px 0;
}

audio {
  width: 100%;
  max-width: 100%;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

th {
  background: #4ECDC4;
  color: white;
  font-weight: bold;
}

td {
  background: #ffffff;
  color: #333;
}

.code-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.troubleshooting {
  background: #fff3cd;
  border: 2px solid #ffeaa7;
  color: #856404;
}

.troubleshooting .section-header h2 {
  color: #856404;
  text-shadow: none;
}

.troubleshooting .section-header {
  border-bottom: 2px solid #856404;
}

.issue {
  margin-bottom: 20px;
}

.issue h4 {
  color: #856404;
  margin-bottom: 10px;
  font-size: 18px;
}

.issue ul {
  margin: 0;
  padding-left: 20px;
}

.issue li {
  margin-bottom: 8px;
  line-height: 1.4;
}

code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .animal-grid {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px 10px;
  }
}
</style>