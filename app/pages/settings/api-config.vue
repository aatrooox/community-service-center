<script setup lang="ts">
import type { ApiEndpoint } from '~/composables/useAPIService'
import { useAPIService } from '~/composables/useAPIService'
import { useTauriSQL } from '~/composables/useTauriSQL'

// ============= 页面配置 =============

definePageMeta({
  title: 'API 接口配置',
  layout: 'default',
})

// ============= 组合式函数 =============

const sqlService = useTauriSQL()
const apiService = useAPIService()

// ============= 响应式数据 =============

const servers = ref<any[]>([])
const endpoints = ref<ApiEndpoint[]>([])
const selectedServerUrl = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// 模态框状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showTestModal = ref(false)

// 表单数据
const formData = ref({
  id: 0,
  name: '',
  path: '',
  method: 'GET',
  description: '',
  params: null as Record<string, any> | null,
  headers: null as Record<string, string> | null,
  cacheDuration: 300,
  isActive: true,
  sortOrder: 0,
})

// JSON 文本
const paramsText = ref('')
const headersText = ref('')
const paramsError = ref('')
const headersError = ref('')

// 测试结果
const testResult = ref<any>(null)

// ============= 计算属性 =============

const selectedServerName = computed(() => {
  const server = servers.value.find(s => s.url === selectedServerUrl.value)
  return server?.name || ''
})

const paramsPlaceholder = computed(() => {
  return JSON.stringify({ limit: 20, category: 'hot' }, null, 2)
})

const headersPlaceholder = computed(() => {
  return JSON.stringify({ 'User-Agent': 'MyApp/1.0' }, null, 2)
})

// ============= 方法 =============

/**
 * 加载服务器列表
 */
