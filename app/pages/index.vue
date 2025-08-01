<script setup lang="ts">
import { gsap } from 'gsap'

// 设置页面标题
useHead({
  title: '个人数据面板',
})

// 使用灵动岛 composable
const {
  // setDynamicIslandRef,
  showPersistentMessage,
} = useDynamicIsland()

// 使用导航栏 composable
const { setTransparent, clearNavBar } = useNavBar()

// 灵动岛组件引用
// const dynamicIslandRef = ref()

// 示例：显示持续消息
function _showPersistentMessage() {
  showPersistentMessage('今日晴朗，温度 25°C', {
    id: 'weather',
    title: '天气信息',
    icon: 'lucide:sun',
  })
}

// 模拟数据
const lifeData = ref({
  todaySteps: 8542,
  weeklyWorkouts: 4,
  swimSessions: 2,
  sleepHours: 7.5,
  weeklyGoal: 5,
  caloriesBurned: 2340,
})

const sideJobs = ref([
  {
    id: 1,
    name: '前端开发咨询',
    timeRange: '2024.01 - 至今',
    status: '进行中',
    features: ['Vue.js开发', 'UI设计', '性能优化'],
    monthlyIncome: 8500,
  },
  {
    id: 2,
    name: '技术写作',
    timeRange: '2023.10 - 至今',
    status: '进行中',
    features: ['技术博客', '教程编写', '代码审查'],
    monthlyIncome: 3200,
  },
])

const socialMedia = ref([
  {
    platform: '微信公众号',
    followers: 12450,
    change: '+234',
    trend: 'up',
    icon: 'lucide:message-circle',
  },
  {
    platform: '知乎',
    followers: 8920,
    change: '+156',
    trend: 'up',
    icon: 'lucide:help-circle',
  },
  {
    platform: 'B站',
    followers: 5680,
    change: '-23',
    trend: 'down',
    icon: 'lucide:video',
  },
  {
    platform: '小红书',
    followers: 3240,
    change: '+89',
    trend: 'up',
    icon: 'lucide:heart',
  },
])

const newsFeeds = ref([
  {
    type: 'blog',
    title: 'Vue 3.4 正式发布，带来重大性能提升',
    source: '尤雨溪的博客',
    time: '2小时前',
    isNew: true,
  },
  {
    type: 'forum',
    title: '如何在2024年成为更好的开发者？',
    source: 'V2EX',
    time: '4小时前',
    isHot: true,
  },
  {
    type: 'news',
    title: 'OpenAI发布GPT-4 Turbo，成本降低3倍',
    source: '36氪',
    time: '6小时前',
    isNew: true,
  },
  {
    type: 'blog',
    title: '前端架构设计的最佳实践分享',
    source: '阮一峰的网络日志',
    time: '1天前',
    isNew: false,
  },
])

// 动画效果
function animateCards() {
  gsap.fromTo('.dashboard-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
  )
}

function animateProgress(element: string, value: number) {
  gsap.to(element, {
    width: `${value}%`,
    duration: 1.2,
    ease: 'power2.out',
  })
}

