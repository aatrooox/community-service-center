<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/composables/useToast'
import { useTauriSQL } from '~/composables/useTauriSQL'

// ============= 页面配置 =============

useHead({
  title: '服务器配置',
})

// ============= 组合式函数 =============

const {
  updateApiEndpoint,
  deleteApiEndpoint,
  createServer,
  getAllServers,
  updateServer,
  deleteServer: deleteServerFromDB,
  createServerToken,
  getAllServerTokens,
  deleteServerToken,
  updateServerToken,
  createApiEndpoint,
  getAllApiEndpoints,
} = useTauriSQL()
const toast = useToast()

// ============= 响应式数据 =============

const servers = ref<any[]>([])
const tokens = ref<any[]>([])
const apis = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Drawer 状态
const showAddServerDrawer = ref(false)
const showEditServerDrawer = ref(false)
const showAddTokenDrawer = ref(false)
const showApiDrawer = ref(false)
const isEditingApi = ref(false)
const currentServerId = ref<number | null>(null)

// 表单数据
const serverForm = ref({
  id: 0,
  name: '',
  baseUrl: '',
  description: '',
  isActive: true,
})

const tokenForm = ref({
  id: 0,
  serverId: 0,
  name: '',
  value: '',
  description: '',
  isActive: true,
})

const apiForm = ref({
  id: 0,
  serverId: 0,
  name: '',
  endpoint: '',
  method: 'GET',
  description: '',
  isActive: true,
})

// ============= 计算属性 =============

const getServerTokens = (serverId: number) => {
  return tokens.value.filter(token => token.serverId === serverId)
}

const getServerApis = (serverId: number) => {
  // 先找到对应的服务器URL
  const server = servers.value.find(s => s.id === serverId)
  if (!server)
    return []

  // 通过serverUrl来过滤API，因为API数据中存储的是serverUrl而不是serverId
  const serverUrl = server.url || server.baseUrl
  return apis.value.filter(api => api.serverUrl === serverUrl)
}

// ============= 方法 =============

/**
 * 加载服务器列表
 */
