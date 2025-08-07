<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTauriSQL } from '~/composables/useTauriSQL'
import { useTauriStore } from '~/composables/useTauriStore'

// 页面标题
useHead({
  title: '设置 - 社区服务中心',
})

// 存储服务
const store = useTauriStore()
const sql = useTauriSQL()

// 响应式数据
const isLoading = ref(false)
const error = ref<string | null>(null)

// 服务器配置
const serverConfig = ref({
  baseUrls: [] as Array<{ id: string, name: string, url: string, description?: string }>,
  umamiApiBaseUrl: '',
  dynamicApiBaseUrl: '',
})

// 初始化数据
onMounted(async () => {
  try {
    await store.initStore()
    await sql.initDatabase()
    await loadSettings()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '初始化失败'
  }
})

// 加载设置
async function loadSettings() {
  try {
    isLoading.value = true

    // 从 Tauri Store 加载服务器配置
    const serverData = await store.getItem<typeof serverConfig.value>('server_config')
    if (serverData) {
      serverConfig.value = serverData
    }
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '加载设置失败'
  }
  finally {
    isLoading.value = false
  }
}

// 跳转到服务器配置页面
function goToServerConfig() {
  navigateTo('/settings/server-config')
}
</script>

<template>
  <div class="pixel-dashboard px-3 py-4 md:px-6 md:py-8 max-w-5xl mx-auto">
    <!-- 像素风格页面头部 -->
    <div class="pixel-header">
      <div class="pixel-title">
        <span class="pixel-title text-[var(--pixel-text-primary)]">
          <span class="pixel-icon">⚙️</span>
          <span>设置</span>
        </span>
      </div>
    </div>

    <div>
      <!-- 主要内容区域 -->
      <div class="pixel-content">
        <!-- 错误提示 -->
        <div v-if="error" class="pixel-card mb-3 md:mb-4 border-[var(--pixel-red)] bg-red-900/20">
          <div class="pixel-card-header">
            <span class="pixel-card-title text-[var(--pixel-red)] text-xs md:text-sm">⚠️ ERROR</span>
          </div>
          <p class="text-[var(--pixel-red)] font-mono text-xs md:text-sm">
            {{ error }}
          </p>
        </div>

        <!-- 服务器配置 -->
        <div class="pixel-card mb-4">
          <div class="pixel-card-header flex justify-between items-center">
            <span class="pixel-card-title text-[var(--pixel-text-primary)]">🖥️ 服务器配置</span>
            <!-- 右上角设置按钮 -->
            <Button
              class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 font-mono uppercase tracking-wider text-xs md:text-sm"
              @click="goToServerConfig"
            >
              <Icon name="pixelarticons:server" size="1.5em" />
            </Button>
          </div>

          <!-- 当前配置显示 -->
          <div v-if="serverConfig.baseUrls.length > 0" class="space-y-4 mb-6">
            <div class="text-[var(--pixel-text-secondary)] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              已配置的服务器
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="baseUrl in serverConfig.baseUrls"
                :key="baseUrl.id"
                class="pixel-card bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border-light)] p-3"
              >
                <div class="flex items-center gap-2 mb-2">
                  <Badge class="bg-[var(--pixel-blue)] text-[var(--pixel-text-primary)] font-mono border-[var(--pixel-border)] text-xs">
                    {{ baseUrl.name }}
                  </Badge>
                </div>
                <p class="text-[var(--pixel-text-primary)] text-xs font-mono break-all mb-1">
                  {{ baseUrl.url }}
                </p>
                <p v-if="baseUrl.description" class="text-[var(--pixel-text-secondary)] text-xs font-mono">
                  {{ baseUrl.description }}
                </p>
              </div>
            </div>
          </div>
          <!-- 空状态 -->
          <div v-if="serverConfig.baseUrls.length === 0" class="text-center py-8">
            <div class="text-[var(--pixel-text-muted)] mb-4">
              <Icon name="lucide:server-off" class="w-12 h-12 mx-auto mb-4" />
            </div>
            <p class="text-[var(--pixel-text-muted)] font-mono text-sm mb-4">
              还没有配置任何服务器
            </p>
            <Button
              class="pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80 font-mono uppercase tracking-wider"
              @click="goToServerConfig"
            >
              <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
              添加服务器
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
