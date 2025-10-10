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

onMounted(() => {
  fetchAnimals()
  fetchCodes()
})
</script>

<template>
  <div class="admin-dashboard">
    <h1>🐾 Admin panelis — Dzīvnieki</h1>
    
    <div class="header-controls">
      <button @click="logout" class="btn-logout">🚪 Iziet</button>
    </div>

    <div class="form">
      <h2>Pievienot jaunu dzīvnieku</h2>
      <label>Nosaukums:</label>
      <input v-model="newAnimal.nosaukums" placeholder="Dzīvnieka nosaukums" />

      <label>Bilde:</label>
      <input type="file" @change="e => handleFileChange(e, 'bilde')" accept="image/*" />

      <label>Audio:</label>
      <input type="file" @change="e => handleFileChange(e, 'audio')" accept="audio/*" />

      <button @click="addAnimal" class="btn-primary">✅ Pievienot dzīvnieku</button>
    </div>

    <h2>Esošie dzīvnieki</h2>
    <div class="animal-grid">
      <div v-for="dz in animals" :key="dz.id" class="animal-card">
        <img
          v-if="dz.bilde_url"
          :src="dz.bilde_url"
          class="animal-image"
          alt="Dzīvnieka bilde"
        />
        <div v-else class="no-image">📷 Nav bildes</div>
        <div class="animal-info">
          <h3>{{ dz.nosaukums }}</h3>
          <audio v-if="dz.audio_url" :src="dz.audio_url" controls></audio>
          <div v-else class="no-audio">🔇 Nav audio</div>
          <button @click="deleteAnimal(dz.id)" class="btn-danger">🗑️ Dzēst</button>
        </div>
      </div>
    </div>

    <!-- Redeem Codes Section -->
  <div class="redeem-codes">
    <h2>🎁 Manage Redeem Codes</h2>
    <div class="form">
      <label>Reward Type:</label>
      <input v-model="newCode.reward" placeholder="e.g., freespin, bonus100" />

      <label>Expiry (optional):</label>
      <input type="date" v-model="newCode.expires_at" />

      <button class="btn-primary" @click="addCode">✅ Generate Code</button>
    </div>

    <h3>Existing Codes</h3>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Reward</th>
            <th>Used?</th>
            <th>Expires At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in codes" :key="c.id">
            <td>{{ c.code }}</td>
            <td>{{ c.reward }}</td>
            <td>{{ c.is_used ? '✅' : '❌' }}</td>
            <td>{{ c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '-' }}</td>
            <td>
              <button class="btn-danger" @click="deleteCode(c.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Problēmu risinājumu sadaļa -->
    <div class="troubleshooting">
      <h3>⚠️ Problēmu risināšana:</h3>
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
</template>

<style scoped>
.admin-dashboard {
  padding: 30px;
  max-width: 900px;
  margin: auto;
  font-family: "Segoe UI", sans-serif;
  color: #222;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.form {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 40px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
}

input[type="text"],
input[type="file"] {
  margin-top: 6px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

button {
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 15px;
  transition: 0.2s;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover {
  background: #218838;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-logout {
  background: #6c757d;
  color: white;
}

.btn-logout:hover {
  background: #5a6268;
}

.animal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.animal-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: center;
  padding: 15px;
  transition: 0.2s ease-in-out;
}

.animal-card:hover {
  transform: translateY(-3px);
}

.animal-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
}

.no-image, .no-audio {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 10px;
  color: #6c757d;
}

.animal-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

audio {
  margin-top: 8px;
  width: 100%;
}

.troubleshooting {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 20px;
  margin-top: 30px;
}

.troubleshooting h3 {
  color: #856404;
  margin-top: 0;
}

.issue {
  margin-bottom: 15px;
}

.issue h4 {
  color: #856404;
  margin-bottom: 8px;
}

.issue ul {
  margin: 0;
  padding-left: 20px;
}

.issue li {
  margin-bottom: 5px;
  color: #666;
}

.redeem-codes {
  background: #f0f8ff;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 8px 12px;
  border: 1px solid #ccc;
  text-align: center;
}

th {
  background: #4ECDC4;
  color: white;
}

td {
  background: #ffffff;
}

input {
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
}
</style>