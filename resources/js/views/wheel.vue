<!-- WheelOfFortune.vue -->
<script setup>
import axios from "axios";
import { useRouter } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";

const router = useRouter();
const unlockableAnimals = ref([])
const wheelSegments = ref([])


const segments = [
    "100",
    "200",
    "300",
    "400",
    "500",
    "Bankrupt",
    "700",
    "800",
    "900",
    "Lose a Turn",
];

const currentSegment = ref("");
const isSpinning = ref(false);
const soundEnabled = ref(true);
const giftCode = ref("");
const message = ref("");
let angle = 0;

// Load spin history from localStorage on component mount
const spinHistory = ref([]);

// Bright, playful colors matching the registration page style
const segmentColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#FFA500",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
];

// Compute total spins and total value
const totalSpins = computed(() => spinHistory.value.length);
const totalValue = computed(() => {
    return spinHistory.value.reduce((total, item) => {
        const value = parseInt(item.segment);
        return isNaN(value) ? total : total + value;
    }, 0);
});

// Save spin history to localStorage whenever it changes
watch(spinHistory, (newHistory) => {
    localStorage.setItem('wheelSpinHistory', JSON.stringify(newHistory));
}, { deep: true });

async function spinWheel() {
  if (isSpinning.value) return;
  if (balance.value < 100) {
    message.value = "❌ Not enough coins to spin!";
    setTimeout(() => (message.value = ""), 3000);
    return;
  }

  // Subtract spin cost and sync with backend
  balance.value -= 100;
  await updateBalance(-100);

  isSpinning.value = true;
  currentSegment.value = "";

  const fullSpins = 5 + Math.floor(Math.random() * 3);
  const randomAngle = 360 * fullSpins + Math.floor(Math.random() * 360);
  angle += randomAngle;

  if (soundEnabled.value) playSpinSound();
  console.log('Wheel segments:', wheelSegments.value);
  const wheelEl = document.querySelector('.wheel');
    wheelEl.style.transform = `rotate(${angle}deg)`;


  setTimeout(async () => {

    const segmentLenghtGrados = 360 / wheelSegments.value 



    console.log(wheelEl.style.transform)
    const transformStr = wheelEl.style.transform;
    const match = transformStr.match(/rotate\(\s*(-?\d+(\.\d+)?)deg\s*\)/);

    const rotation = parseFloat(match[1]);
    console.log(rotation); // numeric value of rotation
    const pointerAngle = (rotation + 210 + 15) % 360;
    console.log((rotation + 210 + 15) % 360)
    const index = Math.floor(pointerAngle / 30);
    const result = wheelSegments.value[index];
    console.log(30)
    console.log(index)
    currentSegment.value = result;
    
    // If user lands on money
    if (result.type === 'money') {
        balance.value += result.amount;
        await updateBalance(result.amount);
        message.value = `💰 You won ${result.amount} coins!`;
    } else if (result.type === 'animal') {
        await unlockAnimal(result.label);
        message.value = `🎉 You unlocked ${result.label}!`;
    } else if (result.label === 'Bankrupt') {
        balance.value = 0;
        await updateBalance("reset");
        message.value = "💸 Bankrupt!";
    }

    else if (result === "Bankrupt") {
      balance.value = 0;
      await updateBalance("reset");
    }

    spinHistory.value.unshift({
      segment: result,
      timestamp: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    });

    isSpinning.value = false;
    if (soundEnabled.value) playResultSound(result);
  }, 4000);
}


function playSpinSound() {
    // In a real app, you would play an actual sound file
    console.log("Playing spin sound");
}

function playResultSound(segment) {
    // In a real app, you would play different sounds based on the result
    console.log("Playing result sound for:", segment);
}

function toggleSound() {
    soundEnabled.value = !soundEnabled.value;
}

function resetGame() {
    spinHistory.value = [];
    currentSegment.value = "";
    angle = 0;
    // localStorage will be automatically updated by the watcher
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    router.push("/loggedview"); // fallback route
  }
}

