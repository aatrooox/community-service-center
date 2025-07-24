<script setup lang="ts">
import { gsap } from 'gsap'

// 设置页面标题
useHead({
  title: '个人数据面板',
})

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
  nextTick(() => {
    animateCards()
    animateProgress('.progress-bar', (lifeData.value.weeklyWorkouts / lifeData.value.weeklyGoal) * 100)
  })
})

// 格式化数字
function formatNumber(num: number) {
  return num.toLocaleString()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
    <!-- 整合的数据面板 -->
    <VBFadeContent :delay="0">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <!-- 面板标题 -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">
            数据概览
          </h1>
          <p class="text-gray-600">
            生活、工作与副业的核心指标
          </p>
        </div>

        <!-- 三列布局 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 生活健康 -->
          <div class="space-y-4">
            <div class="flex items-center mb-4">
              <Icon name="lucide:heart" class="w-6 h-6 text-red-500 mr-3" />
              <h2 class="text-lg font-semibold text-gray-800">
                生活健康
              </h2>
            </div>

            <div class="space-y-3">
              <!-- 今日步数 -->
              <div class="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon name="lucide:activity" class="w-5 h-5 text-emerald-600 mr-2" />
                    <span class="text-sm font-medium text-emerald-800">今日步数</span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-emerald-700">
                      {{ formatNumber(lifeData.todaySteps) }}
                    </div>
                    <div class="text-xs text-emerald-600">
                      步
                    </div>
                  </div>
                </div>
              </div>

              <!-- 本周健身 -->
              <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon name="lucide:dumbbell" class="w-5 h-5 text-blue-600 mr-2" />
                    <span class="text-sm font-medium text-blue-800">本周健身</span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-blue-700">
                      {{ lifeData.weeklyWorkouts }}
                    </div>
                    <div class="text-xs text-blue-600">
                      次
                    </div>
                  </div>
                </div>
              </div>

              <!-- 睡眠时长 -->
              <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon name="lucide:moon" class="w-5 h-5 text-purple-600 mr-2" />
                    <span class="text-sm font-medium text-purple-800">睡眠时长</span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-purple-700">
                      {{ lifeData.sleepHours }}h
                    </div>
                    <div class="text-xs text-purple-600">
                      昨晚
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 工作项目 -->
          <div class="space-y-4">
            <div class="flex items-center mb-4">
              <Icon name="lucide:briefcase" class="w-6 h-6 text-blue-600 mr-3" />
              <h2 class="text-lg font-semibold text-gray-800">
                工作项目
              </h2>
            </div>

            <div class="space-y-3">
              <!-- 兼职项目 -->
              <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon name="lucide:folder-open" class="w-5 h-5 text-orange-600 mr-2" />
                    <span class="text-sm font-medium text-orange-800">活跃项目</span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-orange-700">
                      {{ sideJobs.length }}
                    </div>
                    <div class="text-xs text-orange-600">
                      个
                    </div>
                  </div>
                </div>
              </div>

              <!-- 月收入 -->
              <div class="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon name="lucide:dollar-sign" class="w-5 h-5 text-green-600 mr-2" />
                    <span class="text-sm font-medium text-green-800">月收入</span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-green-700">
                      ¥{{ formatNumber(sideJobs.reduce((sum, job) => sum + job.monthlyIncome, 0)) }}
                    </div>
                    <div class="text-xs text-green-600">
                      本月
                    </div>
                  </div>
                </div>
              </div>

              <!-- 占位空间保持对齐 -->
              <div class="h-20" />
            </div>
          </div>

          <!-- 副业自媒体 -->
          <div class="space-y-4">
            <div class="flex items-center mb-4">
              <Icon name="lucide:users" class="w-6 h-6 text-pink-600 mr-3" />
              <h2 class="text-lg font-semibold text-gray-800">
                副业自媒体
              </h2>
            </div>

            <div class="space-y-3">
              <!-- 总粉丝数 -->
              <div class="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Icon name="lucide:user-plus" class="w-5 h-5 text-pink-600 mr-2" />
                    <span class="text-sm font-medium text-pink-800">总粉丝</span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-pink-700">
                      {{ formatNumber(socialMedia.reduce((sum, platform) => sum + platform.followers, 0)) }}
                    </div>
                    <div class="text-xs text-pink-600">
                      {{ socialMedia.length }}个平台
                    </div>
                  </div>
                </div>
              </div>

              <!-- 占位空间保持对齐 -->
              <div class="h-32" />
            </div>
          </div>
        </div>
      </div>
    </VBFadeContent>

    <!-- 详细信息区域 - 可选展开 -->
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 兼职项目列表 -->
      <div class="dashboard-card bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Icon name="lucide:briefcase" class="w-5 h-5 text-blue-500 mr-2" />
          兼职项目详情
        </h3>
        <div class="space-y-3">
          <div v-for="job in sideJobs" :key="job.id" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <div class="font-medium text-slate-800">
                {{ job.name }}
              </div>
              <div class="text-sm text-slate-500">
                {{ job.timeRange }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-green-600">
                ¥{{ formatNumber(job.monthlyIncome) }}
              </div>
              <div class="text-xs text-slate-500">
                {{ job.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 信息流 - 精简版 -->
      <div class="dashboard-card bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Icon name="lucide:rss" class="w-5 h-5 text-orange-500 mr-2" />
          最新资讯
        </h3>
        <div class="space-y-3">
          <div v-for="item in newsFeeds.slice(0, 4)" :key="item.title" class="flex items-start justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <div class="flex-1">
              <div class="font-medium text-slate-800 text-sm line-clamp-1">
                {{ item.title }}
              </div>
              <div class="text-xs text-slate-500 mt-1">
                {{ item.source }}
              </div>
            </div>
            <div class="text-xs text-slate-400 ml-2">
              {{ item.time }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
