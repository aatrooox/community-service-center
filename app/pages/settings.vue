<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTauriSQL } from '~/composables/useTauriSQL'
import { useTauriStore } from '~/composables/useTauriStore'

// 页面标题
useHead({
  title: '设置 - 社区服务中心',
})

// 存储服务
const store = useTauriStore()
const sql = useTauriSQL()
const { toast, success, error: showError } = useToast()

// 响应式数据
const isLoading = ref(false)
const error = ref<string | null>(null)

// 个人信息
const personalInfo = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  bio: '',
})

// 服务器配置
const serverConfig = ref({
  baseUrls: [] as Array<{ id: string, name: string, url: string, description?: string }>,
  umamiApiBaseUrl: '',
  dynamicApiBaseUrl: '',
})

// Token 管理
const serverTokens = ref<Array<{
  id: string
  serverName: string
  serverUrl: string
  tokenName: string
  tokenValue: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}>>([])

// 新增 BaseURL 表单
const newBaseUrl = ref({
  name: '',
  url: '',
  description: '',
})

// 新增 Token 表单
const newToken = ref({
  serverUrl: '',
  tokenName: '',
  tokenValue: '',
  description: '',
})

const isTokenDialogOpen = ref(false)

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

    // 从 Tauri Store 加载个人信息
    const personalData = await store.getItem<typeof personalInfo.value>('personal_info')
    if (personalData) {
      personalInfo.value = personalData
    }

    // 从 Tauri Store 加载服务器配置
    const serverData = await store.getItem<typeof serverConfig.value>('server_config')
    if (serverData) {
      serverConfig.value = serverData
    }

    // 从 SQLite 加载服务器 Token
    await loadServerTokens()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '加载设置失败'
  }
  finally {
    isLoading.value = false
  }
}

// 加载服务器 Token
async function loadServerTokens() {
  try {
    const tokens = await sql.getAllServerTokens()
    serverTokens.value = tokens
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '加载服务器 Token 失败'
  }
}

// 保存个人信息
// async function savePersonalInfo() {
//   try {
//     isLoading.value = true
//     await store.setItem('personal_info', personalInfo.value)

//     // 同时保存到 SQLite（可选）
//     await sql.setSetting('personal_name', personalInfo.value.name)
//     await sql.setSetting('personal_email', personalInfo.value.email)
//     await sql.setSetting('personal_phone', personalInfo.value.phone)

//     // 显示成功消息
//     success('个人信息保存成功')
//   }
//   catch (err) {
//     error.value = err instanceof Error ? err.message : '保存个人信息失败'
//   }
//   finally {
//     isLoading.value = false
//   }
// }

// 添加新的 BaseURL
async function addBaseUrl() {
  if (!newBaseUrl.value.name || !newBaseUrl.value.url) {
    error.value = '请填写名称和URL'
    return
  }

  try {
    const id = Date.now().toString()
    const newUrl = {
      id,
      name: newBaseUrl.value.name,
      url: newBaseUrl.value.url,
      description: newBaseUrl.value.description,
    }

    serverConfig.value.baseUrls.push(newUrl)
    await store.setItem('server_config', serverConfig.value)

    // 清空表单
    newBaseUrl.value = { name: '', url: '', description: '' }

    success('BaseURL 添加成功')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '添加 BaseURL 失败'
  }
}

// 删除 BaseURL
async function removeBaseUrl(id: string) {
  try {
    serverConfig.value.baseUrls = serverConfig.value.baseUrls.filter(url => url.id !== id)
    await store.setItem('server_config', serverConfig.value)

    success('BaseURL 删除成功')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '删除 BaseURL 失败'
  }
}

// 保存服务器配置
async function saveServerConfig() {
  try {
    isLoading.value = true
    await store.setItem('server_config', serverConfig.value)

    // 同时保存到 SQLite
    await sql.setSetting('umami_api_base_url', serverConfig.value.umamiApiBaseUrl)
    await sql.setSetting('dynamic_api_base_url', serverConfig.value.dynamicApiBaseUrl)

    success('服务器配置保存成功')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '保存服务器配置失败'
  }
  finally {
    isLoading.value = false
  }
}

// 重置所有设置
function confirmResetAllSettings() {
  toast('确定要重置所有设置吗？此操作不可撤销。', {
    action: {
      label: '确认重置',
      onClick: () => resetAllSettings(),
    },
    cancel: {
      label: '取消',
    },
    duration: 10000,
  })
}

