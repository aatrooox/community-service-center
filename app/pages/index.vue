<script setup lang="ts">
import { Button } from '@/components/ui/button'

// 设置页面标题
useHead({
  title: '像素风管理后台',
})

// 使用导航栏 composable
const { setTransparent, clearNavBar } = useNavBar()

// 像素风数据
const systemStats = ref({
  cpu: 68,
  memory: 45,
  disk: 82,
  network: 23,
})

const gameData = ref([
  {
    id: 1,
    name: 'PIXEL QUEST',
    level: 42,
    exp: 8750,
    maxExp: 10000,
    status: 'ONLINE',
    players: 1247,
  },
  {
    id: 2,
    name: 'RETRO WARS',
    level: 38,
    exp: 6420,
    maxExp: 8000,
    status: 'ONLINE',
    players: 892,
  },
  {
    id: 3,
    name: 'NEON CITY',
    level: 25,
    exp: 3200,
    maxExp: 5000,
    status: 'OFFLINE',
    players: 0,
  },
])

const achievements = ref([
  {
    id: 1,
    name: 'CODE MASTER',
    description: '完成100个任务',
    progress: 87,
    unlocked: false,
    icon: '⚡',
  },
  {
    id: 2,
    name: 'PIXEL ARTIST',
    description: '创建50个像素图',
    progress: 100,
    unlocked: true,
    icon: '🎨',
  },
  {
    id: 3,
    name: 'SPEED RUNNER',
    description: '5分钟内完成关卡',
    progress: 65,
    unlocked: false,
    icon: '🏃',
  },
])

const logs = ref([
  {
    id: 1,
    type: 'INFO',
    message: 'SYSTEM BOOT COMPLETE',
    time: '12:34:56',
  },
  {
    id: 2,
    type: 'WARN',
    message: 'HIGH CPU USAGE DETECTED',
    time: '12:35:12',
  },
  {
    id: 3,
    type: 'ERROR',
    message: 'CONNECTION TIMEOUT',
    time: '12:35:45',
  },
  {
    id: 4,
    type: 'INFO',
    message: 'NEW PLAYER JOINED',
    time: '12:36:01',
  },
])

onMounted(() => {
  // 设置透明导航栏
  setTransparent(true, true)
})

// 页面卸载时清除导航栏设置
onUnmounted(() => {
  clearNavBar()
})

// 格式化数字
function formatNumber(num: number) {
  return num.toLocaleString()
}
</script>

