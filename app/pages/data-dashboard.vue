<script setup lang="ts">
import type { ApiResponse } from '~/composables/useAPIService'
import { useAPIService } from '~/composables/useAPIService'
import { useTauriSQL } from '~/composables/useTauriSQL'

// ============= 页面配置 =============

definePageMeta({
  title: '数据看板',
  layout: 'default',
})

// ============= 组合式函数 =============

const sqlService = useTauriSQL()
const apiService = useAPIService()

// ============= 响应式数据 =============

const servers = ref<any[]>([])
const selectedServerUrl = ref('')
const serverData = ref<Record<string, ApiResponse>>({})
const allServersData = ref<Record<string, Record<string, ApiResponse>>>({})
const isLoading = ref(false)
const error = ref<string | null>(null)
const refreshInterval = ref<NodeJS.Timeout | null>(null)
const autoRefresh = ref(false)
const refreshRate = ref(30) // 秒

// ============= 计算属性 =============

const selectedServerName = computed(() => {
  const server = servers.value.find(s => s.url === selectedServerUrl.value)
  return server?.name || ''
})

const hasData = computed(() => {
  return Object.keys(serverData.value).length > 0
})

const dataEntries = computed(() => {
  return Object.entries(serverData.value).sort(([, a], [, b]) => {
    return a.endpoint.sortOrder - b.endpoint.sortOrder
  })
})

const allDataEntries = computed(() => {
  const entries: Array<{ serverName: string, endpointName: string, data: ApiResponse }> = []

  Object.entries(allServersData.value).forEach(([serverName, endpoints]) => {
    Object.entries(endpoints).forEach(([endpointName, data]) => {
      entries.push({ serverName, endpointName, data })
    })
  })

  return entries.sort((a, b) => {
    if (a.serverName !== b.serverName) {
      return a.serverName.localeCompare(b.serverName)
    }
    return a.data.endpoint.sortOrder - b.data.endpoint.sortOrder
  })
})

// ============= 方法 =============

/**
 * 加载服务器列表
 */
async function loadServers() {
  try {
    servers.value = await sqlService.getAllServers()
    if (servers.value.length > 0 && !selectedServerUrl.value) {
      selectedServerUrl.value = servers.value[0].url
    }
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载服务器失败'
    console.error('加载服务器失败:', err)
  }
}

/**
 * 加载服务器数据
 */