async function resetAllSettings() {
  try {
    isLoading.value = true

    // 清空 Tauri Store
    await store.clearStore()

    // 重置本地数据
    personalInfo.value = { name: '', email: '', phone: '', address: '', bio: '' }
    serverConfig.value = { baseUrls: [], umamiApiBaseUrl: '', dynamicApiBaseUrl: '' }
    serverTokens.value = []

    success('所有设置已重置')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '重置设置失败'
    showError(error.value)
  }
  finally {
    isLoading.value = false
  }
}

// Token 管理方法
async function addServerToken() {
  if (!newToken.value.serverUrl || !newToken.value.tokenName || !newToken.value.tokenValue) {
    error.value = '请填写服务器URL、Token名称和Token值'
    return
  }

  try {
    // 首先确保服务器存在于 servers 表中
    const selectedBaseUrl = serverConfig.value.baseUrls.find(url => url.url === newToken.value.serverUrl)
    if (selectedBaseUrl) {
      await sql.createServer({
        name: selectedBaseUrl.name,
        url: selectedBaseUrl.url,
        description: selectedBaseUrl.description,
        isActive: true,
      })
    }

    const tokenData = {
      serverUrl: newToken.value.serverUrl,
      tokenName: newToken.value.tokenName,
      tokenValue: newToken.value.tokenValue,
      description: newToken.value.description,
      isActive: true,
    }

    await sql.createServerToken(tokenData)
    await loadServerTokens()

    // 清空表单
    newToken.value = { serverUrl: '', tokenName: '', tokenValue: '', description: '' }
    isTokenDialogOpen.value = false

    success('服务器 Token 添加成功')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '添加服务器 Token 失败'
    showError(error.value)
  }
}

async function deleteServerToken(id: number) {
  try {
    await sql.deleteServerToken(id)
    await loadServerTokens()
    success('服务器 Token 删除成功')
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '删除服务器 Token 失败'
  }
}

