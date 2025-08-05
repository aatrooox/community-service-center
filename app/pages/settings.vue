<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
  <div class="container mx-auto pb-20 px-6 space-y-6 pt-10 sm:pt-4">
    <!-- 页面标题 -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        设置
      </h1>
      <p class="text-gray-600">
        管理个人信息和服务器配置
      </p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
      {{ error }}
    </div>
    <!-- BaseURL 管理 -->
    <Card class="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-gray-900 flex items-center gap-2">
          <Icon name="lucide:link" class="w-5 h-5" />
          BaseURL 管理
        </CardTitle>
        <CardDescription class="text-gray-600">
          管理服务器 API 的基础 URL 列表
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 添加新 BaseURL -->
        <div class="border border-gray-300 rounded-lg p-4 space-y-4">
          <h3 class="text-lg font-medium text-gray-900">
            添加新 BaseURL
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="url-name" class="text-gray-700 text-sm font-medium">名称</label>
              <Input
                id="url-name"
                v-model="newBaseUrl.name"
                placeholder="例如：Umami API"
                class="bg-gray-50 border-gray-300 text-gray-900"
              />
            </div>
            <div class="space-y-2">
              <label for="url-value" class="text-gray-700 text-sm font-medium">URL</label>
              <Input
                id="url-value"
                v-model="newBaseUrl.url"
                placeholder="https://api.example.com"
                class="bg-gray-50 border-gray-300 text-gray-900"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label for="url-description" class="text-gray-700 text-sm font-medium">描述（可选）</label>
            <Input
              id="url-description"
              v-model="newBaseUrl.description"
              placeholder="API 用途描述"
              class="bg-gray-50 border-gray-300 text-gray-900"
            />
          </div>
          <Button
            :disabled="!newBaseUrl.name || !newBaseUrl.url"
            class="bg-green-600 hover:bg-green-700"
            @click="addBaseUrl"
          >
            <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
            添加 BaseURL
          </Button>
        </div>

        <!-- BaseURL 列表 -->
        <div v-if="serverConfig.baseUrls.length > 0" class="space-y-3">
          <h3 class="text-lg font-medium text-gray-900">
            已配置的 BaseURL
          </h3>
          <div class="space-y-2">
            <div
              v-for="baseUrl in serverConfig.baseUrls"
              :key="baseUrl.id"
              class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <Badge class="bg-blue-100 text-blue-700 border-blue-200">
                    {{ baseUrl.name }}
                  </Badge>
                </div>
                <p class="text-gray-700 text-sm mt-1">
                  {{ baseUrl.url }}
                </p>
                <p v-if="baseUrl.description" class="text-gray-500 text-xs mt-1">
                  {{ baseUrl.description }}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                @click="removeBaseUrl(baseUrl.id)"
              >
                <Icon name="lucide:trash" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 服务器配置 -->
    <Card class="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-gray-900 flex items-center gap-2">
          <Icon name="lucide:server" class="w-5 h-5" />
          服务器配置
        </CardTitle>
        <CardDescription class="text-gray-600">
          配置具体服务的 API 地址
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="umami-api" class="text-gray-700 text-sm font-medium">Umami API BaseURL</label>
            <Select v-model="serverConfig.umamiApiBaseUrl">
              <SelectTrigger class="bg-gray-50 border-gray-300 text-gray-900">
                <SelectValue placeholder="选择 Umami API BaseURL" />
              </SelectTrigger>
              <SelectContent class="bg-white border-gray-300">
                <SelectItem
                  v-for="baseUrl in serverConfig.baseUrls"
                  :key="baseUrl.id"
                  :value="baseUrl.url"
                  class="text-gray-900 hover:bg-gray-100"
                >
                  {{ baseUrl.name }} - {{ baseUrl.url }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <label for="dynamic-api" class="text-gray-700 text-sm font-medium">动态接口 BaseURL</label>
            <Select v-model="serverConfig.dynamicApiBaseUrl">
              <SelectTrigger class="bg-gray-50 border-gray-300 text-gray-900">
                <SelectValue placeholder="选择动态接口 BaseURL" />
              </SelectTrigger>
              <SelectContent class="bg-white border-gray-300">
                <SelectItem
                  v-for="baseUrl in serverConfig.baseUrls"
                  :key="baseUrl.id"
                  :value="baseUrl.url"
                  class="text-gray-900 hover:bg-gray-100"
                >
                  {{ baseUrl.name }} - {{ baseUrl.url }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          :disabled="isLoading"
          class="bg-purple-600 hover:bg-purple-700"
          @click="saveServerConfig"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          保存服务器配置
        </Button>
      </CardContent>
    </Card>

    <!-- Token 管理 -->
    <Card class="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-gray-900 flex items-center gap-2">
          <Icon name="lucide:key" class="w-5 h-5" />
          Token 管理
        </CardTitle>
        <CardDescription class="text-gray-600">
          管理不同服务器的访问 Token
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 添加 Token 按钮 -->
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">
            服务器 Token 列表
          </h3>
          <Dialog v-model:open="isTokenDialogOpen">
            <DialogTrigger as-child>
              <Button class="bg-green-600 hover:bg-green-700">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
                添加 Token
              </Button>
            </DialogTrigger>
            <DialogContent class="bg-white border-gray-200">
              <DialogHeader>
                <DialogTitle class="text-gray-900">
                  添加服务器 Token
                </DialogTitle>
                <DialogDescription class="text-gray-600">
                  为指定服务器添加访问 Token
                </DialogDescription>
              </DialogHeader>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-gray-700 text-sm font-medium">服务器</label>
                  <Select v-model="newToken.serverUrl">
                    <SelectTrigger class="bg-gray-50 border-gray-300 text-gray-900">
                      <SelectValue placeholder="选择服务器" />
                    </SelectTrigger>
                    <SelectContent class="bg-white border-gray-300">
                      <SelectItem
                        v-for="baseUrl in serverConfig.baseUrls"
                        :key="baseUrl.id"
                        :value="baseUrl.url"
                        class="text-gray-900 hover:bg-gray-100"
                      >
                        {{ baseUrl.name }} - {{ baseUrl.url }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <label class="text-gray-700 text-sm font-medium">Token 名称</label>
                  <Input
                    v-model="newToken.tokenName"
                    placeholder="例如：API Key, Bearer Token"
                    class="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-gray-700 text-sm font-medium">Token 值</label>
                  <Input
                    v-model="newToken.tokenValue"
                    type="password"
                    placeholder="输入 Token 值"
                    class="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-gray-700 text-sm font-medium">描述（可选）</label>
                  <Textarea
                    v-model="newToken.description"
                    placeholder="Token 用途描述"
                    class="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div class="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    @click="isTokenDialogOpen = false"
                  >
                    取消
                  </Button>
                  <Button
                    :disabled="!newToken.serverUrl || !newToken.tokenName || !newToken.tokenValue"
                    class="bg-green-600 hover:bg-green-700"
                    @click="addServerToken"
                  >
                    添加 Token
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Token 列表 -->
        <div v-if="serverTokens.length > 0" class="space-y-3">
          <div class="space-y-2">
            <div
              v-for="token in serverTokens"
              :key="token.id"
              class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Badge class="bg-blue-100 text-blue-700 border-blue-200">
                    {{ token.serverName }}
                  </Badge>
                  <Badge class="bg-purple-100 text-purple-700 border-purple-200">
                    {{ token.tokenName }}
                  </Badge>
                  <Badge
                    :class="token.isActive
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-300'"
                  >
                    {{ token.isActive ? '启用' : '禁用' }}
                  </Badge>
                </div>
                <p class="text-gray-700 text-sm">
                  {{ token.serverUrl }}
                </p>
                <p class="text-gray-600 text-xs font-mono">
                  {{ token.tokenValue.substring(0, 20) }}***
                </p>
                <p v-if="token.description" class="text-gray-500 text-xs mt-1">
                  {{ token.description }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  :class="token.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                  @click="toggleTokenStatus(Number(token.id), !token.isActive)"
                >
                  <Icon :name="token.isActive ? 'lucide:pause' : 'lucide:play'" class="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="deleteServerToken(Number(token.id))"
                >
                  <Icon name="lucide:trash" class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <Icon name="lucide:key" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-600">
            暂无服务器 Token
          </p>
          <p class="text-gray-500 text-sm">
            点击上方按钮添加第一个 Token
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 危险操作 -->
    <Card class="bg-white border-red-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-red-600 flex items-center gap-2">
          <Icon name="lucide:alert-triangle" class="w-5 h-5" />
          危险操作
        </CardTitle>
        <CardDescription class="text-gray-600">
          这些操作将永久删除数据，请谨慎操作
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          :disabled="isLoading"
          @click="confirmResetAllSettings"
        >
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          重置所有设置
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
