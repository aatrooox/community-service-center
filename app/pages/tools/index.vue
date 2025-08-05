<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 页面标题
useHead({
  title: '工具箱 - 社区服务中心',
})

// 路由相关
const route = useRoute()
const router = useRouter()

// 工具列表数据
const tools = ref([
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化和验证 JSON 数据，支持压缩和美化',
    icon: 'lucide:braces',
    category: 'development',
    tags: ['JSON', '格式化', '验证'],
    color: 'bg-blue-500',
  },
  {
    id: 'base64-encoder',
    name: 'Base64 编解码',
    description: '对文本和文件进行 Base64 编码和解码',
    icon: 'lucide:binary',
    category: 'encoding',
    tags: ['Base64', '编码', '解码'],
    color: 'bg-green-500',
  },
  {
    id: 'url-encoder',
    name: 'URL 编解码',
    description: 'URL 编码和解码工具，处理特殊字符',
    icon: 'lucide:link',
    category: 'encoding',
    tags: ['URL', '编码', '解码'],
    color: 'bg-purple-500',
  },
  {
    id: 'hash-generator',
    name: '哈希生成器',
    description: '生成 MD5、SHA1、SHA256 等哈希值',
    icon: 'lucide:hash',
    category: 'security',
    tags: ['哈希', 'MD5', 'SHA'],
    color: 'bg-orange-500',
  },
  {
    id: 'qr-generator',
    name: '二维码生成器',
    description: '生成和解析二维码，支持多种格式',
    icon: 'lucide:qr-code',
    category: 'utility',
    tags: ['二维码', '生成', '解析'],
    color: 'bg-cyan-500',
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    description: '颜色选择和转换工具，支持多种颜色格式',
    icon: 'lucide:palette',
    category: 'design',
    tags: ['颜色', '选择器', '转换'],
    color: 'bg-pink-500',
  },
  {
    id: 'timestamp-converter',
    name: '时间戳转换',
    description: '时间戳与日期时间的相互转换',
    icon: 'lucide:clock',
    category: 'utility',
    tags: ['时间戳', '日期', '转换'],
    color: 'bg-indigo-500',
  },
  {
    id: 'regex-tester',
    name: '正则表达式测试',
    description: '测试和验证正则表达式，实时匹配结果',
    icon: 'lucide:search',
    category: 'development',
    tags: ['正则', '测试', '匹配'],
    color: 'bg-red-500',
  },
])

// 工具分类
const categories = ref([
  { id: 'all', name: '全部', icon: 'lucide:grid-3x3' },
  { id: 'development', name: '开发工具', icon: 'lucide:code' },
  { id: 'encoding', name: '编码工具', icon: 'lucide:file-text' },
  { id: 'security', name: '安全工具', icon: 'lucide:shield' },
  { id: 'utility', name: '实用工具', icon: 'lucide:wrench' },
  { id: 'design', name: '设计工具', icon: 'lucide:paintbrush' },
])

// 当前选中的分类
const selectedCategory = ref('all')

// 搜索关键词
const searchKeyword = ref('')

// 计算属性：过滤后的工具列表
const filteredTools = computed(() => {
  let filtered = tools.value

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(tool => tool.category === selectedCategory.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(tool =>
      tool.name.toLowerCase().includes(keyword)
      || tool.description.toLowerCase().includes(keyword)
      || tool.tags.some(tag => tag.toLowerCase().includes(keyword)),
    )
  }

  return filtered
})

// 检查是否在工具详情页面
const isToolDetailPage = computed(() => {
  return route.params.tool && route.params.tool !== 'index'
})

// 当前工具信息
const currentTool = computed(() => {
  if (!isToolDetailPage.value) {
    return null
  }
  return tools.value.find(tool => tool.id === route.params.tool)
})

// 点击工具卡片
function handleToolClick(tool: any) {
  router.push(`/tools/${tool.id}`)
}

// 切换工具
function switchTool(toolId: string) {
  router.push(`/tools/${toolId}`)
}

// 返回工具列表
function backToToolList() {
  router.push('/tools')
}

// 获取分类中的工具数量
function getCategoryCount(categoryId: string) {
  if (categoryId === 'all') {
    return tools.value.length
  }
  return tools.value.filter(tool => tool.category === categoryId).length
}
</script>