<template>
  <div class="pixel-dashboard">
    <!-- 顶部标题栏 -->
    <div class="pixel-header">
      <div class="pixel-title">
        <span class="pixel-icon">🎮</span>
        <span>人生游戏 DLC</span>
      </div>
      <div class="pixel-status">
        <span class="pixel-status-dot online" />
        <span>ONLINE</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="pixel-content">
      <!-- 系统状态卡片 -->
      <div class="pixel-card">
        <div class="pixel-card-header">
          <span class="pixel-card-title">⚡ SYSTEM STATUS</span>
        </div>
        <div class="pixel-stats-grid">
          <div class="pixel-stat">
            <div class="pixel-stat-label">
              CPU
            </div>
            <div class="pixel-progress-bar">
              <div class="pixel-progress-fill" :style="{ width: `${systemStats.cpu}%` }" />
            </div>
            <div class="pixel-stat-value">
              {{ systemStats.cpu }}%
            </div>
          </div>
          <div class="pixel-stat">
            <div class="pixel-stat-label">
              MEM
            </div>
            <div class="pixel-progress-bar">
              <div class="pixel-progress-fill" :style="{ width: `${systemStats.memory}%` }" />
            </div>
            <div class="pixel-stat-value">
              {{ systemStats.memory }}%
            </div>
          </div>
          <div class="pixel-stat">
            <div class="pixel-stat-label">
              DISK
            </div>
            <div class="pixel-progress-bar">
              <div class="pixel-progress-fill" :style="{ width: `${systemStats.disk}%` }" />
            </div>
            <div class="pixel-stat-value">
              {{ systemStats.disk }}%
            </div>
          </div>
          <div class="pixel-stat">
            <div class="pixel-stat-label">
              NET
            </div>
            <div class="pixel-progress-bar">
              <div class="pixel-progress-fill" :style="{ width: `${systemStats.network}%` }" />
            </div>
            <div class="pixel-stat-value">
              {{ systemStats.network }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏数据卡片 -->
      <div class="pixel-card">
        <div class="pixel-card-header">
          <span class="pixel-card-title">🎯 GAME SERVERS</span>
          <Button class="pixel-btn pixel-btn-small">
            REFRESH
          </Button>
        </div>
        <div class="pixel-game-list">
          <div v-for="game in gameData" :key="game.id" class="pixel-game-item">
            <div class="pixel-game-info">
              <div class="pixel-game-name">
                {{ game.name }}
              </div>
              <div class="pixel-game-level">
                LV.{{ game.level }}
              </div>
            </div>
            <div class="pixel-game-exp">
              <div class="pixel-exp-bar">
                <div class="pixel-exp-fill" :style="{ width: `${(game.exp / game.maxExp) * 100}%` }" />
              </div>
              <div class="pixel-exp-text">
                {{ game.exp }}/{{ game.maxExp }} EXP
              </div>
            </div>
            <div class="pixel-game-status">
              <span class="pixel-status-badge" :class="game.status.toLowerCase()">{{ game.status }}</span>
              <span class="pixel-players">{{ formatNumber(game.players) }} PLAYERS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 成就系统 -->
      <div class="pixel-card">
        <div class="pixel-card-header">
          <span class="pixel-card-title">🏆 ACHIEVEMENTS</span>
        </div>
        <div class="pixel-achievements">
          <div v-for="achievement in achievements" :key="achievement.id" class="pixel-achievement" :class="{ unlocked: achievement.unlocked }">
            <div class="pixel-achievement-icon">
              {{ achievement.icon }}
            </div>
            <div class="pixel-achievement-info">
              <div class="pixel-achievement-name">
                {{ achievement.name }}
              </div>
              <div class="pixel-achievement-desc">
                {{ achievement.description }}
              </div>
              <div class="pixel-achievement-progress">
                <div class="pixel-progress-bar small">
                  <div class="pixel-progress-fill" :style="{ width: `${achievement.progress}%` }" />
                </div>
                <span class="pixel-progress-text">{{ achievement.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统日志 -->
      <div class="pixel-card">
        <div class="pixel-card-header">
          <span class="pixel-card-title">📋 SYSTEM LOGS</span>
          <Button class="pixel-btn pixel-btn-small">
            CLEAR
          </Button>
        </div>
        <div class="pixel-logs">
          <div v-for="log in logs" :key="log.id" class="pixel-log-item" :class="log.type.toLowerCase()">
            <span class="pixel-log-time">[{{ log.time }}]</span>
            <span class="pixel-log-type">[{{ log.type }}]</span>
            <span class="pixel-log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

/* 像素风格基础样式 */
.pixel-dashboard {
  @apply min-h-screen bg-gray-900 font-mono;
  background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0);
  background-size: 8px 8px;
}

/* 顶部标题栏 */
.pixel-header {
  @apply flex items-center justify-between p-4 bg-gray-800 border-b-2 border-gray-600;
  box-shadow: 0 2px 0 #374151;
}

.pixel-title {
  @apply flex items-center gap-2 text-green-400 text-lg font-bold;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.pixel-icon {
  @apply text-xl;
  filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.8));
}

.pixel-status {
  @apply flex items-center gap-2 text-green-400 text-sm;
}

.pixel-status-dot {
  @apply w-2 h-2 rounded-full;
}

.pixel-status-dot.online {
  @apply bg-green-400;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
  animation: pulse 2s infinite;
}

/* 主要内容区域 */
.pixel-content {
  @apply p-4 space-y-4;
}

/* 卡片样式 */
.pixel-card {
  @apply bg-gray-800 border-2 border-gray-600 p-4;
  box-shadow:
    2px 2px 0 #374151,
    4px 4px 0 #1f2937;
}

.pixel-card-header {
  @apply flex items-center justify-between mb-4 pb-2 border-b border-gray-600;
}

.pixel-card-title {
  @apply text-cyan-400 font-bold text-sm uppercase tracking-wider;
  text-shadow: 0 0 4px rgba(6, 182, 212, 0.5);
}

/* 按钮样式 */
.pixel-btn {
  @apply bg-gray-700 border-2 border-gray-500 px-3 py-1 text-gray-200 text-xs font-bold uppercase tracking-wide;
  box-shadow: 1px 1px 0 #374151;
  transition: all 0.1s ease;
}

.pixel-btn:hover {
  @apply bg-gray-600 border-gray-400;
  box-shadow: 0 0 0 #374151;
  transform: translate(1px, 1px);
}

.pixel-btn.pixel-btn-small {
  @apply px-2 py-1 text-xs;
}

/* 系统状态网格 */
.pixel-stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.pixel-stat {
  @apply bg-gray-700 border border-gray-600 p-3;
}

.pixel-stat-label {
  @apply text-gray-300 text-xs font-bold mb-2 uppercase tracking-wider;
}

.pixel-stat-value {
  @apply text-green-400 text-lg font-bold mt-2;
  text-shadow: 0 0 4px rgba(34, 197, 94, 0.5);
}

/* 进度条样式 */
.pixel-progress-bar {
  @apply w-full h-3 bg-gray-900 border border-gray-600 relative overflow-hidden;
}

.pixel-progress-bar.small {
  @apply h-2;
}

.pixel-progress-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 游戏数据列表 */
.pixel-game-list {
  @apply space-y-3;
}

.pixel-game-item {
  @apply bg-gray-700 border border-gray-600 p-3 grid grid-cols-1 lg:grid-cols-3 gap-3 items-center;
}

.pixel-game-info {
  @apply flex flex-col;
}

.pixel-game-name {
  @apply text-cyan-400 font-bold text-sm;
}

.pixel-game-level {
  @apply text-gray-400 text-xs;
}

.pixel-game-exp {
  @apply flex flex-col gap-1;
}

.pixel-exp-bar {
  @apply w-full h-2 bg-gray-900 border border-gray-600 relative overflow-hidden;
}

.pixel-exp-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300;
}

