<!-- WheelOfFortune.vue -->
<script setup>
import { ref, computed, onMounted, watch } from "vue";

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

function spinWheel() {
    if (isSpinning.value) return;

    isSpinning.value = true;
    currentSegment.value = "";

    // 5-7 full spins + random angle for more dramatic effect
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const randomAngle = 360 * fullSpins + Math.floor(Math.random() * 360);
    angle += randomAngle;

    // Play spin sound if enabled
    if (soundEnabled.value) {
        playSpinSound();
    }

    setTimeout(() => {
        const segmentSize = 360 / segments.length;

        // Normalize the angle to be between 0 and 360
        const normalizedAngle = angle % 360;

        // Calculate which segment is under the pointer (at top, 0 degrees)
        const pointerAngle = (360 - normalizedAngle) % 360;

        // Find the segment index based on pointer position
        const index = Math.floor(pointerAngle / segmentSize);

        currentSegment.value = segments[index];
        spinHistory.value.unshift({
            segment: segments[index],
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString() // Add date for better tracking
        });

        isSpinning.value = false;

        // Play result sound if enabled
        if (soundEnabled.value) {
            playResultSound(segments[index]);
        }
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

function goHome() {
    router.push("/gameview");
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
            if (res.data.reward === "freespin") {
                spinWheel();
            } else if (res.data.reward === "bonus100") {
                spinHistory.value.unshift({
                    segment: "100 (Bonus)",
                    timestamp: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString()
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
        const res = await axios.get("/api/balance", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        });
        balance.value = res.data.balance;
    } catch (error) {
        console.error('Error loading balance:', error);
    }
});
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
        <button class="home-btn" @click="goHome">
            <i class="fas fa-home"></i> To game
        </button>

        <div class="game-top-container">
            <div class="header">
                <h1>WHEEL OF FORTUNE</h1>
                <p>Spin the wheel and test your luck!</p>
            </div>

            <div class="wheel-container">
                <div class="wheel-wrapper">
                    <div
                        class="wheel"
                        :style="{ transform: `rotate(${angle}deg)` }"
                    >
                        <div
                            v-for="(segment, index) in segments"
                            :key="index"
                            class="segment"
                            :style="{
                                transform: `rotate(${
                                    index * (360 / segments.length)
                                }deg)`,
                                backgroundColor: segmentColors[index],
                            }"
                        >
                            <div class="segment-text">
                                {{ segment }}
                            </div>
                        </div>
                    </div>
                    <div class="pointer-base"></div>
                    <div class="pointer">▼</div>
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
                        {{ currentSegment || "-" }}
                    </div>
                    <!-- <div class="balance-display">
            💰 Your Balance: ${{ balance }}
          </div> -->
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
                                bankrupt: item.segment === 'Bankrupt',
                                'lose-turn': item.segment === 'Lose a Turn',
                                bonus: item.segment.includes('Bonus'),
                            }"
                        >
                            <span>{{ item.segment }}</span>
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
    width: 350px;
    height: 350px;
    margin-bottom: 10px;
}

.wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    transition: transform 4s cubic-bezier(0.2, 0.8, 0.3, 1);
    box-shadow: 0 0 0 15px #228b22, 0 0 30px rgba(0, 0, 0, 0.5);
    background: #228b22;
    overflow: hidden;
}

.segment {
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
}

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
        width: 300px;
        height: 300px;
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
</style>