async function loadServers() {
  try {
    isLoading.value = true
    const result = await getAllServers()
    servers.value = result || []
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载服务器列表失败'
    console.error('加载服务器列表失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 加载 Token 列表
 */
async function loadTokens() {
  try {
    const result = await getAllServerTokens()
    tokens.value = result || []
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载 Token 列表失败'
    console.error('加载 Token 列表失败:', err)
  }
}

/**
 * 加载 API 列表
 */
async function loadApis() {
  try {
    const result = await getAllApiEndpoints()
    apis.value = result || []
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载 API 列表失败'
    console.error('加载 API 列表失败:', err)
  }
}

/**
 * 重置服务器表单
 */
function resetServerForm() {
  serverForm.value = {
    id: 0,
    name: '',
    baseUrl: '',
    description: '',
    isActive: true,
  }
}

/**
 * 重置 Token 表单
 */
function resetTokenForm() {
  tokenForm.value = {
    id: 0,
    serverId: currentServerId.value || 0,
    name: '',
    value: '',
    description: '',
    isActive: true,
  }
}

/**
 * 重置 API 表单
 */
function resetApiForm() {
  apiForm.value = {
    id: 0,
    serverId: currentServerId.value || 0,
    name: '',
    endpoint: '',
    method: 'GET',
    description: '',
    isActive: true,
  }
}

/**
 * 编辑服务器
 */
function editServer(server: any) {
  serverForm.value = {
    id: server.id,
    name: server.name,
    baseUrl: server.url || server.baseUrl, // 数据库返回的是url字段
    description: server.description || '',
    isActive: Boolean(server.is_active || server.isActive), // 数据库返回的是is_active字段，需要转换为boolean
  }
  showEditServerDrawer.value = true
}

/**
 * 保存服务器
 */
async function saveServer() {
  if (!serverForm.value.name || !serverForm.value.baseUrl) {
    toast.error('请填写必要信息')
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const serverData = {
      name: serverForm.value.name,
      url: serverForm.value.baseUrl, // 数据库字段是url，不是baseUrl
      description: serverForm.value.description || null,
      isActive: serverForm.value.isActive,
    }

    if (showEditServerDrawer.value) {
      await updateServer(serverForm.value.id, serverData)
      toast.success('服务器更新成功')
    }
    else {
      await createServer(serverData)
      toast.success('服务器创建成功')
    }

    await loadServers()
    closeServerDrawer()
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '保存服务器失败'
    toast.error(error.value)
    console.error('保存服务器失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 保存 Token
 */
async function saveToken() {
  if (!tokenForm.value.name || !tokenForm.value.value) {
    toast.error('请填写必要信息')
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const tokenData = {
      serverId: tokenForm.value.serverId,
      name: tokenForm.value.name,
      value: tokenForm.value.value,
      description: tokenForm.value.description || null,
      isActive: tokenForm.value.isActive,
    }

    if (tokenForm.value.id > 0) {
      await updateServerToken(tokenForm.value.id, tokenData)
      toast.success('Token 更新成功')
    }
    else {
      await createServerToken(tokenData)
      toast.success('Token 创建成功')
    }

    await loadTokens()
    closeTokenDrawer()
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '保存 Token 失败'
    toast.error(error.value)
    console.error('保存 Token 失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 删除服务器
 */
function deleteServer(id: number) {
  toast.warning('确定要删除这个服务器吗？', {
    description: '这将同时删除相关的 Token 和 API 配置，此操作无法撤销',
    action: {
      label: '确认删除',
      onClick: () => performDeleteServer(id),
    },
    cancel: {
      label: '取消',
    },
    duration: 10000, // 10秒后自动关闭
  })
}

/**
 * 执行删除服务器操作
 */
async function performDeleteServer(id: number) {
  try {
    isLoading.value = true
    error.value = null

    await deleteServerFromDB(id)
    await loadServers()
    await loadTokens()
    toast.success('服务器删除成功')

    // 如果删除的是当前选中的服务器，清空选择
    if (currentServerId.value === id) {
      currentServerId.value = null
    }
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '删除服务器失败'
    toast.error(error.value)
    console.error('删除服务器失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 删除 Token
 */
function deleteToken(id: number) {
  toast.warning('确定要删除这个 Token 吗？', {
    description: '此操作无法撤销',
    action: {
      label: '确认删除',
      onClick: () => performDeleteToken(id),
    },
    cancel: {
      label: '取消',
    },
    duration: 10000, // 10秒后自动关闭
  })
}

/**
 * 执行删除 Token 操作
 */
async function performDeleteToken(id: number) {
  try {
    isLoading.value = true
    await deleteServerToken(id)
    await loadTokens()
    toast.success('Token 删除成功')
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '删除 Token 失败'
    toast.error(error.value)
    console.error('删除 Token 失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 保存 API
 */
async function saveApi() {
  if (!apiForm.value.name || !apiForm.value.endpoint) {
    toast.error('请填写必要信息')
    return
  }

  try {
    isLoading.value = true
    error.value = null

    if (isEditingApi.value) {
      // 编辑模式
      const updateData = {
        name: apiForm.value.name,
        path: apiForm.value.endpoint,
        method: apiForm.value.method,
        description: apiForm.value.description || null,
        isActive: apiForm.value.isActive,
      }
      await updateApiEndpoint(apiForm.value.id, updateData)
    }
    else {
      // 新增模式
      const server = servers.value.find(s => s.id === currentServerId.value)
      if (!server) {
        toast.error('请先选择服务器')
        return
      }

      const apiData = {
        serverUrl: server.url || server.baseUrl,
        name: apiForm.value.name,
        path: apiForm.value.endpoint,
        method: apiForm.value.method,
        description: apiForm.value.description || null,
        params: null,
        headers: null,
        cacheDuration: 300,
        isActive: apiForm.value.isActive,
        sortOrder: 0,
      }
      await createApiEndpoint(apiData)
    }

    await loadApis()
    resetApiForm()
    showApiDrawer.value = false
    toast.success(isEditingApi.value ? 'API 接口更新成功' : 'API 接口添加成功')
  }
  catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : (isEditingApi.value ? '更新 API 接口失败' : '添加 API 接口失败')
    error.value = errorMessage
    toast.error(errorMessage)
    console.error(isEditingApi.value ? '更新 API 接口失败:' : '添加 API 接口失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 关闭服务器抽屉
 */
function closeServerDrawer() {
  showAddServerDrawer.value = false
  showEditServerDrawer.value = false
  resetServerForm()
}

/**
 * 关闭 Token 抽屉
 */
function closeTokenDrawer() {
  showAddTokenDrawer.value = false
  resetTokenForm()
}

/**
 * 打开添加服务器抽屉
 */
function openAddServerDrawer() {
  resetServerForm()
  showAddServerDrawer.value = true
}

/**
 * 打开添加 Token 抽屉
 */
function openAddTokenDrawer(serverId: number) {
  currentServerId.value = serverId
  resetTokenForm()
  showAddTokenDrawer.value = true
}

/**
 * 打开添加 API 抽屉
 */
function openAddApiDrawer(serverId: number) {
  currentServerId.value = serverId
  isEditingApi.value = false
  resetApiForm()
  showApiDrawer.value = true
}

/**
 * 打开编辑 API 抽屉
 */
function openEditApiDrawer(api: any) {
  currentServerId.value = null
  isEditingApi.value = true
  apiForm.value = {
    id: api.id,
    serverId: 0,
    name: api.name,
    endpoint: api.path || api.endpoint,
    method: api.method,
    description: api.description || '',
    isActive: true,
  }
  showApiDrawer.value = true
}

/**
 * 删除 API
 */
function deleteApi(apiId: number) {
  toast.warning('确定要删除这个 API 接口吗？', {
    description: '此操作无法撤销',
    action: {
      label: '确认删除',
      onClick: () => performDeleteApi(apiId),
    },
    cancel: {
      label: '取消',
    },
    duration: 10000, // 10秒后自动关闭
  })
}

/**
 * 执行删除 API 操作
 */
async function performDeleteApi(apiId: number) {
  try {
    isLoading.value = true
    await deleteApiEndpoint(apiId)
    await loadApis()
    toast.success('API 接口删除成功')
  }
  catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : '删除 API 接口失败'
    error.value = errorMessage
    toast.error(errorMessage)
    console.error('删除 API 接口失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }
  catch (err) {
    toast.error('复制失败')
    console.error('复制失败:', err)
  }
}

// ============= 生命周期 =============

onMounted(async () => {
  await loadServers()
  await loadTokens()
  await loadApis()
})
</script>

<template>
  <div class="pixel-dashboard">
    <!-- 像素风格页面头部 -->
    <div class="pixel-header">
      <div class="pixel-title">
        <span class="pixel-icon">🖥️</span>
        <span>服务器配置</span>
      </div>
      <Button
        class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80"
        @click="openAddServerDrawer"
      >
        + 添加服务器
      </Button>
    </div>

    <!-- 主要内容区域 -->
    <div class="pixel-content px-3 py-4 md:px-6 md:py-8">
      <!-- 错误提示 -->
      <div v-if="error" class="pixel-card mb-3 md:mb-4 border-[var(--pixel-red)] bg-red-900/20">
        <div class="pixel-card-header">
          <span class="pixel-card-title text-[var(--pixel-red)] text-xs md:text-sm">⚠️ ERROR</span>
        </div>
        <p class="text-[var(--pixel-red)] font-mono text-xs md:text-sm">
          {{ error }}
        </p>
      </div>

      <!-- 服务器列表 -->
      <div class="space-y-4">
        <div
          v-for="server in servers"
          :key="server.id"
          class="pixel-card"
        >
          <!-- 服务器基本信息 -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <p class="pixel-card-title text-[var(--pixel-text-primary)]">
                {{ server.name }}
              </p>
              <p class="text-xs text-[var(--pixel-text-secondary)] mt-1">
                {{ server.url }}
              </p>
              <p v-if="server.description" class="text-sm text-[var(--pixel-text-secondary)] mt-1">
                {{ server.description }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <Button
                size="sm"
                class="pixel-btn-small text-[var(--pixel-cyan)]"
                @click="openAddTokenDrawer(server.id)"
              >
                +<Icon name="lucide:key-round" />
              </Button>
              <Button
                class="pixel-btn-small text-[var(--pixel-cyan)]"
                @click="openAddApiDrawer(server.id)"
              >
                +<Icon name="lucide:chart-network" />
              </Button>
              <Button
                class="pixel-btn-small text-[var(--pixel-cyan)]"
                @click="editServer(server)"
              >
                <Icon name="pixelarticons:edit-box" />
              </Button>
              <Button
                class="pixel-btn-small text-[var(--pixel-red)]"
                @click="deleteServer(server.id)"
              >
                <Icon name="pixelarticons:trash" />
              </Button>
            </div>
          </div>

          <!-- Accordion 折叠内容 -->
          <Accordion type="multiple" class="w-full">
            <!-- Token 部分 -->
            <AccordionItem value="tokens" class="border-[var(--pixel-border)]">
              <AccordionTrigger class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider hover:text-[var(--pixel-cyan)] hover:no-underline">
                访问令牌 ({{ getServerTokens(server.id).length }})
              </AccordionTrigger>
              <AccordionContent class="pt-4">
                <div class="space-y-3">
                  <div
                    v-for="token in getServerTokens(server.id)"
                    :key="token.id"
                    class="bg-[var(--pixel-bg-primary)] border border-[var(--pixel-border)] rounded p-3"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="font-bold text-[var(--pixel-text-primary)] uppercase tracking-wider text-sm">
                          {{ token.name }}
                        </p>
                        <p class="text-xs text-[var(--pixel-text-secondary)] mt-1 font-mono break-all">
                          {{ token.value.substring(0, 30) }}*******
                        </p>
                        <p v-if="token.description" class="text-xs text-[var(--pixel-text-muted)] mt-2">
                          {{ token.description }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-2 ml-4">
                        <Button
                          class="pixel-btn-small bg-[var(--pixel-bg-tertiary)] text-[var(--pixel-text-primary)] hover:bg-[var(--pixel-bg-tertiary)]/80"
                          @click="copyToClipboard(token.value)"
                        >
                          复制
                        </Button>
                        <Button
                          class="pixel-btn-small bg-[var(--pixel-red)] text-[var(--pixel-text-primary)] hover:bg-[var(--pixel-red)]/80"
                          @click="deleteToken(token.id)"
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div v-if="getServerTokens(server.id).length === 0" class="text-center py-4 text-[var(--pixel-text-muted)]">
                    <p class="text-sm uppercase tracking-wider">
                      暂无访问令牌
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <!-- API 部分 -->
            <AccordionItem value="apis" class="border-[var(--pixel-border)]">
              <AccordionTrigger class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider hover:text-[var(--pixel-cyan)] hover:no-underline">
                API 接口 ({{ getServerApis(server.id).length }})
              </AccordionTrigger>
              <AccordionContent class="pt-4">
                <div class="space-y-3">
                  <div
                    v-for="api in getServerApis(server.id)"
                    :key="api.id"
                    class="bg-[var(--pixel-bg-primary)] border border-[var(--pixel-border)] rounded p-3"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                          <Badge
                            :class="{
                              'bg-green-900 text-green-400': api.method === 'GET',
                              'bg-blue-900 text-blue-400': api.method === 'POST',
                              'bg-yellow-900 text-yellow-400': api.method === 'PUT',
                              'bg-red-900 text-red-400': api.method === 'DELETE',
                              'bg-purple-900 text-purple-400': api.method === 'PATCH',
                            }"
                            class="font-mono text-xs"
                          >
                            {{ api.method }}
                          </Badge>
                          <h4 class="font-bold text-[var(--pixel-text-primary)] uppercase tracking-wider text-sm">
                            {{ api.name }}
                          </h4>
                        </div>
                        <p class="text-xs text-[var(--pixel-text-secondary)] mt-1 font-mono">
                          {{ api.endpoint }}
                        </p>
                        <p v-if="api.description" class="text-xs text-[var(--pixel-text-muted)] mt-2">
                          {{ api.description }}
                        </p>
                      </div>
                      <div class="flex items-center space-x-2 ml-4">
                        <Button
                          class="pixel-btn-small bg-[var(--pixel-bg-tertiary)] text-[var(--pixel-text-primary)] hover:bg-[var(--pixel-bg-tertiary)]/80"
                          @click="openEditApiDrawer(api)"
                        >
                          编辑
                        </Button>
                        <Button
                          class="pixel-btn-small bg-[var(--pixel-red)] text-[var(--pixel-text-primary)] hover:bg-[var(--pixel-red)]/80"
                          @click="deleteApi(api.id)"
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div v-if="getServerApis(server.id).length === 0" class="text-center py-4 text-[var(--pixel-text-muted)]">
                    <p class="text-sm uppercase tracking-wider">
                      暂无 API 接口
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <!-- 空状态 -->
        <div v-if="servers.length === 0" class="text-center py-8">
          <div class="text-[var(--pixel-text-muted)] mb-4">
            <div class="w-12 h-12 mx-auto mb-4 text-4xl">
              🖥️
            </div>
          </div>
          <p class="text-[var(--pixel-text-muted)] font-mono text-sm mb-4">
            还没有配置任何服务器
          </p>
          <p class="text-xs text-[var(--pixel-text-muted)] font-mono">
            点击右上角按钮添加第一个服务器
          </p>
        </div>
      </div>
    </div>

    <!-- 添加服务器抽屉 -->
    <Drawer v-model:open="showAddServerDrawer">
      <DrawerContent class="bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
            添加服务器
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono">
            配置新的 API 服务器
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              服务器名称
            </label>
            <Input
              v-model="serverForm.name"
              placeholder="输入服务器名称"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              Base URL
            </label>
            <Input
              v-model="serverForm.baseUrl"
              placeholder="https://api.example.com"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              描述（可选）
            </label>
            <Textarea
              v-model="serverForm.description"
              placeholder="输入服务器描述"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)] resize-none"
              :rows="3"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button
            :disabled="isLoading"
            class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 font-mono uppercase text-xs"
            @click="saveServer"
          >
            {{ isLoading ? '保存中...' : '保存' }}
          </Button>
          <DrawerClose as-child>
            <Button class="pixel-btn bg-[var(--pixel-bg-tertiary)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)]/80 font-mono uppercase text-xs">
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <!-- 编辑服务器抽屉 -->
    <Drawer v-model:open="showEditServerDrawer">
      <DrawerContent class="bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
            编辑服务器
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono">
            修改服务器配置
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              服务器名称
            </label>
            <Input
              v-model="serverForm.name"
              placeholder="输入服务器名称"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              Base URL
            </label>
            <Input
              v-model="serverForm.baseUrl"
              placeholder="https://api.example.com"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              描述（可选）
            </label>
            <Textarea
              v-model="serverForm.description"
              placeholder="输入服务器描述"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)] resize-none"
              :rows="3"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button
            :disabled="isLoading"
            class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 font-mono uppercase text-xs"
            @click="saveServer"
          >
            {{ isLoading ? '保存中...' : '保存' }}
          </Button>
          <DrawerClose as-child>
            <Button class="pixel-btn bg-[var(--pixel-bg-tertiary)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)]/80 font-mono uppercase text-xs">
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <!-- 添加Token抽屉 -->
    <Drawer v-model:open="showAddTokenDrawer">
      <DrawerContent class="bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
            添加访问令牌
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono">
            为服务器添加新的访问令牌
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              令牌名称
            </label>
            <Input
              v-model="tokenForm.name"
              placeholder="输入令牌名称"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              令牌值
            </label>
            <Input
              v-model="tokenForm.value"
              placeholder="输入令牌值"
              type="password"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              描述（可选）
            </label>
            <Textarea
              v-model="tokenForm.description"
              placeholder="输入令牌描述"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)] resize-none"
              :rows="3"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button
            :disabled="isLoading"
            class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 font-mono uppercase text-xs"
            @click="saveToken"
          >
            {{ isLoading ? '保存中...' : '保存' }}
          </Button>
          <DrawerClose as-child>
            <Button class="pixel-btn bg-[var(--pixel-bg-tertiary)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)]/80 font-mono uppercase text-xs">
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <!-- 添加/编辑API抽屉 -->
    <Drawer v-model:open="showApiDrawer">
      <DrawerContent class="bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
            {{ isEditingApi ? '编辑 API' : '添加 API' }}
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono">
            {{ isEditingApi ? '修改 API 接口配置' : '为服务器添加 API 接口' }}
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              API 名称
            </label>
            <Input
              v-model="apiForm.name"
              placeholder="输入 API 名称"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              端点路径
            </label>
            <Input
              v-model="apiForm.endpoint"
              placeholder="/api/v1/users"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              请求方法
            </label>
            <Select v-model="apiForm.method">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-[var(--pixel-border)]">
                <SelectItem value="GET" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  GET
                </SelectItem>
                <SelectItem value="POST" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  POST
                </SelectItem>
                <SelectItem value="PUT" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  PUT
                </SelectItem>
                <SelectItem value="DELETE" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  DELETE
                </SelectItem>
                <SelectItem value="PATCH" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  PATCH
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--pixel-text-secondary)] uppercase tracking-wider mb-2">
              描述（可选）
            </label>
            <Textarea
              v-model="apiForm.description"
              placeholder="输入 API 描述"
              class="bg-[var(--pixel-bg-primary)] border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono focus:border-[var(--pixel-cyan)] resize-none"
              :rows="3"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button
            :disabled="isLoading"
            class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 font-mono uppercase text-xs"
            @click="saveApi"
          >
            {{ isLoading ? '保存中...' : (isEditingApi ? '更新' : '保存') }}
          </Button>
          <DrawerClose as-child>
            <Button class="pixel-btn bg-[var(--pixel-bg-tertiary)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)]/80 font-mono uppercase text-xs">
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<style scoped>
@reference "tailwindcss"
/* 覆盖 Accordion 原始样式，使其符合像素风格 */
:deep(.accordion-trigger) {
  @apply font-mono uppercase tracking-wider;
}

:deep(.accordion-content) {
  @apply font-mono;
}

:deep([data-state='open'] .accordion-trigger) {
  @apply text-[var(--pixel-cyan)];
}

:deep(.accordion-item) {
  @apply border-[var(--pixel-border)];
}
</style>
