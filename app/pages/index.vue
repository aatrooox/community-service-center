<script setup lang="ts">
import { gsap } from 'gsap'

// 设置页面标题
useHead({
  title: '个人数据面板',
})

// 使用灵动岛 composable
const {
  // setDynamicIslandRef,
  showNotification: showNotificationMessage,
  showPersistentMessage,
} = useDynamicIsland()

// 使用 Toast composable
const { success, error, warning, info, message, loading, promise } = useToast()

// 灵动岛组件引用
// const dynamicIslandRef = ref()

// 示例：显示通知消息
function showNotification() {
  showNotificationMessage('您有一条新的社区通知', {
    title: '新消息',
    icon: 'lucide:bell',
    duration: 3,
    showProgress: true,
  })
}

// 示例：显示持续消息
function _showPersistentMessage() {
  showPersistentMessage('今日晴朗，温度 25°C', {
    id: 'weather',
    title: '天气信息',
    icon: 'lucide:sun',
  })
}

// Toast 测试函数
function testToastSuccess() {
  success('操作成功！', {
    description: '您的数据已成功保存',
    action: {
      label: '查看',
      onClick: () => console.log('查看详情')
    }
  })
}

function testToastError() {
  error('操作失败！', {
    description: '网络连接异常，请稍后重试'
  })
}

function testToastWarning() {
  warning('注意！', {
    description: '您的存储空间即将用完'
  })
}

function testToastInfo() {
  info('系统提示', {
    description: '新版本已发布，建议及时更新'
  })
}

function testToastLoading() {
  loading('正在处理...', {
    description: '请稍等，数据正在同步中'
  })
}

function testToastPromise() {
  const mockPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.5 ? resolve('成功') : reject('失败')
    }, 2000)
  })
  
  promise(mockPromise, {
    loading: '正在处理请求...',
    success: '请求处理成功！',
    error: '请求处理失败！'
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

// const sideJobs = ref([
//   {
//     id: 1,
//     name: '前端开发咨询',
//     timeRange: '2024.01 - 至今',
//     status: '进行中',
//     features: ['Vue.js开发', 'UI设计', '性能优化'],
//     monthlyIncome: 8500,
//   },
//   {
//     id: 2,
//     name: '技术写作',
//     timeRange: '2023.10 - 至今',
//     status: '进行中',
//     features: ['技术博客', '教程编写', '代码审查'],
//     monthlyIncome: 3200,
//   },
// ])

// const socialMedia = ref([
//   {
//     platform: '微信公众号',
//     followers: 12450,
//     change: '+234',
//     trend: 'up',
//     icon: 'lucide:message-circle',
//   },
//   {
//     platform: '知乎',
//     followers: 8920,
//     change: '+156',
//     trend: 'up',
//     icon: 'lucide:help-circle',
//   },
//   {
//     platform: 'B站',
//     followers: 5680,
//     change: '-23',
//     trend: 'down',
//     icon: 'lucide:video',
//   },
//   {
//     platform: '小红书',
//     followers: 3240,
//     change: '+89',
//     trend: 'up',
//     icon: 'lucide:heart',
//   },
// ])

// const newsFeeds = ref([
//   {
//     type: 'blog',
//     title: 'Vue 3.4 正式发布，带来重大性能提升',
//     source: '尤雨溪的博客',
//     time: '2小时前',
//     isNew: true,
//   },
//   {
//     type: 'forum',
//     title: '如何在2024年成为更好的开发者？',
//     source: 'V2EX',
//     time: '4小时前',
//     isHot: true,
//   },
//   {
//     type: 'news',
//     title: 'OpenAI发布GPT-4 Turbo，成本降低3倍',
//     source: '36氪',
//     time: '6小时前',
//     isNew: true,
//   },
//   {
//     type: 'blog',
//     title: '前端架构设计的最佳实践分享',
//     source: '阮一峰的网络日志',
//     time: '1天前',
//     isNew: false,
//   },
// ])

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
  // 设置灵动岛引用
  // setDynamicIslandRef(dynamicIslandRef)

  nextTick(() => {
    animateCards()
    animateProgress('.progress-bar', (lifeData.value.weeklyWorkouts / lifeData.value.weeklyGoal) * 100)
  })

  // 页面加载时显示欢迎消息
  setTimeout(() => {
    showNotification()
  }, 2000)
})