async function redeemGiftCode() {
    console.log("redeemGiftCode start");

    if (!giftCode.value.trim()) {
        message.value = "⚠️ Please enter a gift code";
        return;
    }

    try {
        const res = await axios.post("/api/redeem", { code: giftCode.value });
        console.log(res);
        message.value = res.data.message;

        if (res.data.success) {
            // Common helper to update balance in DB
            const updateBalance = async (amount) => {
                try {
                    const balanceRes = await axios.post("/api/balance/update", { amount });
                    if (balanceRes.data.success) {
                        balance.value = balanceRes.data.balance; // update frontend
                        console.log("Balance updated:", balance.value);
                    }
                } catch (err) {
                    console.error("Failed to update balance:", err);
                }
            };

            if (res.data.reward === "freespin") {
                // give +100 before spin
                await updateBalance(100);
                await spinWheel();
            } 
            else if (res.data.reward === "bonus100") {
                await updateBalance(100);
                spinHistory.value.unshift({
                    segment: "100 (Bonus)",
                    timestamp: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                });
            } else if (res.data.reward === "bonus500") {
                await updateBalance(500);
                spinHistory.value.unshift({
                    segment: "500 (Bonus)",
                    timestamp: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                });
            } else if (res.data.reward === "bonus2000") {
                await updateBalance(2000);
                spinHistory.value.unshift({
                    segment: "2000 (Bonus)",
                    timestamp: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                });
            }
        }
    } catch (err) {
        console.log(err);
        message.value = err.response?.data?.message || "❌ Invalid code";
    }

    giftCode.value = "";
    setTimeout(() => (message.value = ""), 3000);
}


const balance = ref(0);

onMounted(async () => {
    // Load spin history from localStorage
    const savedHistory = localStorage.getItem('wheelSpinHistory');
    if (savedHistory) {
        try {
            spinHistory.value = JSON.parse(savedHistory);
        } catch (e) {
            console.error('Error loading spin history:', e);
            spinHistory.value = [];
        }
    }

    // Load balance
    try {
        const res = await axios.get("/api/balance");

        console.log("balance")
        console.log(res.data)
        balance.value = parseFloat(res.data.balance);
        console.log(balance)
    } catch (error) {
        console.error('Error loading balance:', error);
    }

    // Load animals
    try {
        const res = await axios.get("/api/animals/unlockable", {
        withCredentials: true
        });
        unlockableAnimals.value = res.data; // Example: [{ name: "Owl", id: 3 }, ...]
        // Replace some wheel segments with animal names:
        console.log(unlockableAnimals.value); // see what you got
        injectAnimalsIntoWheel();
    } catch (err) {
        console.error("Error fetching unlockable animals:", err);
    }
    await loadUnlockableAnimals()
    setupWheel()
});
async function loadUnlockableAnimals() {
  try {
    const res = await axios.get('/api/animals/unlockable', { withCredentials: true })
    unlockableAnimals.value = res.data
    console.log('Unlockable animals:', unlockableAnimals.value)
  } catch (err) {
    console.error('Failed to load unlockable animals:', err)
  }
}
function setupWheel() {
  const moneySegments = [
    { label: "150", type: "money", amount: 150 },
    { label: "75", type: "money", amount: 75 },
    { label: "25", type: "money", amount: 25 },
    { label: "10", type: "money", amount: 10 },
    { label: "Bankrupt", type: "special" },
    { label: "Lose a Turn", type: "special" },
  ];

  const combined = [];
  const shuffledAnimals = [...unlockableAnimals.value].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 12; i++) {
    if (i % 3 === 0 && shuffledAnimals.length) {
      const animal = shuffledAnimals.pop();
      combined.push({
        label: animal.nosaukums || animal.name,
        image: animal.bilde ? `/storage/${animal.bilde}` : null,
        type: "animal",
        id: animal.id,
      });
      console.log(combined)
    } else {
      const money = moneySegments[Math.floor(Math.random() * moneySegments.length)];
      combined.push({ ...money }); // clone to avoid mutation
    }
    
  }
  console.log(combined)
  wheelSegments.value = combined;
}