async function loadServerData(forceRefresh = false) {
  if (!selectedServerUrl.value) {
    serverData.value = {}
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const data = await apiService.fetchServerData(selectedServerUrl.value, {
      forceRefresh,
    })

    serverData.value = data
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载数据失败'
    console.error('加载服务器数据失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 加载所有服务器数据
 */
async function loadAllServersData(forceRefresh = false) {
  try {
    isLoading.value = true
    error.value = null

    const data = await apiService.fetchAllData({
      forceRefresh,
    })

    allServersData.value = data
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载所有数据失败'
    console.error('加载所有数据失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 刷新数据
 */
async function refreshData() {
  if (selectedServerUrl.value) {
    await loadServerData(true)
  }
  else {
    await loadAllServersData(true)
  }
}

/**
 * 格式化数据显示
 */
function formatDataForDisplay(data: any): string {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return JSON.stringify(parsed, null, 2)
    }
    catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 获取数据类型
 */
function getDataType(data: any): string {
  if (Array.isArray(data)) {
    return `数组 (${data.length} 项)`
  }
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data)
    return `对象 (${keys.length} 个字段)`
  }
  return typeof data
}

/**
 * 格式化时间
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('zh-CN')
}

/**
 * 设置自动刷新
 */
function toggleAutoRefresh() {
  if (autoRefresh.value) {
    startAutoRefresh()
  }
  else {
    stopAutoRefresh()
  }
}

/**
 * 开始自动刷新
 */
function startAutoRefresh() {
  stopAutoRefresh()
  refreshInterval.value = setInterval(() => {
    refreshData()
  }, refreshRate.value * 1000)
}

/**
 * 停止自动刷新
 */
function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

/**
 * 清理缓存
 */
async function clearCache() {
  try {
    await apiService.cleanupCache()
    await refreshData()
  }
  catch (err: any) {
    console.error('清理缓存失败:', err)
  }
}

// ============= 监听器 =============

watch(selectedServerUrl, async (newUrl) => {
  if (newUrl) {
    await loadServerData()
  }
  else {
    serverData.value = {}
  }
})

watch(refreshRate, () => {
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

// ============= 生命周期 =============

onMounted(async () => {
  await loadServers()
  if (selectedServerUrl.value) {
    await loadServerData()
  }
  else {
    await loadAllServersData()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <!-- 页面标题和控制栏 -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-orange-400 mb-2">
            数据看板
          </h1>
          <p class="text-gray-400">
            实时查看配置接口的数据
          </p>
        </div>

        <!-- 控制按钮 -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- 服务器选择 -->
          <select
            v-model="selectedServerUrl"
            class="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">
              所有服务器
            </option>
            <option
              v-for="server in servers"
              :key="server.url"
              :value="server.url"
            >
              {{ server.name }}
            </option>
          </select>

          <!-- 刷新按钮 -->
          <button
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            @click="refreshData"
          >
            <svg
              class="w-4 h-4"
              :class="{ 'animate-spin': isLoading }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ isLoading ? '刷新中...' : '刷新' }}
          </button>

          <!-- 自动刷新 -->
          <div class="flex items-center gap-2">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="autoRefresh"
                type="checkbox"
                class="sr-only"
                @change="toggleAutoRefresh"
              >
              <div class="relative">
                <div
                  class="block bg-gray-600 w-10 h-6 rounded-full transition-colors"
                  :class="autoRefresh ? 'bg-orange-600' : 'bg-gray-600'"
                />
                <div
                  class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"
                  :class="autoRefresh ? 'transform translate-x-4' : ''"
                />
              </div>
              <span class="ml-2 text-sm text-gray-300">
                自动刷新
              </span>
            </label>

            <select
              v-if="autoRefresh"
              v-model="refreshRate"
              class="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option :value="10">
                10秒
              </option>
              <option :value="30">
                30秒
              </option>
              <option :value="60">
                1分钟
              </option>
              <option :value="300">
                5分钟
              </option>
            </select>
          </div>

          <!-- 清理缓存 -->
          <button
            class="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            @click="clearCache"
          >
            清理缓存
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="mb-6 bg-red-900 border border-red-600 rounded-lg p-4"
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-red-300">{{ error }}</span>
      </div>
    </div>

    <!-- 数据展示区域 -->
    <div class="space-y-6">
      <!-- 单服务器数据 -->
      <div v-if="selectedServerUrl && hasData">
        <h2 class="text-xl font-semibold text-orange-400 mb-4">
          {{ selectedServerName }} - 数据列表
        </h2>

        <div class="grid gap-6">
          <div
            v-for="[endpointName, response] in dataEntries"
            :key="endpointName"
            class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            <!-- 接口信息头部 -->
            <div class="bg-gray-750 px-6 py-4 border-b border-gray-700">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold text-white">
                    {{ response.endpoint.name }}
                  </h3>
                  <p v-if="response.endpoint.description" class="text-gray-400 text-sm">
                    {{ response.endpoint.description }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2 text-sm">
                  <span
                    class="px-2 py-1 rounded-full text-xs"
                    :class="response.cached ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'"
                  >
                    {{ response.cached ? '缓存数据' : '实时数据' }}
                  </span>
                  <span class="px-2 py-1 bg-gray-600 text-gray-100 rounded-full text-xs">
                    {{ response.endpoint.method.toUpperCase() }}
                  </span>
                  <span class="text-gray-400">
                    {{ formatTime(response.timestamp) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 数据内容 -->
            <div class="p-6">
              <div class="mb-3">
                <span class="text-gray-400 text-sm">
                  数据类型: {{ getDataType(response.data) }}
                </span>
              </div>

              <!-- 数据预览 -->
              <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-gray-200 whitespace-pre-wrap">{{ formatDataForDisplay(response.data) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 所有服务器数据 -->
      <div v-else-if="!selectedServerUrl && allDataEntries.length > 0">
        <h2 class="text-xl font-semibold text-orange-400 mb-4">
          所有服务器数据
        </h2>

        <div class="grid gap-6">
          <div
            v-for="entry in allDataEntries"
            :key="`${entry.serverName}-${entry.endpointName}`"
            class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            <!-- 接口信息头部 -->
            <div class="bg-gray-750 px-6 py-4 border-b border-gray-700">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="px-2 py-1 bg-orange-600 text-orange-100 rounded text-xs font-medium">
                      {{ entry.serverName }}
                    </span>
                    <h3 class="text-lg font-semibold text-white">
                      {{ entry.data.endpoint.name }}
                    </h3>
                  </div>
                  <p v-if="entry.data.endpoint.description" class="text-gray-400 text-sm">
                    {{ entry.data.endpoint.description }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2 text-sm">
                  <span
                    class="px-2 py-1 rounded-full text-xs"
                    :class="entry.data.cached ? 'bg-blue-600 text-blue-100' : 'bg-green-600 text-green-100'"
                  >
                    {{ entry.data.cached ? '缓存数据' : '实时数据' }}
                  </span>
                  <span class="px-2 py-1 bg-gray-600 text-gray-100 rounded-full text-xs">
                    {{ entry.data.endpoint.method.toUpperCase() }}
                  </span>
                  <span class="text-gray-400">
                    {{ formatTime(entry.data.timestamp) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 数据内容 -->
            <div class="p-6">
              <div class="mb-3">
                <span class="text-gray-400 text-sm">
                  数据类型: {{ getDataType(entry.data.data) }}
                </span>
              </div>

              <!-- 数据预览 -->
              <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-gray-200 whitespace-pre-wrap">{{ formatDataForDisplay(entry.data.data) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="text-gray-500 mb-4">
          <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p class="text-gray-400 mb-4">
          {{ selectedServerUrl ? '该服务器还没有配置接口或数据获取失败' : '还没有配置任何服务器接口' }}
        </p>
        <div class="flex justify-center gap-3">
          <NuxtLink
            to="/api-config"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors"
          >
            配置接口
          </NuxtLink>
          <NuxtLink
            to="/server-config"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            配置服务器
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
