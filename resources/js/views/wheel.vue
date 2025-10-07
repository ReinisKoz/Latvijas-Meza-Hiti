<!-- WheelOfFortune.vue -->
<script setup>
import { ref, computed } from "vue";

const segments = [
  "100", "200", "300", "400", "500", 
  "Bankrupt", "700", "800", "900", "Lose a Turn"
];

const currentSegment = ref("");
const isSpinning = ref(false);
const spinHistory = ref([]);
const soundEnabled = ref(true);
const giftCode = ref("");
const message = ref("");
let angle = 0;

// Colors for the wheel segments - updated to match your design
const segmentColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

// Compute total spins and total value
const totalSpins = computed(() => spinHistory.value.length);
const totalValue = computed(() => {
  return spinHistory.value.reduce((total, item) => {
    const value = parseInt(item.segment);
    return isNaN(value) ? total : total + value;
  }, 0);
});

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
    // The wheel rotates clockwise, so we need to find the segment at (360 - normalizedAngle)
    // to account for the clockwise rotation vs counter-clockwise segment placement
    const pointerAngle = (360 - normalizedAngle) % 360;
    
    // Find the segment index based on pointer position
    const index = Math.floor(pointerAngle / segmentSize);
    
    currentSegment.value = segments[index];
    spinHistory.value.unshift({
      segment: segments[index],
      timestamp: new Date().toLocaleTimeString()
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
}

function redeemGiftCode() {
  const code = giftCode.value.trim().toUpperCase();
  
  if (code === "FREESPIN2024") {
    message.value = "🎉 Free spin unlocked! Click SPIN to use it!";
    giftCode.value = "";
    
    setTimeout(() => {
      spinWheel();
    }, 1500);
  } else if (code === "BONUS100") {
    message.value = "🎁 $100 bonus added to your account!";
    giftCode.value = "";
    
    spinHistory.value.unshift({
      segment: "100 (Bonus)",
      timestamp: new Date().toLocaleTimeString()
    });
  } else if (code) {
    message.value = "❌ Invalid gift code. Try FREESPIN2024 or BONUS100";
  } else {
    message.value = "⚠️ Please enter a gift code";
  }
  
  setTimeout(() => {
    message.value = "";
  }, 3000);
}
</script>

<template>
  <div class="wheel-of-fortune">
    <div class="game-top-container">
      <div class="header">
        <h1>WHEEL OF FORTUNE</h1>
        <p>Spin the wheel and test your luck!</p>
      </div>
      
      <div class="wheel-container">
        <div class="wheel-wrapper">
          <div class="wheel" :style="{ transform: `rotate(${angle}deg)` }">
            <div
              v-for="(segment, index) in segments"
              :key="index"
              class="segment"
              :style="{
                transform: `rotate(${index * (360 / segments.length)}deg)`,
                backgroundColor: segmentColors[index]
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
          :class="{ 'pulse': !isSpinning && !currentSegment }"
        >
          <i class="fas fa-sync-alt"></i> 
          {{ isSpinning ? "Spinning..." : "SPIN WHEEL" }}
        </button>
        
        <div class="result-container">
          <div class="result-label">Current Result:</div>
          <div class="result" :class="{ 'pulse': currentSegment }">
            {{ currentSegment || "-" }}
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
            >
            <button class="redeem-btn" @click="redeemGiftCode">
              <i class="fas fa-gift"></i> Redeem
            </button>
          </div>
          <div class="message" :class="{ 'error': message.includes('Invalid') || message.includes('Please') }">
            {{ message }}
          </div>
          <div class="demo-codes">
            <p>Demo codes: <strong>FREESPIN2024</strong> or <strong>BONUS100</strong></p>
          </div>
        </div>
        
        <div class="button-group">
          <button class="action-btn" @click="resetGame">
            <i class="fas fa-redo"></i> Reset Game
          </button>
          <button class="action-btn sound-toggle" @click="toggleSound">
            <i :class="soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute'"></i>
            {{ soundEnabled ? 'Sound On' : 'Sound Off' }}
          </button>
        </div>
        
        <div class="history">
          <h3>Spin History</h3>
          <div class="history-list">
            <div 
              v-for="(item, index) in spinHistory" 
              :key="index" 
              class="history-item"
              :class="{
                'bankrupt': item.segment === 'Bankrupt',
                'lose-turn': item.segment === 'Lose a Turn',
                'bonus': item.segment.includes('Bonus')
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
.wheel-of-fortune {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #1a1a2e;
  padding: 20px;
  position: relative;
}

.game-top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.game-bot-container {
  display: flex;
  justify-content: center;
}

.header {
  text-align: center;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #e43f5a, #f37121);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
  color: #8d99ae;
}

.wheel-container {
  display: flex;
  justify-content: center;
}

.wheel-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transition: transform 4s cubic-bezier(0.2, 0.8, 0.3, 1);
  box-shadow: 0 0 0 15px #16213e, 0 0 30px rgba(0, 0, 0, 0.5);
  background: #16213e;
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
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-size: 1.1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.segment-text {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  transform-origin: center;
  /* Rotate text to be readable in each segment */
  transform: rotate(calc(360deg / 20));
  padding: 0 10px;
  box-sizing: border-box;
}

.pointer {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 3rem;
  color: #e43f5a;
  text-shadow: 0 0 10px rgba(228, 63, 90, 0.7);
  z-index: 10;
  filter: drop-shadow(0 5px 5px rgba(0, 0, 0, 0.5));
}

.pointer-base {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 40px;
  background: #e43f5a;
  border-radius: 50% 50% 0 0;
  z-index: 5;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: #16213e;
  border-radius: 50%;
  z-index: 5;
  box-shadow: 0 0 0 10px #0f1525, inset 0 0 15px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  width: 300px;
}

.spin-btn {
  padding: 18px 40px;
  font-size: 1.3rem;
  font-weight: bold;
  background: linear-gradient(to bottom, #e43f5a, #c1121f);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 0 #8d1121, 0 15px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  width: 100%;
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 6px 0 #8d1121, 0 13px 15px rgba(0, 0, 0, 0.3);
}

.spin-btn:active:not(:disabled) {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #8d1121, 0 5px 8px rgba(0, 0, 0, 0.3);
}

.spin-btn:disabled {
  background: linear-gradient(to bottom, #666, #444);
  color: #999;
  box-shadow: 0 8px 0 #333, 0 15px 20px rgba(0, 0, 0, 0.2);
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.action-btn {
  padding: 12px 20px;
  font-size: 1rem;
  background: rgba(30, 30, 60, 0.8);
  color: white;
  border: 1px solid #2d3047;
  border-radius: 10px;
  cursor: pointer;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.action-btn:hover {
  background: rgba(40, 40, 80, 0.9);
  transform: translateY(-2px);
  border-color: #e43f5a;
}

.result-container {
  background: rgba(22, 33, 62, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3047;
}

.result-label {
  font-size: 1.2rem;
  color: #8d99ae;
  margin-bottom: 15px;
  font-weight: 600;
}

.result {
  font-size: 2rem;
  font-weight: bold;
  color: #e43f5a;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
}

.gift-code-section {
  background: rgba(22, 33, 62, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3047;
}

.gift-code-section h3 {
  color: white;
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.gift-input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 1rem;
  color: white;
  border: 1px solid #2d3047;
}

.gift-input::placeholder {
  color: #8d99ae;
}

.gift-input:focus {
  outline: none;
  border-color: #e43f5a;
  box-shadow: 0 0 0 2px rgba(228, 63, 90, 0.3);
}

.redeem-btn {
  padding: 12px 20px;
  background: linear-gradient(to bottom, #4ECDC4, #2a9d8f);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.redeem-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.message {
  text-align: center;
  color: #4ECDC4;
  font-weight: bold;
  min-height: 20px;
  margin-bottom: 10px;
}

.message.error {
  color: #e43f5a;
}

.demo-codes {
  text-align: center;
  color: #8d99ae;
  font-size: 0.9rem;
}

.demo-codes p {
  margin: 0;
}

.history {
  background: rgba(22, 33, 62, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #2d3047;
}

.history h3 {
  color: white;
  text-align: center;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
}

.history-item {
  color: white;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item.bankrupt {
  color: #e43f5a;
  font-weight: bold;
}

.history-item.lose-turn {
  color: #f37121;
  font-weight: bold;
}

.history-item.bonus {
  color: #4ECDC4;
  font-weight: bold;
}

.no-history {
  color: #8d99ae;
  text-align: center;
  padding: 15px;
  font-style: italic;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  color: #8d99ae;
  font-size: 0.9rem;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse {
  animation: pulse 0.5s ease-in-out 3;
}

@media (max-width: 900px) {
  .wheel-wrapper {
    width: 320px;
    height: 320px;
  }
  
  .segment {
    font-size: 0.9rem;
  }
  
  .segment-text {
    top: 15px;
  }
}

@media (max-width: 500px) {
  .wheel-wrapper {
    width: 280px;
    height: 280px;
  }
  
  .header h1 {
    font-size: 2.2rem;
  }
  
  .segment {
    font-size: 0.8rem;
  }
  
  .segment-text {
    top: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .input-group {
    flex-direction: column;
  }
}
</style>