.pixel-exp-text {
  @apply text-gray-300 text-xs;
}

.pixel-game-status {
  @apply flex flex-col gap-1;
}

.pixel-status-badge {
  @apply px-2 py-1 text-xs font-bold uppercase border;
}

.pixel-status-badge.online {
  @apply bg-green-900 text-green-400 border-green-600;
}

.pixel-status-badge.offline {
  @apply bg-red-900 text-red-400 border-red-600;
}

.pixel-status-badge.maintenance {
  @apply bg-yellow-900 text-yellow-400 border-yellow-600;
}

.pixel-players {
  @apply text-gray-400 text-xs;
}

/* 成就系统 */
.pixel-achievements {
  @apply space-y-3;
}

.pixel-achievement {
  @apply bg-gray-700 border border-gray-600 p-3 flex gap-3 opacity-50;
  transition: opacity 0.3s ease;
}

.pixel-achievement.unlocked {
  @apply opacity-100 border-yellow-600;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.pixel-achievement-icon {
  @apply text-2xl flex-shrink-0;
}

.pixel-achievement.unlocked .pixel-achievement-icon {
  filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.8));
}

.pixel-achievement-info {
  @apply flex-1;
}

.pixel-achievement-name {
  @apply text-gray-200 font-bold text-sm mb-1;
}

.pixel-achievement.unlocked .pixel-achievement-name {
  @apply text-yellow-400;
}

.pixel-achievement-desc {
  @apply text-gray-400 text-xs mb-2;
}

.pixel-achievement-progress {
  @apply flex items-center gap-2;
}

.pixel-progress-text {
  @apply text-gray-400 text-xs;
}

/* 系统日志 */
.pixel-logs {
  @apply space-y-1 max-h-64 overflow-y-auto;
}

.pixel-log-item {
  @apply text-xs font-mono p-2 border-l-2;
}

.pixel-log-item.info {
  @apply bg-blue-900/20 border-blue-500 text-blue-300;
}

.pixel-log-item.warning {
  @apply bg-yellow-900/20 border-yellow-500 text-yellow-300;
}

.pixel-log-item.error {
  @apply bg-red-900/20 border-red-500 text-red-300;
}

.pixel-log-item.success {
  @apply bg-green-900/20 border-green-500 text-green-300;
}

.pixel-log-time {
  @apply text-gray-500 mr-2;
}

.pixel-log-type {
  @apply font-bold mr-2;
}

.pixel-log-message {
  @apply text-gray-300;
}

/* 动画效果 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .pixel-dashboard {
    background-size: 4px 4px;
  }

  .pixel-header {
    @apply p-3;
  }

  .pixel-content {
    @apply p-3 space-y-3;
  }

  .pixel-card {
    @apply p-3;
  }

  .pixel-game-item {
    @apply grid-cols-1 gap-2;
  }
}
</style>