function injectAnimalsIntoWheel() {
  // Pick up to 3 random wheel spots for animals
  const availableIndexes = [...Array(segments.length).keys()];
  const randomIndexes = [];

  while (randomIndexes.length < Math.min(3, unlockableAnimals.value.length)) {
    const rand = availableIndexes.splice(
      Math.floor(Math.random() * availableIndexes.length),
      1
    )[0];
    randomIndexes.push(rand);
  }

  randomIndexes.forEach((i, idx) => {
    segments[i] = unlockableAnimals.value[idx]?.name || "100";
  });
}
async function updateBalance(change) {

  try {
    console.log("balance update")
    console.log(change)
    await axios.post(
      "/api/balance/update",
      { change },
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Failed to update balance:", err);
  }
}

async function unlockAnimal(name) {
  try {
    await axios.post(
      "/api/unlock-animal",
      { name },
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Failed to unlock animal:", err);
  }
}


</script>

<template>
    <div class="wheel-of-fortune">
        <!-- Clouds and birds from registration page -->
        <div class="cloud cloud1"></div>
        <div class="cloud cloud2"></div>
        <div class="cloud cloud3"></div>
        <div class="bird">🐦</div>
        <div class="bird" style="top: 30%; animation-delay: 5s">🕊️</div>
        <div class="bird" style="top: 70%; animation-delay: 10s">🐤</div>

        <!-- Home Button -->
        <button class="home-btn" @click="goBack">
            <i class="fas fa-home"></i> To game
        </button>

        <div class="game-top-container">
            <div class="header">
                <h1>WHEEL OF FORTUNE</h1>
                <p>Spin the wheel and test your luck!</p>
            </div>

            <div class="balance-bar">
            💰 Your Balance: <strong>{{ balance.toFixed(2) }}</strong> coins
            </div>

            <div class="wheel-container">
                <div class="wheel-wrapper">
                    <div
                        class="wheel"
                        :style="{
                            transform: `rotate(${angle}deg)`,
                        }"
                        >
                        <div
                            v-for="(segment, i) in wheelSegments"
                            :key="i"
                            class="segment"
                            :style="{
                                backgroundColor: segmentColors[i % segmentColors.length],
                                transform: `rotate(${(360 / wheelSegments.length) * i}deg)`,
                                // clipPath: `polygon(20% 100%, 0% 0%, 0% ${100 / (wheelSegments.length / 2)}%)`
                                clipPath: `polygon(100% 100%, ${100 / (wheelSegments.length / 2)}% 100%, 0% 0%)`
                            }"
                            >

                            <div v-if="segment.type === 'animal'">
                                <p>{{ segment.label }}</p>
                            </div>

                            <div v-else>
                                <p>{{ segment.label }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="wheel-center">SPIN</div>
                </div>
            </div>
        </div>

        <div class="game-bot-container">
            <div class="controls">
                <button
                    class="spin-btn"
                    @click="spinWheel"
                    :disabled="isSpinning"
                    :class="{ pulse: !isSpinning && !currentSegment }"
                >
                    <i class="fas fa-sync-alt"></i>
                    {{ isSpinning ? "Spinning..." : "SPIN WHEEL" }}
                </button>

                <div class="result-container">
                    <div class="result-label">Current Result:</div>
                    <div class="result" :class="{ pulse: currentSegment }">
                        {{ currentSegment.label || "-" }}
                    </div>
                </div>

                <div class="gift-code-section">
                    <h3>Redeem Gift Code</h3>
                    <div class="input-group">
                        <input
                            v-model="giftCode"
                            placeholder="Enter gift code"
                            class="gift-input"
                            @keyup.enter="redeemGiftCode"
                        />
                        <button class="redeem-btn" @click="redeemGiftCode">
                            <i class="fas fa-gift"></i> Redeem
                        </button>
                    </div>
                    <div
                        class="message"
                        :class="{
                            error:
                                message.includes('Invalid') ||
                                message.includes('Please'),
                        }"
                    >
                        {{ message }}
                    </div>
                    <div class="demo-codes">
                        <p>
                            Demo codes: <strong>FREESPIN2024</strong> or
                            <strong>BONUS100</strong>
                        </p>
                    </div>
                </div>

                <div class="button-group">
                    <button class="action-btn" @click="resetGame">
                        <i class="fas fa-redo"></i> Reset Game
                    </button>
                    <button
                        class="action-btn sound-toggle"
                        @click="toggleSound"
                    >
                        <i
                            :class="
                                soundEnabled
                                    ? 'fas fa-volume-up'
                                    : 'fas fa-volume-mute'
                            "
                        ></i>
                        {{ soundEnabled ? "Sound On" : "Sound Off" }}
                    </button>
                </div>

                <div class="history">
                    <h3>Spin History (Persistent)</h3>
                    <div class="history-list">
                        <div
                            v-for="(item, index) in spinHistory"
                            :key="index"
                            class="history-item"
                            :class="{
                                bankrupt: item.segment.label === 'Bankrupt',
                                'lose-turn': item.segment.label === 'Lose a Turn',
                                bonus: typeof item.segment.label === 'string' && item.segment.label.includes('Bonus')
                            }"
                            >
                            <span>
                                <template v-if="item.segment.type === 'animal'">
                                🐾 {{ item.segment.label }}
                                </template>
                                <template v-else>
                                {{ item.segment.label }}
                                </template>
                            </span>
                            <span>{{ item.timestamp }}</span>
                        </div>

                        <div v-if="spinHistory.length === 0" class="no-history">
                            No spins yet
                        </div>
                    </div>
                    <div class="stats">
                        <span>Total Spins: {{ totalSpins }}</span>
                        <span>Total Value: ${{ totalValue }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Your existing CSS styles remain exactly the same */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Comic Sans MS", cursive, sans-serif;
}