// 格式化数字
// function formatNumber(num: number) {
//   return num.toLocaleString()
// }
</script>

<template>
  <div class="min-h-screen bg-gray-950">
    <!-- 顶部渐变区域 -->
    <div class="bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 p-6 pb-8">
      <!-- 顶部用户信息区域 -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <!-- 用户头像 -->
          <div class="w-16 h-16 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <img
              src="https://zzao.club/favicon.ico"
              alt="User Avatar"
              class="w-14 h-14 rounded-full object-cover"
            >
          </div>

          <!-- 用户信息 -->
          <div>
            <h1 class="text-2xl font-bold text-white">
              Aatrox
            </h1>
            <!-- <div class="flex gap-2 mt-2">
              <button class="px-3 py-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-black/30 transition-colors">
                <Icon name="lucide:copy" class="w-4 h-4 inline mr-1" />
                Copy Address
              </button>
              <button class="px-3 py-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-black/30 transition-colors">
                <Icon name="lucide:qr-code" class="w-4 h-4 inline mr-1" />
                Receive
              </button>
            </div> -->
          </div>
        </div>

        <!-- Toast 测试按钮 -->
        <div class="flex flex-wrap gap-2">
          <button 
            @click="testToastSuccess"
            class="px-3 py-1 bg-emerald-600/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-emerald-600 transition-colors"
          >
            成功
          </button>
          <button 
            @click="testToastError"
            class="px-3 py-1 bg-red-600/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-red-600 transition-colors"
          >
            错误
          </button>
          <button 
            @click="testToastWarning"
            class="px-3 py-1 bg-orange-600/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-orange-600 transition-colors"
          >
            警告
          </button>
          <button 
            @click="testToastInfo"
            class="px-3 py-1 bg-blue-600/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-blue-600 transition-colors"
          >
            信息
          </button>
          <button 
            @click="testToastLoading"
            class="px-3 py-1 bg-purple-600/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-purple-600 transition-colors"
          >
            加载
          </button>
          <button 
            @click="testToastPromise"
            class="px-3 py-1 bg-cyan-600/80 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm hover:bg-cyan-600 transition-colors"
          >
            Promise
          </button>
        </div>
      </div>

      <!-- Toast 测试说明 -->
      <div class="mb-6 p-4 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg">
        <h3 class="text-white font-semibold mb-2">Toast 消息测试</h3>
        <p class="text-white/80 text-sm">点击上方按钮测试不同类型的 Toast 消息，消息将显示在页面顶部中间位置。</p>
      </div>

        <!-- 灵动岛组件 -->
        <!-- <AppDynamicIsland ref="dynamicIslandRef" /> -->

        <!-- 右侧功能按钮 -->
        <div class="flex gap-3">
          <button
            class="p-3 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-black/30 transition-colors"
            @click="showNotification"
          >
            <Icon name="lucide:bell" class="w-5 h-5" />
          </button>
          <button
            class="p-3 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-black/30 transition-colors"
            @click="_showPersistentMessage"
          >
            <Icon name="lucide:scan" class="w-5 h-5" />
          </button>
          <NuxtLink
            to="/example"
            class="p-3 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-black/30 transition-colors"
            title="查看更多示例"
          >
            <Icon name="lucide:sparkles" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>

      <!-- 主要余额卡片 -->
      <div class="bg-black/80 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl">
        <!-- 顶部余额信息 - 响应式布局 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <p class="text-white/60 text-sm mb-1">
              近七日平均消耗
            </p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white">
              32,128.80 kcal
            </h2>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-emerald-400 text-base sm:text-lg font-semibold">+3.00%</span>
            <Icon name="lucide:trending-up" class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
        </div>

        <!-- 数据展示组 - 响应式网格 -->
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
    <div class="p-6 rounded-t-3xl bg-gray-950">
      <!-- 主要布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 资产列表 -->
        <div class="lg:col-span-2">
          <!-- 标签切换 -->
          <div class="flex space-x-1 mb-6 bg-gray-800/60 backdrop-blur-sm rounded-2xl p-1">
            <button class="flex-1 py-3 px-4 bg-cyan-600 text-white rounded-xl font-medium transition-all">
              Crypto Assets
            </button>
            <button class="flex-1 py-3 px-4 text-white/60 rounded-xl font-medium transition-all hover:text-white">
              Stocks
            </button>
            <button class="flex-1 py-3 px-4 text-white/60 rounded-xl font-medium transition-all hover:text-white">
              NFTs
            </button>
          </div>

          <!-- 资产列表 -->
          <div class="space-y-4">
            <!-- Tether -->
            <div class="bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/80 transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <span class="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h3 class="text-white font-semibold">
                    Tether
                  </h3>
                  <p class="text-white/60 text-sm">
                    MCap $93.54
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-emerald-400 text-sm">↗ 0.05%</span>
                  <div class="w-16 h-8 bg-emerald-500/20 rounded flex items-center justify-center">
                    <div class="w-12 h-1 bg-emerald-400 rounded" />
                  </div>
                </div>
                <p class="text-white font-bold">
                  $0.9999
                </p>
              </div>
            </div>

            <!-- Bitcoin -->
            <div class="bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/80 transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <Icon name="lucide:bitcoin" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-white font-semibold">
                    Bitcoin
                  </h3>
                  <p class="text-white/60 text-sm">
                    MCap $893.43
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-red-400 text-sm">↘ 0.02%</span>
                  <div class="w-16 h-8 bg-red-500/20 rounded flex items-center justify-center">
                    <div class="w-12 h-1 bg-red-400 rounded" />
                  </div>
                </div>
                <p class="text-white font-bold">
                  $28,066.71
                </p>
              </div>
            </div>

            <!-- Achain -->
            <div class="bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800/80 transition-all">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <span class="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 class="text-white font-semibold">
                    Achain
                  </h3>
                  <p class="text-white/60 text-sm">
                    MCap $172.22
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="text-emerald-400 text-sm">↗ 0.14%</span>
                  <div class="w-16 h-8 bg-emerald-500/20 rounded flex items-center justify-center">
                    <div class="w-12 h-1 bg-emerald-400 rounded" />
                  </div>
                </div>
                <p class="text-white font-bold">
                  $0.001395
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：快捷功能 -->
        <div class="space-y-6">
          <!-- 快速操作 -->
          <div class="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6">
            <h3 class="text-white font-semibold mb-4">
              快速操作
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <button class="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all">
                <Icon name="lucide:send" class="w-6 h-6 text-white mx-auto mb-2" />
                <span class="text-white text-sm">转账</span>
              </button>
              <button class="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all">
                <Icon name="lucide:download" class="w-6 h-6 text-white mx-auto mb-2" />
                <span class="text-white text-sm">收款</span>
              </button>
              <button class="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all">
                <Icon name="lucide:credit-card" class="w-6 h-6 text-white mx-auto mb-2" />
                <span class="text-white text-sm">充值</span>
              </button>
              <button class="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-all">
                <Icon name="lucide:history" class="w-6 h-6 text-white mx-auto mb-2" />
                <span class="text-white text-sm">历史</span>
              </button>
            </div>
          </div>

          <!-- 最近交易 -->
          <div class="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6">
            <h3 class="text-white font-semibold mb-4">
              最近交易
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Icon name="lucide:arrow-down" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-white text-sm font-medium">
                      收到转账
                    </p>
                    <p class="text-white/60 text-xs">
                      来自 0x1a...4b2c
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-emerald-400 font-semibold">
                    +¥1,250.00
                  </p>
                  <p class="text-white/60 text-xs">
                    2小时前
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between py-2">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Icon name="lucide:arrow-up" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-white text-sm font-medium">
                      发送转账
                    </p>
                    <p class="text-white/60 text-xs">
                      发送至 0x9f...8e1d
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-red-400 font-semibold">
                    -¥850.00
                  </p>
                  <p class="text-white/60 text-xs">
                    5小时前
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between py-2">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icon name="lucide:credit-card" class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-white text-sm font-medium">
                      充值
                    </p>
                    <p class="text-white/60 text-xs">
                      银行卡充值
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-emerald-400 font-semibold">
                    +¥5,000.00
                  </p>
                  <p class="text-white/60 text-xs">
                    昨天
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