<template>
  <div class="min-h-screen pb-16 bg-gray-950 pt-10 sm:pt-4 px-6">
    <!-- 工具详情页面布局 -->
    <div v-if="isToolDetailPage" class="flex flex-col h-screen">
      <!-- 顶部工具切换栏 -->
      <div class="bg-gray-900 border-b border-gray-800 p-4 lg:p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <!-- 移动端返回按钮 -->
            <button
              class="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              @click="backToToolList"
            >
              <Icon name="lucide:arrow-left" class="w-5 h-5" />
            </button>
            <!-- 桌面端返回按钮 -->
            <Button variant="ghost" size="sm" class="hidden lg:flex" @click="backToToolList">
              <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
              返回工具列表
            </Button>
            <div class="h-6 w-px bg-gray-700 hidden lg:block" />
            <h1 class="text-lg lg:text-xl font-semibold text-gray-100">
              {{ currentTool?.name || '工具详情' }}
            </h1>
          </div>
          <Badge v-if="currentTool" :class="currentTool.color" class="text-white">
            {{ categories.find(c => c.id === currentTool?.category)?.name }}
          </Badge>
        </div>

        <!-- 工具快速切换 -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="tool in tools"
            :key="tool.id"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            :class="[
              tool.id === currentTool?.id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            ]"
            @click="switchTool(tool.id)"
          >
            <Icon :name="tool.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ tool.name }}</span>
            <span class="sm:hidden">{{ tool.name.length > 6 ? `${tool.name.substring(0, 6)}...` : tool.name }}</span>
          </button>
        </div>
      </div>

      <!-- 工具工作区 -->
      <div class="flex-1 overflow-auto">
        <div class="p-4 lg:p-6">
          <!-- 这里将显示具体的工具内容 -->
          <Card class="bg-gray-900 border-gray-800">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="[currentTool?.color]">
                  <Icon :name="currentTool?.icon || 'lucide:tool'" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle class="text-gray-100">
                    {{ currentTool?.name }}
                  </CardTitle>
                  <CardDescription class="text-gray-400">
                    {{ currentTool?.description }}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="bg-gray-800 rounded-lg p-8 text-center">
                <Icon name="lucide:construction" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 class="text-xl font-semibold text-gray-300 mb-2">
                  工具开发中
                </h3>
                <p class="text-gray-500">
                  {{ currentTool?.name }} 功能正在开发中，敬请期待！
                </p>
                <div class="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge v-for="tag in currentTool?.tags" :key="tag" variant="outline" class="text-gray-400 border-gray-600">
                    {{ tag }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- 工具列表页面布局 -->
    <div v-else class="container mx-auto p-6">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-100 mb-4">
          工具箱
        </h1>
        <p class="text-gray-400 text-lg">
          精选实用工具，提升工作效率
        </p>
      </div>

      <!-- 搜索和筛选 -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <!-- 搜索框 -->
          <div class="relative flex-1 max-w-md">
            <Icon name="lucide:search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索工具..."
              class="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
          </div>

          <!-- 分类筛选 -->
          <div class="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            <button
              v-for="category in categories"
              :key="category.id"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              :class="[
                selectedCategory === category.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
              @click="selectedCategory = category.id"
            >
              <Icon :name="category.icon" class="w-4 h-4" />
              {{ category.name }}
              <Badge variant="secondary" class="ml-1 bg-gray-700 text-gray-300">
                {{ getCategoryCount(category.id) }}
              </Badge>
            </button>
          </div>
        </div>
      </div>

      <!-- 工具网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card
          v-for="tool in filteredTools"
          :key="tool.id"
          class="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-cyan-500/10"
          @click="handleToolClick(tool)"
        >
          <CardHeader class="pb-4">
            <div class="flex items-start justify-between">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform" :class="[tool.color]">
                <Icon :name="tool.icon" class="w-6 h-6 text-white" />
              </div>
              <Badge :class="tool.color" class="text-white text-xs">
                {{ categories.find(c => c.id === tool.category)?.name }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="pt-0">
            <h3 class="text-lg font-semibold text-gray-100 mb-2 group-hover:text-cyan-400 transition-colors">
              {{ tool.name }}
            </h3>
            <p class="text-gray-400 text-sm mb-4 line-clamp-2">
              {{ tool.description }}
            </p>
            <div class="flex flex-wrap gap-1">
              <Badge
                v-for="tag in tool.tags.slice(0, 3)"
                :key="tag"
                variant="outline"
                class="text-xs text-gray-400 border-gray-600"
              >
                {{ tag }}
              </Badge>
              <Badge
                v-if="tool.tags.length > 3"
                variant="outline"
                class="text-xs text-gray-400 border-gray-600"
              >
                +{{ tool.tags.length - 3 }}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTools.length === 0" class="text-center py-16">
        <Icon name="lucide:search-x" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-300 mb-2">
          未找到相关工具
        </h3>
        <p class="text-gray-500">
          尝试调整搜索关键词或选择其他分类
        </p>
        <Button variant="outline" class="mt-4" @click="searchKeyword = ''; selectedCategory = 'all'">
          <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          重置筛选
        </Button>
      </div>
    </div>
  </div>
</template>