.wheel-of-fortune {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(135deg, #87ceeb, #b3e0ff);
    padding: 20px;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
}

/* Home Button Styles */
.home-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 12px 20px;
    background: linear-gradient(to bottom, #4ecdc4, #38b2ac);
    color: white;
    border: 2px solid #000;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    text-shadow: 1px 1px 0 #000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.home-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    background: linear-gradient(to bottom, #5eddd4, #48c2bc);
}

.home-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.game-top-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    z-index: 1;
    flex-shrink: 0;
}

.game-bot-container {
    display: flex;
    justify-content: center;
    z-index: 1;
    flex-shrink: 0;
}

.header {
    text-align: center;
    color: white;
    text-shadow: 2px 2px 0 #000;
    margin-bottom: 20px;
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #ffd700;
    text-shadow: 2px 2px 0 #000;
    letter-spacing: 2px;
}

.header p {
    font-size: 1.2rem;
    opacity: 0.9;
    color: #ffffff;
    text-shadow: 1px 1px 0 #000;
}

.wheel-container {
    display: flex;
    justify-content: center;
}

.wheel-wrapper {
    position: relative;
    width: 400px;
    height: 400px;
    margin-bottom: 10px;
}

/* .wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    transition: transform 4s cubic-bezier(0.2, 0.8, 0.3, 1);
    box-shadow: 0 0 0 15px #228b22, 0 0 30px rgba(0, 0, 0, 0.5);
    background: #228b22;
    overflow: hidden;
} */

/* .segment {
    position: absolute;
    width: 50%;
    height: 50%;
    top: 0;
    left: 50%;
    transform-origin: 0% 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-weight: bold;
    color: #000;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    overflow: hidden;
    border: 2px solid #000;
} */

.segment-text {
    position: absolute;
    top: 35px;
    left: 0;
    width: 100%;
    text-align: left;
    transform-origin: center;
    transform: rotate(18deg);
    padding: 0 15px;
    box-sizing: border-box;
    font-weight: bold;
    font-size: 1rem;
}

.pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2.5rem;
    color: #ff0000;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
    z-index: 10;
    filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
}

.pointer-base {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 25px;
    height: 35px;
    background: #ff0000;
    border-radius: 50% 50% 0 0;
    z-index: 5;
}