onMounted(() => {
  // 设置透明导航栏，与渐变背景融合
  setTransparent(true, true)
  // 设置灵动岛引用
  // setDynamicIslandRef(dynamicIslandRef)

  nextTick(() => {
    animateCards()
    animateProgress('.progress-bar', (lifeData.value.weeklyWorkouts / lifeData.value.weeklyGoal) * 100)
  })

  // 页面加载时显示欢迎消息
  // setTimeout(() => {
  //   showNotification()
  // }, 2000)
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
  <div class="min-h-screen bg-gray-950">
    <!-- 顶部渐变区域 -->
    <div class="bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 p-6 pb-8">
      <!-- 右侧功能按钮 -->
      <!-- <div class="flex justify-end gap-3 mb-6">
        <button class="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/30 transition-colors">
          <Icon name="lucide:bell" class="w-5 h-5" />
        </button>
        <button class="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/30 transition-colors" @click="_showPersistentMessage">
          <Icon name="lucide:scan" class="w-5 h-5" />
        </button>
        <NuxtLink to="/example" class="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/30 transition-colors" title="查看更多示例">
          <Icon name="lucide:sparkles" class="w-5 h-5" />
        </NuxtLink>
      </div> -->

      <!-- 主要余额卡片 -->
      <div class="bg-black/80 backdrop-blur-md rounded-2xl p-4 mb-4 shadow-lg">
        <!-- 顶部余额信息 - 横向排列 -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-white/60 text-xs mb-1">
              近七日平均消耗
            </p>
            <h2 class="text-2xl font-bold text-white">
              32,128.80 kcal
            </h2>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-emerald-400 text-base font-semibold">+3.00%</span>
            <Icon name="lucide:trending-up" class="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <!-- 数据展示组 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div class="relative p-3 sm:p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
            <!-- 顶部：左上角图标，右上角文字 -->
            <div class="flex items-start justify-between mb-2 sm:mb-4">
              <Icon name="lucide:footprints" class="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              <span class="text-white/60 text-xs sm:text-sm">步数</span>
            </div>

            <!-- 中间：大号数字 -->
            <div class="text-center mb-2 sm:mb-3">
              <span class="text-white text-xl sm:text-3xl font-bold">8,745</span>
            </div>

            <!-- 底部：变化幅度 -->
            <div class="flex items-center justify-center space-x-1">
              <Icon name="lucide:trending-up" class="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span class="text-xs sm:text-sm font-medium text-emerald-400">+12%</span>
            </div>
          </div>
          <div class="relative p-3 sm:p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
            <!-- 顶部：左上角图标，右上角文字 -->
            <div class="flex items-start justify-between mb-2 sm:mb-4">
              <Icon name="lucide:waves" class="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span class="text-white/60 text-xs sm:text-sm">游泳</span>
            </div>

            <!-- 中间：大号数字 -->
            <div class="text-center mb-2 sm:mb-3">
              <span class="text-white text-xl sm:text-3xl font-bold">1.2km</span>
            </div>

            <!-- 底部：变化幅度 -->
            <div class="flex items-center justify-center space-x-1">
              <Icon name="lucide:trending-down" class="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              <span class="text-xs sm:text-sm font-medium text-red-400">-5%</span>
            </div>
          </div>
          <div class="relative p-3 sm:p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
            <!-- 顶部：左上角图标，右上角文字 -->
            <div class="flex items-start justify-between mb-2 sm:mb-4">
              <Icon name="lucide:dumbbell" class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              <span class="text-white/60 text-xs sm:text-sm">健身</span>
            </div>

            <!-- 中间：大号数字 -->
            <div class="text-center mb-2 sm:mb-3">
              <span class="text-white text-xl sm:text-3xl font-bold">45min</span>
            </div>

            <!-- 底部：变化幅度 -->
            <div class="flex items-center justify-center space-x-1">
              <Icon name="lucide:trending-up" class="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span class="text-xs sm:text-sm font-medium text-emerald-400">+8%</span>
            </div>
          </div>
          <div class="relative p-3 sm:p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer">
            <!-- 顶部：左上角图标，右上角文字 -->
            <div class="flex items-start justify-between mb-2 sm:mb-4">
              <Icon name="lucide:moon" class="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span class="text-white/60 text-xs sm:text-sm">睡眠</span>
            </div>

            <!-- 中间：大号数字 -->
            <div class="text-center mb-2 sm:mb-3">
              <span class="text-white text-xl sm:text-3xl font-bold">7.5h</span>
            </div>

            <!-- 底部：变化幅度 -->
            <div class="flex items-center justify-center space-x-1">
              <Icon name="lucide:trending-up" class="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span class="text-xs sm:text-sm font-medium text-emerald-400">+3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="p-6 space-y-6">
      <!-- 副业项目卡片 -->
      <div class="dashboard-card bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Icon name="lucide:briefcase" class="w-5 h-5 text-cyan-400" />
            副业项目
          </h3>
          <span class="text-sm text-gray-400">{{ sideJobs.length }} 个项目</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="job in sideJobs" :key="job.id" class="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-semibold text-gray-100">
                  {{ job.name }}
                </h4>
                <p class="text-sm text-gray-400">
                  {{ job.timeRange }}
                </p>
              </div>
              <span class="px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded-lg">
                {{ job.status }}
              </span>
            </div>

            <div class="flex flex-wrap gap-1 mb-3">
              <span v-for="feature in job.features" :key="feature" class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                {{ feature }}
              </span>
            </div>

            <div class="text-right">
              <span class="text-lg font-bold text-cyan-400">¥{{ formatNumber(job.monthlyIncome) }}</span>
              <span class="text-sm text-gray-400">/月</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 社交媒体数据 -->
      <div class="dashboard-card bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Icon name="lucide:users" class="w-5 h-5 text-cyan-400" />
            社交媒体
          </h3>
          <span class="text-sm text-gray-400">粉丝数据</span>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="media in socialMedia" :key="media.platform" class="bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-800 transition-colors">
            <Icon :name="media.icon" class="w-8 h-8 mx-auto mb-2 text-cyan-400" />
            <h4 class="font-medium text-gray-100 mb-1">
              {{ media.platform }}
            </h4>
            <p class="text-2xl font-bold text-white mb-1">
              {{ formatNumber(media.followers) }}
            </p>
            <div class="flex items-center justify-center gap-1">
              <Icon
                :name="media.trend === 'up' ? 'lucide:trending-up' : 'lucide:trending-down'"
                :class="media.trend === 'up' ? 'text-emerald-400' : 'text-red-400'"
                class="w-3 h-3"
              />
              <span
                :class="media.trend === 'up' ? 'text-emerald-400' : 'text-red-400'"
                class="text-sm font-medium"
              >
                {{ media.change }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 资讯动态 -->
      <div class="dashboard-card bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Icon name="lucide:newspaper" class="w-5 h-5 text-cyan-400" />
            资讯动态
          </h3>
          <button class="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            查看更多
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="news in newsFeeds" :key="news.title" class="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-colors cursor-pointer">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    :class="{
                      'bg-blue-600/20 text-blue-400': news.type === 'blog',
                      'bg-orange-600/20 text-orange-400': news.type === 'forum',
                      'bg-purple-600/20 text-purple-400': news.type === 'news',
                    }"
                    class="px-2 py-1 text-xs rounded"
                  >
                    {{ news.type === 'blog' ? '博客' : news.type === 'forum' ? '论坛' : '新闻' }}
                  </span>
                  <span v-if="news.isNew" class="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded">
                    NEW
                  </span>
                  <span v-if="news.isHot" class="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">
                    HOT
                  </span>
                </div>
                <h4 class="font-medium text-gray-100 mb-1 line-clamp-2">
                  {{ news.title }}
                </h4>
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <span>{{ news.source }}</span>
                  <span>•</span>
                  <span>{{ news.time }}</span>
                </div>
              </div>
              <Icon name="lucide:chevron-right" class="w-4 h-4 text-gray-500 ml-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