async function loadServers() {
  try {
    isLoading.value = true
    servers.value = await sqlService.getAllServers()
  }
  catch (err: any) {
    error.value = err instanceof Error ? err.message : '加载服务器失败'
    console.error('加载服务器失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 加载接口列表
 */
async function loadEndpoints() {
  if (!selectedServerUrl.value) {
    endpoints.value = []
    return
  }

  try {
    isLoading.value = true
    endpoints.value = await sqlService.getApiEndpointsByServer(selectedServerUrl.value)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '加载接口失败'
    console.error('加载接口失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 重置表单
 */
function resetForm() {
  formData.value = {
    id: 0,
    name: '',
    path: '',
    method: 'GET',
    description: '',
    params: null,
    headers: null,
    cacheDuration: 300,
    isActive: true,
    sortOrder: 0,
  }
  paramsText.value = ''
  headersText.value = ''
  paramsError.value = ''
  headersError.value = ''
}

/**
 * 验证 JSON
 */
function validateJSON(text: string, fieldName: string): any {
  if (!text.trim())
    return null

  try {
    return JSON.parse(text)
  }
  catch {
    if (fieldName === 'params') {
      paramsError.value = 'JSON 格式错误'
    }
    else if (fieldName === 'headers') {
      headersError.value = 'JSON 格式错误'
    }
    return false
  }
}

/**
 * 编辑接口
 */
function editEndpoint(endpoint: ApiEndpoint) {
  formData.value = {
    id: endpoint.id,
    name: endpoint.name,
    path: endpoint.path,
    method: endpoint.method,
    description: endpoint.description || '',
    params: endpoint.params || null,
    headers: endpoint.headers || null,
    cacheDuration: endpoint.cacheDuration,
    isActive: endpoint.isActive,
    sortOrder: endpoint.sortOrder,
  }

  paramsText.value = endpoint.params ? JSON.stringify(endpoint.params, null, 2) : ''
  headersText.value = endpoint.headers ? JSON.stringify(endpoint.headers, null, 2) : ''
  paramsError.value = ''
  headersError.value = ''

  showEditModal.value = true
}

/**
 * 保存接口
 */
async function saveEndpoint() {
  // 验证 JSON
  paramsError.value = ''
  headersError.value = ''

  const params = validateJSON(paramsText.value, 'params')
  const headers = validateJSON(headersText.value, 'headers')

  if (params === false || headers === false)
    return

  try {
    isLoading.value = true

    const endpointData = {
      serverUrl: selectedServerUrl.value,
      name: formData.value.name,
      path: formData.value.path,
      method: formData.value.method,
      description: formData.value.description || null,
      params,
      headers,
      cacheDuration: formData.value.cacheDuration,
      isActive: formData.value.isActive,
      sortOrder: formData.value.sortOrder,
    }

    if (showEditModal.value) {
      await sqlService.updateApiEndpoint(formData.value.id, endpointData)
    }
    else {
      await sqlService.createApiEndpoint(endpointData)
    }

    await loadEndpoints()
    closeModal()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
    console.error('保存接口失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 删除接口
 */
async function deleteEndpoint(id: number) {
  // eslint-disable-next-line no-alert
  if (!confirm('确定要删除这个接口吗？'))
    return

  try {
    isLoading.value = true
    await sqlService.deleteApiEndpoint(id)
    await loadEndpoints()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '删除失败'
    console.error('删除接口失败:', err)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 测试接口
 */
async function testEndpoint(endpoint: ApiEndpoint) {
  showTestModal.value = true
  testResult.value = null

  try {
    const response = await apiService.fetchData(endpoint.id, { forceRefresh: true })
    testResult.value = {
      success: true,
      data: response?.data,
      cached: response?.cached || false,
      timestamp: response?.timestamp || new Date().toISOString(),
      endpoint: response?.endpoint,
    }
  }
  catch (err) {
    testResult.value = {
      success: false,
      error: err instanceof Error ? err.message : '测试失败',
      timestamp: new Date().toISOString(),
      endpoint,
    }
  }
}

/**
 * 关闭模态框
 */
function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

/**
 * 格式化日期
 */
// function formatDate(dateString: string): string {
//   return new Date(dateString).toLocaleString('zh-CN')
// }

// ============= 生命周期 =============

onMounted(async () => {
  await loadServers()
})
</script>

<template>
  <div>
    <div class="pixel-dashboard px-3 py-4 md:px-6 md:py-8 max-w-7xl mx-auto">
      <!-- 像素风格页面头部 -->
      <div class="pixel-header mb-6">
        <div class="pixel-title flex justify-between items-center">
          <span class="pixel-title text-[var(--pixel-text-primary)]">
            <span class="pixel-icon">⚡</span>
            <span>API 接口配置</span>
          </span>
          <Icon name="pixelarticons:server" size="1.5em" @click="navigateTo('/settings/server-config')" />
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="pixel-card mb-4 border-[var(--pixel-red)] bg-red-900/20">
        <div class="pixel-card-header">
          <span class="pixel-card-title text-[var(--pixel-red)] text-xs md:text-sm">⚠️ ERROR</span>
        </div>
        <p class="text-[var(--pixel-red)] font-mono text-xs md:text-sm">
          {{ error }}
        </p>
      </div>

      <!-- 服务器选择 -->
      <div class="pixel-card mb-6">
        <div class="pixel-card-header">
          <span class="pixel-card-title text-[var(--pixel-text-primary)]">🖥️ 服务器选择</span>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">
            选择服务器
          </label>
          <Select v-model="selectedServerUrl" @update:model-value="loadEndpoints">
            <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
              <SelectValue placeholder="请选择服务器" />
            </SelectTrigger>
            <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
              <SelectItem
                v-for="server in servers"
                :key="server.url"
                :value="server.url"
                class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
              >
                {{ server.name }} ({{ server.url }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- 接口列表 -->
      <div v-if="selectedServerUrl" class="pixel-content">
        <!-- 接口配置卡片 -->
        <div class="pixel-card">
          <div class="pixel-card-header flex justify-between items-center">
            <span class="pixel-card-title text-[var(--pixel-text-primary)]">⚡ 接口配置 - {{ selectedServerName }}</span>
            <Button
              class="pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80 font-mono uppercase tracking-wider text-xs"
              @click="showAddModal = true"
            >
              <Icon name="pixelarticons:plus" size="1em" class="mr-1" />
              添加接口
            </Button>
          </div>

          <!-- 接口卡片列表 -->
          <div class="space-y-3 mt-4">
            <div
              v-for="endpoint in endpoints"
              :key="endpoint.id"
              class="pixel-card bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border-light)]"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-sm md:text-base font-bold text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
                      {{ endpoint.name }}
                    </h3>
                    <Badge
                      :class="[
                        endpoint.isActive
                          ? 'bg-[var(--pixel-green)] text-[var(--pixel-text-primary)]'
                          : 'bg-[var(--pixel-text-muted)] text-[var(--pixel-text-primary)]',
                      ]"
                      class="font-mono border-[var(--pixel-border)] text-xs"
                    >
                      {{ endpoint.isActive ? '启用' : '禁用' }}
                    </Badge>
                    <Badge class="bg-[var(--pixel-blue)] text-[var(--pixel-text-primary)] font-mono border-[var(--pixel-border)] text-xs">
                      {{ endpoint.method.toUpperCase() }}
                    </Badge>
                  </div>
                  <p v-if="endpoint.description" class="text-[var(--pixel-text-secondary)] text-xs font-mono mb-2">
                    {{ endpoint.description }}
                  </p>
                  <div class="flex items-center">
                    <span class="font-mono bg-[var(--pixel-bg-tertiary)] px-2 py-1 border border-[var(--pixel-border)] text-[var(--pixel-text-primary)] text-xs break-all">
                      {{ endpoint.path }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-1 ml-3">
                  <Button
                    size="sm"
                    class="pixel-btn bg-[var(--pixel-yellow)] hover:bg-[var(--pixel-yellow)]/80 font-mono text-xs h-6 px-2"
                    @click="editEndpoint(endpoint)"
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    class="pixel-btn bg-[var(--pixel-cyan)] hover:bg-[var(--pixel-cyan)]/80 font-mono text-xs h-6 px-2"
                    @click="testEndpoint(endpoint)"
                  >
                    测试
                  </Button>
                  <Button
                    size="sm"
                    class="pixel-btn bg-[var(--pixel-red)] hover:bg-[var(--pixel-red)]/80 font-mono text-xs h-6 px-2"
                    @click="deleteEndpoint(endpoint.id)"
                  >
                    删除
                  </Button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="endpoints.length === 0" class="text-center py-6">
              <div class="text-[var(--pixel-text-muted)] mb-4">
                <Icon name="pixelarticons:code" class="w-12 h-12 mx-auto mb-3" />
              </div>
              <p class="text-[var(--pixel-text-muted)] font-mono text-sm mb-4">
                还没有配置任何接口
              </p>
              <Button
                class="pixel-btn bg-[var(--pixel-green)] hover:bg-[var(--pixel-green)]/80 font-mono uppercase tracking-wider text-xs"
                @click="showAddModal = true"
              >
                <Icon name="pixelarticons:plus" size="1em" class="mr-1" />
                添加第一个接口
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 未选择服务器状态 -->
      <div v-else class="text-center py-12">
        <div class="text-[var(--pixel-text-muted)] mb-4">
          <Icon name="pixelarticons:server" class="w-16 h-16 mx-auto mb-4" />
        </div>
        <p class="text-[var(--pixel-text-muted)] font-mono text-lg mb-4">
          请先选择一个服务器
        </p>
        <p class="text-[var(--pixel-text-secondary)] font-mono text-sm">
          选择服务器后即可配置API接口
        </p>
      </div>
    </div>

    <!-- 添加/编辑接口模态框 -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold text-orange-400 mb-6">
          {{ showAddModal ? '添加接口' : '编辑接口' }}
        </h3>

        <form class="space-y-4" @submit.prevent="saveEndpoint">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                接口名称 *
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="例如：知乎热榜"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                请求方法 *
              </label>
              <select
                v-model="formData.method"
                required
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="GET">
                  GET
                </option>
                <option value="POST">
                  POST
                </option>
                <option value="PUT">
                  PUT
                </option>
                <option value="DELETE">
                  DELETE
                </option>
                <option value="PATCH">
                  PATCH
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              接口路径 *
            </label>
            <input
              v-model="formData.path"
              type="text"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="例如：/api/zhihu/hot"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              描述
            </label>
            <textarea
              v-model="formData.description"
              rows="2"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="接口功能描述"
            />
          </div>

          <!-- 配置选项 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                缓存时长（秒）
              </label>
              <input
                v-model.number="formData.cacheDuration"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                排序顺序
              </label>
              <input
                v-model.number="formData.sortOrder"
                type="number"
                min="0"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              >
            </div>
            <div class="flex items-center">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  class="sr-only"
                >
                <div class="relative">
                  <div
                    class="block bg-gray-600 w-14 h-8 rounded-full transition-colors"
                    :class="[
                      formData.isActive ? 'bg-orange-600' : 'bg-gray-600',
                    ]"
                  />
                  <div
                    class="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"
                    :class="[
                      formData.isActive ? 'transform translate-x-6' : '',
                    ]"
                  />
                </div>
                <span class="ml-3 text-sm text-gray-300">
                  {{ formData.isActive ? '启用' : '禁用' }}
                </span>
              </label>
            </div>
          </div>

          <!-- 请求参数 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              请求参数（JSON 格式）
            </label>
            <textarea
              v-model="paramsText"
              rows="4"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              :placeholder="paramsPlaceholder"
            />
            <p v-if="paramsError" class="text-red-400 text-xs mt-1">
              {{ paramsError }}
            </p>
          </div>

          <!-- 请求头 -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              请求头（JSON 格式）
            </label>
            <textarea
              v-model="headersText"
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              :placeholder="headersPlaceholder"
            />
            <p v-if="headersError" class="text-red-400 text-xs mt-1">
              {{ headersError }}
            </p>
          </div>

          <!-- 按钮 -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              @click="closeModal"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
            >
              {{ isLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 测试结果抽屉 -->
    <Drawer v-model:open="showTestModal">
      <DrawerContent class="max-w-4xl mx-auto">
        <DrawerHeader>
          <DrawerTitle class="text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
            ⚡ 接口测试结果 - {{ testResult?.endpoint?.name }}
          </DrawerTitle>
        </DrawerHeader>

        <div class="p-6 space-y-4">
          <div v-if="testResult" class="space-y-4">
            <!-- 测试状态 -->
            <div class="flex items-center gap-3">
              <Badge
                :class="[
                  testResult.success
                    ? 'bg-[var(--pixel-green)] text-[var(--pixel-text-primary)]'
                    : 'bg-[var(--pixel-red)] text-[var(--pixel-text-primary)]',
                ]"
                class="font-mono border-[var(--pixel-border)] text-xs"
              >
                {{ testResult.success ? '成功' : '失败' }}
              </Badge>
              <span class="text-[var(--pixel-text-secondary)] font-mono text-sm">
                {{ testResult.cached ? '来自缓存' : '实时请求' }}
              </span>
              <span class="text-[var(--pixel-text-secondary)] font-mono text-sm">
                {{ testResult.timestamp }}
              </span>
            </div>

            <!-- 错误信息 -->
            <div v-if="!testResult.success" class="pixel-card bg-[var(--pixel-red)]/10 border-[var(--pixel-red)]">
              <h4 class="text-[var(--pixel-red)] font-mono font-bold mb-2 uppercase tracking-wider">
                ❌ 错误信息
              </h4>
              <pre class="text-[var(--pixel-text-primary)] font-mono text-sm whitespace-pre-wrap bg-[var(--pixel-bg-tertiary)] p-3 border border-[var(--pixel-border)] overflow-x-auto">{{ testResult.error }}</pre>
            </div>

            <!-- 响应数据 -->
            <div v-if="testResult.success" class="pixel-card bg-[var(--pixel-green)]/10 border-[var(--pixel-green)]">
              <h4 class="text-[var(--pixel-green)] font-mono font-bold mb-2 uppercase tracking-wider">
                ✅ 响应数据
              </h4>
              <pre class="text-[var(--pixel-text-primary)] font-mono text-sm whitespace-pre-wrap bg-[var(--pixel-bg-tertiary)] p-3 border border-[var(--pixel-border)] overflow-x-auto">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <div class="text-[var(--pixel-text-muted)] mb-4">
              <Icon name="pixelarticons:loading" class="w-8 h-8 mx-auto mb-3 animate-spin" />
            </div>
            <p class="text-[var(--pixel-text-muted)] font-mono">
              测试中...
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button
            class="pixel-btn bg-[var(--pixel-text-muted)] hover:bg-[var(--pixel-text-muted)]/80 font-mono uppercase tracking-wider"
            @click="showTestModal = false"
          >
            关闭
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
</template>