.wheel-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 70px;
    background: #228b22;
    border-radius: 50%;
    z-index: 5;
    box-shadow: 0 0 0 10px #1a6b1a, inset 0 0 15px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffd700;
    font-weight: bold;
    font-size: 1.1rem;
    text-shadow: 1px 1px 0 #000;
    border: 2px solid #000;
}

.controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 350px;
}

.spin-btn {
    padding: 18px 30px;
    font-size: 1.3rem;
    font-weight: bold;
    background: linear-gradient(to bottom, #ff8c00, #ff6b00);
    color: white;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    box-shadow: 0 6px 0 #cc5500, 0 12px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    width: 100%;
    text-shadow: 1px 1px 0 #000;
    border: 2px solid #000;
}

.spin-btn:hover:not(:disabled) {
    background: linear-gradient(to bottom, #ffa500, #ff7b00);
    transform: translateY(2px);
    box-shadow: 0 4px 0 #cc5500, 0 10px 12px rgba(0, 0, 0, 0.3);
}

.spin-btn:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 2px 0 #cc5500, 0 4px 6px rgba(0, 0, 0, 0.3);
}

.spin-btn:disabled {
    background: linear-gradient(to bottom, #666, #444);
    color: #999;
    box-shadow: 0 6px 0 #333, 0 12px 15px rgba(0, 0, 0, 0.2);
    cursor: not-allowed;
}

.button-group {
    display: flex;
    gap: 10px;
    width: 100%;
}

.action-btn {
    padding: 12px 15px;
    font-size: 0.9rem;
    background: #228b22;
    color: white;
    border: 2px solid #000;
    border-radius: 10px;
    cursor: pointer;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.3s ease;
    text-shadow: 1px 1px 0 #000;
    font-weight: bold;
}

.action-btn:hover {
    background: #2ba32b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.result-container {
    background: #228b22;
    border-radius: 15px;
    padding: 20px;
    width: 100%;
    text-align: center;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #000;
}

.result-label {
    font-size: 1.2rem;
    color: #ffd700;
    margin-bottom: 12px;
    font-weight: 600;
    text-shadow: 1px 1px 0 #000;
}

.result {
    font-size: 2rem;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 2px 2px 0 #000;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid #000;
}

.gift-code-section {
    background: #228b22;
    border-radius: 15px;
    padding: 18px;
    width: 100%;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #000;
}

.gift-code-section h3 {
    color: #ffd700;
    text-align: center;
    margin-bottom: 12px;
    font-size: 1.2rem;
    text-shadow: 1px 1px 0 #000;
}

.input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.gift-input {
    flex: 1;
    padding: 10px 12px;
    border: 2px solid #000;
    border-radius: 8px;
    background: #f8f8f8;
    font-size: 0.9rem;
    color: #000;
}

.gift-input::placeholder {
    color: #666;
}

.gift-input:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.5);
}

