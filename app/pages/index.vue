<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useTauriSQL } from '@/composables/useTauriSQL'

// 设置页面标题
useHead({
  title: '像素风管理后台',
})

// 使用导航栏 composable
const { setTransparent, clearNavBar } = useNavBar()

// 数据库接口
const {
  initDatabase,
  getAllLinkEntities,
  getAllLinkTasks,
  getAffectionPoints,
} = useTauriSQL()

// 数据类型定义
interface LinkEntity {
  id: number
  name: string
  description?: string
  affectionPoints: number
  color: string
  icon: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface LinkTask {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: number
  dueDate?: string
  linkEntityId: number
  tagId?: number
  createdAt: string
  updatedAt: string
}

// 响应式数据
const linkEntities = ref<LinkEntity[]>([])
const linkTasks = ref<LinkTask[]>([])
const affectionPoints = ref<Record<number, number>>({})

// 像素风数据
const systemStats = ref({
  cpu: 68,
  memory: 45,
  disk: 82,
  network: 23,
})

// 计算前三个实体的数据
const topEntities = computed(() => {
  return linkEntities.value.slice(0, 3).map((entity) => {
    const entityTasks = linkTasks.value.filter(task => task.linkEntityId === entity.id)
    const completedTasks = entityTasks.filter(task => task.completed).length
    const totalTasks = entityTasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const points = affectionPoints.value[entity.id] || 0

    return {
      id: entity.id,
      name: entity.name.toUpperCase(),
      description: entity.description || '暂无描述',
      totalTasks,
      completedTasks,
      points,
      completionRate,
      status: totalTasks > 0 ? (completionRate === 100 ? 'COMPLETED' : 'ACTIVE') : 'INACTIVE',
    }
  })
})

// 数据加载函数
async function loadEntityData() {
  try {
    await initDatabase()
    const entities = await getAllLinkEntities()
    const tasks = await getAllLinkTasks()

    linkEntities.value = entities
    linkTasks.value = tasks

    // 加载积分数据
    for (const entity of entities) {
      const points = await getAffectionPoints(entity.id)
      affectionPoints.value[entity.id] = points
    }
  }
  catch (err) {
    console.error('加载实体数据失败:', err)
  }
}

// 页面初始化
onMounted(async () => {
  await loadEntityData()
})

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
</script>

<template>
  <div class="pixel-dashboard px-6 py-8 md:px-6 md:py-10 max-w-5xl mx-auto">
    <!-- 顶部标题栏 -->
    <div class="pixel-header">
      <div class="pixel-title">
        <span class="text-xl">🎮</span>
        <span>人生游戏 DLC</span>
      </div>
      <div class="pixel-status">
        <span class="pixel-status-dot pixel-status-online" />
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
          <div v-for="(value, key) in systemStats" :key="key" class="pixel-stat">
            <div class="pixel-stat-label">
              {{ key.toUpperCase() }}
            </div>
            <div class="pixel-progress">
              <div class="pixel-progress-fill" :style="{ width: `${value}%` }" />
            </div>
            <div class="pixel-stat-value">
              {{ value }}%
            </div>
          </div>
        </div>
      </div>
      <!-- 实体数据卡片 -->
      <div class="pixel-card">
        <div class="pixel-card-header">
          <span class="pixel-card-title">🔗 链接（{{ linkEntities.length }}）</span>
          <Button class="pixel-btn pixel-btn-small" @click="loadEntityData">
            REFRESH
          </Button>
        </div>
        <div class="pixel-game-list">
          <div v-for="entity in topEntities" :key="entity.id" class="pixel-game-item">
            <div class="pixel-game-info">
              <div class="pixel-game-name">
                {{ entity.name }}
              </div>
              <div class="pixel-game-level">
                {{ entity.description }}
              </div>
            </div>
            <div class="pixel-game-exp">
              <div class="pixel-progress">
                <div class="pixel-progress-fill" :style="{ width: `${entity.completionRate}%` }" />
              </div>
              <div class="pixel-exp-text flex items-center justify-between">
                <span class="text-orange-400 text-sm uppercase tracking-wider font-mono">
                  <span class="font-bold">{{ entity.completedTasks }}/{{ entity.totalTasks }}</span> TASKS
                </span>
                <span class="text-yellow-400 text-sm uppercase tracking-wider font-mono">
                  <span class="font-bold">{{ entity.points }}</span> POINTS
                </span>
              </div>
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
                <div class="pixel-progress">
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
@import 'tailwindcss';
.pixel-dashboard {
  @apply min-h-screen font-mono;
}
/* 头部样式已移至全局 tailwind.css */
.pixel-content {
  @apply flex flex-col gap-4;
}
.pixel-card-header {
  @apply flex justify-between items-center mb-4;
}
.pixel-card-title {
  @apply text-base font-bold text-[color:var(--pixel-text-primary)];
}
.pixel-stats-grid {
  @apply grid grid-cols-2 gap-4;
}
.pixel-stat {
  @apply flex flex-col gap-2;
}
.pixel-stat-label {
  @apply text-xs font-bold text-[color:var(--pixel-text-secondary)];
}
.pixel-stat-value {
  @apply text-lg font-bold text-[color:var(--pixel-text-primary)];
}
.pixel-game-list {
  @apply flex flex-col gap-3;
}
.pixel-game-item {
  @apply grid grid-cols-3 gap-4 items-center p-3 border-2 border-[color:var(--pixel-border)] bg-[color:var(--pixel-bg-secondary)];
}
.pixel-game-info {
  @apply flex flex-col gap-1;
}
.pixel-game-name {
  @apply text-base font-bold text-[color:var(--pixel-text-primary)];
}
.pixel-game-level {
  @apply text-xs text-[color:var(--pixel-text-secondary)];
}
.pixel-game-exp {
  @apply flex flex-col gap-2;
}
.pixel-game-progress {
  @apply flex flex-col gap-2;
}
.pixel-progress-text,
.pixel-exp-text {
  @apply text-xs text-[color:var(--pixel-text-secondary)];
}
.pixel-game-status {
  @apply flex flex-col gap-1;
}
.pixel-players {
  @apply text-xs text-[color:var(--pixel-text-secondary)];
}
.pixel-achievement-count {
  @apply text-xs text-[color:var(--pixel-text-secondary)] bg-[color:var(--pixel-bg-tertiary)] px-2 py-1 border border-[color:var(--pixel-border)];
}
.pixel-achievement-grid {
  @apply grid grid-cols-1 gap-3 md:grid-cols-2;
}
.pixel-achievements {
  @apply flex flex-col gap-3;
}
.pixel-achievement {
  @apply bg-[color:var(--pixel-bg-tertiary)] p-3 flex gap-3 opacity-50 border border-[color:var(--pixel-border)] transition-opacity;
}
.pixel-achievement.unlocked {
  @apply opacity-100 border-[color:var(--pixel-yellow)] shadow-[0_0_8px_rgba(251,191,36,0.3)];
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
  @apply text-base font-bold text-[color:var(--pixel-text-primary)] mb-1;
}
.pixel-achievement.unlocked .pixel-achievement-name {
  @apply text-[color:var(--pixel-yellow)];
}
.pixel-achievement-desc {
  @apply text-xs text-[color:var(--pixel-text-secondary)] mb-2;
}
.pixel-achievement-progress {
  @apply flex items-center gap-2;
}
.pixel-logs {
  @apply flex flex-col gap-1 max-h-64 overflow-y-auto;
}
.pixel-log-item {
  @apply text-xs font-mono p-2 border-l-2;
}
.pixel-log-item.info {
  @apply bg-blue-200/20 border-[color:var(--pixel-blue)] text-[color:var(--pixel-blue)];
}
.pixel-log-item.warning {
  @apply bg-yellow-200/20 border-[color:var(--pixel-yellow)] text-[color:var(--pixel-yellow)];
}
.pixel-log-item.error {
  @apply bg-red-200/20 border-[color:var(--pixel-red)] text-[color:var(--pixel-red)];
}
.pixel-log-item.success {
  @apply bg-green-200/20 border-[color:var(--pixel-green)] text-[color:var(--pixel-green)];
}
.pixel-log-time {
  @apply text-[color:var(--pixel-text-muted)] mr-2;
}
.pixel-log-type {
  @apply font-bold mr-2;
}
.pixel-log-message {
  @apply text-[color:var(--pixel-text-secondary)];
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
@media (max-width: 640px) {
  .pixel-dashboard {
    @apply bg-[length:4px_4px];
  }
  .pixel-header {
    @apply px-3;
  }
  .pixel-content {
    @apply gap-3;
  }
  .pixel-game-item {
    @apply grid-cols-1 gap-2;
  }
}
</style>