async function toggleTokenStatus(id: number, isActive: boolean) {
  try {
    await sql.updateServerToken(id, { isActive })
    await loadServerTokens()
    success(`Token 已${isActive ? '启用' : '禁用'}`)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '更新 Token 状态失败'
  }
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
        <!-- <div class="pixel-status">
          <span class="pixel-status-dot online" />
          <span>ACTIVE</span>
        </div> -->
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

        <!-- BaseURL 管理 -->
        <div class="pixel-card mb-3 md:mb-4">
          <div class="pixel-card-header">
            <span class="pixel-card-title text-[var(--pixel-text-primary)] text-sm md:text-base">🔗 BASEURL 管理</span>
          </div>
          <div class="space-y-4">
            <!-- 添加新 BaseURL -->
            <div class="pixel-card bg-[var(--pixel-bg-tertiary)] border-[var(--pixel-border-light)]">
              <div class="pixel-card-header">
                <span class="pixel-card-title text-[var(--pixel-text-primary)] text-xs md:text-sm">➕ 增加 BASEURL</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div class="space-y-2">
                  <label class="text-[var(--pixel-text-secondary)] text-xs font-mono font-bold uppercase tracking-wider">名称</label>
                  <Input
                    v-model="newBaseUrl.name"
                    placeholder="UMAMI API"
                    class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono placeholder-[var(--pixel-text-muted)] text-xs md:text-sm"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-[var(--pixel-text-secondary)] text-xs font-mono font-bold uppercase tracking-wider">URL</label>
                  <Input
                    v-model="newBaseUrl.url"
                    placeholder="https://api.example.com"
                    class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono placeholder-[var(--pixel-text-muted)] text-xs md:text-sm"
                  />
                </div>
              </div>
              <div class="space-y-2 mb-3 md:mb-4">
                <label class="text-[var(--pixel-text-secondary)] text-xs font-mono font-bold uppercase tracking-wider">描述</label>
                <Input
                  v-model="newBaseUrl.description"
                  placeholder="API 用途描述"
                  class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono placeholder-[var(--pixel-text-muted)] text-xs md:text-sm"
                />
              </div>
              <Button
                :disabled="!newBaseUrl.name || !newBaseUrl.url"
                class="pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80 font-mono uppercase tracking-wider text-xs md:text-sm"
                @click="addBaseUrl"
              >
                <Icon name="lucide:plus" class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span class="hidden md:inline">增加 BASEURL</span>
                <span class="md:hidden">增加</span>
              </Button>
            </div>

            <!-- BaseURL 列表 -->
            <div v-if="serverConfig.baseUrls.length > 0" class="space-y-3">
              <h3 class="text-[var(--pixel-text-primary)] font-mono font-bold uppercase tracking-wider text-xs md:text-sm">
                📋 已配置 BASEURL
              </h3>
              <div class="space-y-2">
                <div
                  v-for="baseUrl in serverConfig.baseUrls"
                  :key="baseUrl.id"
                  class="pixel-card bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border-light)] flex items-center justify-between p-2 md:p-3"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 md:mb-2">
                      <Badge class="bg-[var(--pixel-blue)] text-[var(--pixel-text-primary)] font-mono border-[var(--pixel-border)] text-xs">
                        {{ baseUrl.name }}
                      </Badge>
                    </div>
                    <p class="text-[var(--pixel-text-primary)] text-xs md:text-sm font-mono break-all">
                      {{ baseUrl.url }}
                    </p>
                    <p v-if="baseUrl.description" class="text-[var(--pixel-text-secondary)] text-xs font-mono mt-1">
                      {{ baseUrl.description }}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    class="pixel-btn bg-[var(--pixel-red)] hover:bg-[var(--pixel-red)]/80 font-mono text-xs flex-shrink-0 ml-2"
                    @click="removeBaseUrl(baseUrl.id)"
                  >
                    <Icon name="lucide:trash" class="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务器配置 -->
        <div class="pixel-card mb-4">
          <div class="pixel-card-header">
            <span class="pixel-card-title text-[var(--pixel-text-primary)]">🖥️ 服务器配置</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="space-y-2">
              <label class="text-[var(--pixel-text-secondary)] text-xs font-mono font-bold uppercase tracking-wider">UMAMI API BASEURL</label>
              <Select v-model="serverConfig.umamiApiBaseUrl">
                <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                  <SelectValue placeholder="选择 UMAMI API BASEURL" />
                </SelectTrigger>
                <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                  <SelectItem
                    v-for="baseUrl in serverConfig.baseUrls"
                    :key="baseUrl.id"
                    :value="baseUrl.url"
                    class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                  >
                    {{ baseUrl.name }} - {{ baseUrl.url }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-[var(--pixel-text-secondary)] text-xs font-mono font-bold uppercase tracking-wider">DYNAMIC API BASEURL</label>
              <Select v-model="serverConfig.dynamicApiBaseUrl">
                <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                  <SelectValue placeholder="SELECT DYNAMIC API BASEURL" />
                </SelectTrigger>
                <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                  <SelectItem
                    v-for="baseUrl in serverConfig.baseUrls"
                    :key="baseUrl.id"
                    :value="baseUrl.url"
                    class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                  >
                    {{ baseUrl.name }} - {{ baseUrl.url }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            :disabled="isLoading"
            class="pixel-btn bg-[var(--pixel-blue)] hover:bg-[var(--pixel-blue)]/80 font-mono uppercase tracking-wider"
            @click="saveServerConfig"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            保存服务器配置
          </Button>
        </div>

        <!-- Token 管理 -->
        <div class="pixel-card mb-3 md:mb-4">
          <div class="pixel-card-header">
            <span class="pixel-card-title text-[var(--pixel-text-primary)] text-sm md:text-base mr-2">🔑 TOKEN 管理</span>
            <Button
              class="pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80 font-mono uppercase tracking-wider text-xs md:text-sm"
              @click="isTokenDialogOpen = true"
            >
              <Icon name="lucide:plus" class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span class="hidden md:inline">TOKEN</span>
            </Button>
          </div>

          <!-- Token 列表 -->
          <div v-if="serverTokens.length > 0" class="space-y-3">
            <div
              v-for="token in serverTokens"
              :key="token.id"
              class="pixel-card bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border-light)] p-2 md:p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <Badge class="bg-[var(--pixel-blue)] text-[var(--pixel-text-primary)] font-mono border-[var(--pixel-border)] text-xs">
                      {{ token.serverName || 'SERVER' }}
                    </Badge>
                    <Badge
                      :class="{
                        'bg-[var(--pixel-green)] text-[var(--pixel-text-primary)]': token.isActive,
                        'bg-[var(--pixel-gray)] text-[var(--pixel-text-muted)]': !token.isActive,
                      }"
                      class="font-mono border-[var(--pixel-border)] text-xs"
                    >
                      {{ token.isActive ? 'ACTIVE' : 'INACTIVE' }}
                    </Badge>
                  </div>
                  <h4 class="text-[var(--pixel-text-primary)] font-mono font-bold text-xs md:text-sm mb-1">
                    {{ token.tokenName }}
                  </h4>
                  <p class="text-[var(--pixel-text-secondary)] text-xs font-mono mb-1 break-all">
                    {{ token.serverUrl }}
                  </p>
                  <p class="text-[var(--pixel-text-muted)] text-xs font-mono mb-2">
                    TOKEN: {{ token.tokenValue.substring(0, 8) }}***
                  </p>
                  <p v-if="token.description" class="text-[var(--pixel-text-secondary)] text-xs font-mono">
                    {{ token.description }}
                  </p>
                </div>
                <div class="flex gap-1 md:gap-2">
                  <Button
                    size="sm"
                    :class="{
                      'pixel-btn bg-[var(--pixel-yellow)] hover:bg-[var(--pixel-yellow)]/80': token.isActive,
                      'pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80': !token.isActive,
                    }"
                    class="font-mono text-xs"
                    @click="toggleTokenStatus(Number(token.id), !token.isActive)"
                  >
                    <span class="hidden md:inline">{{ token.isActive ? 'DISABLE' : 'ENABLE' }}</span>
                    <span class="md:hidden">{{ token.isActive ? 'OFF' : 'ON' }}</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    class="pixel-btn bg-[var(--pixel-red)] hover:bg-[var(--pixel-red)]/80 font-mono"
                    @click="deleteServerToken(Number(token.id))"
                  >
                    <Icon name="lucide:trash" class="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 md:py-8">
            <p class="text-[var(--pixel-text-muted)] font-mono text-xs md:text-sm">
              暂无 TOKEN 配置
            </p>
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="pixel-card border-[var(--pixel-red)] bg-red-900/10">
          <div class="pixel-card-header">
            <span class="pixel-card-title text-[var(--pixel-red)] text-sm md:text-base">⚠️ 危险操作</span>
          </div>
          <div class="space-y-3 md:space-y-4">
            <p class="text-[var(--pixel-text-secondary)] font-mono text-xs md:text-sm">
              <span class="md:hidden">重置所有设置为默认值。此操作无法撤销。</span>
              <span class="hidden md:inline">重置所有设置为默认值。此操作无法撤销。</span>
            </p>
            <Button
              variant="destructive"
              :disabled="isLoading"
              class="pixel-btn bg-[var(--pixel-red)] hover:bg-[var(--pixel-red)]/80 font-mono uppercase tracking-wider text-xs md:text-sm"
              @click="confirmResetAllSettings"
            >
              <Icon name="lucide:trash-2" class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span class="hidden md:inline">重置所有设置</span>
              <span class="md:hidden">重置所有</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Token 添加抽屉 -->
    <Drawer v-model:open="isTokenDialogOpen">
      <DrawerContent class="pixel-card border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg-secondary)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="pixel-text-cyan text-base md:text-lg font-bold uppercase tracking-wider">
            🔑 添加服务器 TOKEN
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono text-xs md:text-sm">
            为指定服务器添加访问 TOKEN
          </DrawerDescription>
        </DrawerHeader>
        <div class="space-y-4 p-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">SERVER</label>
            <Select v-model="newToken.serverUrl">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                <SelectValue placeholder="选择服务器" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem
                  v-for="baseUrl in serverConfig.baseUrls"
                  :key="baseUrl.id"
                  :value="baseUrl.url"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                >
                  {{ baseUrl.name }} - {{ baseUrl.url }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">TOKEN NAME</label>
            <Input
              v-model="newToken.tokenName"
              placeholder="API KEY, BEARER TOKEN"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono text-xs md:text-sm"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">TOKEN VALUE</label>
            <Input
              v-model="newToken.tokenValue"
              type="password"
              placeholder="ENTER TOKEN VALUE"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono text-xs md:text-sm"
            />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">DESCRIPTION</label>
            <Textarea
              v-model="newToken.description"
              placeholder="TOKEN PURPOSE DESCRIPTION"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono text-xs md:text-sm"
            />
          </div>
        </div>
        <DrawerFooter>
          <div class="flex justify-end gap-2">
            <DrawerClose as-child>
              <Button
                variant="outline"
                class="pixel-btn border-2 border-[var(--pixel-border)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)] font-mono uppercase tracking-wider text-xs md:text-sm"
                @click="isTokenDialogOpen = false"
              >
                取消
              </Button>
            </DrawerClose>
            <Button
              :disabled="!newToken.serverUrl || !newToken.tokenName || !newToken.tokenValue"
              class="pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80 text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider text-xs md:text-sm"
              @click="addServerToken"
            >
              创建
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>