.redeem-btn {
    padding: 10px 15px;
    background: linear-gradient(to bottom, #4ecdc4, #38b2ac);
    color: white;
    border: 2px solid #000;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
    text-shadow: 1px 1px 0 #000;
    font-size: 0.9rem;
}

.redeem-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.message {
    text-align: center;
    color: #4ecdc4;
    font-weight: bold;
    min-height: 18px;
    margin-bottom: 8px;
    text-shadow: 1px 1px 0 #000;
    font-size: 0.9rem;
}

.message.error {
    color: #ff6b6b;
}

.demo-codes {
    text-align: center;
    color: #ffd700;
    font-size: 0.8rem;
    text-shadow: 1px 1px 0 #000;
}

.demo-codes p {
    margin: 0;
}

.history {
    background: #228b22;
    border-radius: 15px;
    padding: 20px;
    width: 100%;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #000;
    margin-bottom: 10px;
}

.history h3 {
    color: #ffd700;
    text-align: center;
    margin-bottom: 12px;
    font-size: 1.2rem;
    text-shadow: 1px 1px 0 #000;
}

.history-list {
    max-height: 150px;
    overflow-y: auto;
    padding: 8px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid #000;
}

.history-item {
    color: white;
    padding: 6px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    justify-content: space-between;
    text-shadow: 1px 1px 0 #000;
    font-size: 0.9rem;
}

.history-item:last-child {
    border-bottom: none;
}

.history-item.bankrupt {
    color: #ff6b6b;
    font-weight: bold;
}

.history-item.lose-turn {
    color: #ffa500;
    font-weight: bold;
}

.history-item.bonus {
    color: #4ecdc4;
    font-weight: bold;
}

.no-history {
    color: #ffd700;
    text-align: center;
    padding: 12px;
    font-style: italic;
    text-shadow: 1px 1px 0 #000;
    font-size: 0.9rem;
}

.stats {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    color: #ffd700;
    font-size: 0.8rem;
    text-shadow: 1px 1px 0 #000;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.pulse {
    animation: pulse 0.5s ease-in-out 3;
}

/* Clouds */
.cloud {
    position: absolute;
    background: white;
    border-radius: 50%;
    box-shadow: 60px 0px 0 20px white, 120px 10px 0 30px white,
        180px -10px 0 25px white;
    width: 80px;
    height: 80px;
    opacity: 0.9;
    z-index: 0;
}

/* Cloud positions */
.cloud1 {
    top: 8%;
    left: 5%;
    transform: scale(1.3);
}
.cloud2 {
    top: 20%;
    right: 8%;
    transform: scale(1.6);
}
.cloud3 {
    bottom: 12%;
    left: 12%;
    transform: scale(1.4);
}

/* Birds */
.bird {
    position: absolute;
    font-size: 24px;
    z-index: 0;
    animation: fly 20s linear infinite;
    text-shadow: 2px 2px 0 #000;
}

@keyframes fly {
    from {
        transform: translateX(-100vw);
    }
    to {
        transform: translateX(100vw);
    }
}

@media (max-width: 900px) {
    .wheel-wrapper {
        width: 350px;
        height: 350px;
    }

    .segment {
        font-size: 0.9rem;
    }

    .segment-text {
        top: 25px;
        font-size: 0.8rem;
    }

    .header h1 {
        font-size: 2rem;
    }
}

@media (max-width: 500px) {
    .wheel-wrapper {
        width: 250px;
        height: 250px;
    }

    .header h1 {
        font-size: 1.8rem;
    }

    .segment {
        font-size: 0.7rem;
    }

    .segment-text {
        top: 20px;
        font-size: 0.7rem;
        padding: 0 8px;
    }

    .button-group {
        flex-direction: column;
    }

    .input-group {
        flex-direction: column;
    }

    .controls {
        gap: 15px;
    }

    .spin-btn {
        padding: 15px 20px;
        font-size: 1.1rem;
    }

    .home-btn {
        padding: 10px 15px;
        font-size: 0.9rem;
        top: 15px;
        left: 15px;
    }
}
.balance-bar {
  background: #ffd700;
  border: 2px solid #000;
  border-radius: 10px;
  padding: 8px 16px;
  margin-bottom: 30px;
  font-size: 1.1rem;
  color: #000;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 1px 1px 0 #fff;
}
.wheel {
  /* top: 50%;
  left: 50%; */
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  /* transform: translate(-50%, -50%) rotate(0deg); */
  transition: transform 4s cubic-bezier(0.33, 1, 0.68, 1);
  box-shadow: 0 0 0 15px #228b22, 0 0 30px rgba(0, 0, 0, 0.5);
  /* transform: rotate(210deg); */
}

.segment {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0% 0%;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: center;
  color: #000;
  font-weight: bold;
  border: 1px solid #000;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  overflow: hidden;
}
.segment p {
  transform: rotate(69deg); /* optional tweak */
  text-align: center;
  width: 100%;
  /* font-size: 0.9rem; */
  font-weight: bold;
  margin-top: 10rem;
  padding-right: 10rem;
 /* margin-left: 4rem; */
  font-size: 1rem;
  white-space: nowrap;

}

.segment img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transform: rotate(-18deg);
  position: absolute;
}

.animal-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
}
</style>