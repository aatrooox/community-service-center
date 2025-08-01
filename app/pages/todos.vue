<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTauriSQL } from '@/composables/useTauriSQL'

// 页面标题
useHead({
  title: '待办事项',
})

// 数据类型定义
interface TodoCategory {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface TodoTag {
  id: string
  name: string
  parentId?: string
  level: number
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  children?: TodoTag[]
}

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: number
  dueDate?: string
  categoryId?: string
  createdAt: string
  updatedAt: string
  category?: TodoCategory
  tags?: TodoTag[]
}

// 数据库接口
const {
  // isInitialized,
  // isLoading,
  // error,
  initDatabase,
  createTodoCategory: dbCreateTodoCategory,
  getAllTodoCategories: dbGetAllTodoCategories,
  // deleteTodoCategory: dbDeleteTodoCategory,
  createTodoTag: dbCreateTodoTag,
  getAllTodoTags: dbGetAllTodoTags,
  // deleteTodoTag: dbDeleteTodoTag,
  createTodo: dbCreateTodo,
  getAllTodos: dbGetAllTodos,
  updateTodo: dbUpdateTodo,
  deleteTodo: dbDeleteTodo,
} = useTauriSQL()

// 响应式数据
const todos = ref<Todo[]>([])
const categories = ref<TodoCategory[]>([])
const tags = ref<TodoTag[]>([])
const isCreateDialogOpen = ref(false)
const selectedFilter = ref('all')
const selectedCategory = ref('all')
const selectedTag = ref('all')
const searchKeyword = ref('')

// 新建待办表单数据
const newTodo = ref({
  title: '',
  description: '',
  priority: 2,
  dueDate: '',
  categoryId: '',
  tagIds: [] as string[],
})

const newCategoryName = ref('')
const newTagName = ref('')
const isCreatingCategory = ref(false)
const isCreatingTag = ref(false)

// 优先级选项
const priorityOptions = [
  { value: 1, label: '低', color: 'bg-gray-500' },
  { value: 2, label: '中', color: 'bg-blue-500' },
  { value: 3, label: '高', color: 'bg-orange-500' },
  { value: 4, label: '紧急', color: 'bg-red-500' },
]

// 筛选选项
const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待完成' },
  { value: 'completed', label: '已完成' },
  { value: 'overdue', label: '已逾期' },
]

// 计算属性
const filteredTodos = computed(() => {
  let result = todos.value

  // 按状态筛选
  if (selectedFilter.value === 'pending') {
    result = result.filter(todo => !todo.completed)
  }
  else if (selectedFilter.value === 'completed') {
    result = result.filter(todo => todo.completed)
  }
  else if (selectedFilter.value === 'overdue') {
    const now = new Date()
    result = result.filter(todo =>
      !todo.completed
      && todo.dueDate
      && new Date(todo.dueDate) < now,
    )
  }

  // 按分类筛选
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    result = result.filter(todo => todo.categoryId === selectedCategory.value)
  }

  // 按标签筛选
  if (selectedTag.value && selectedTag.value !== 'all') {
    result = result.filter(todo =>
      todo.tags?.some(tag => tag.id === selectedTag.value),
    )
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(todo =>
      todo.title.toLowerCase().includes(keyword)
      || todo.description?.toLowerCase().includes(keyword),
    )
  }

  return result.sort((a, b) => {
    // 优先级排序（紧急优先）
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    // 创建时间排序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const todoStats = computed(() => {
  const total = todos.value.length
  const completed = todos.value.filter(t => t.completed).length
  const pending = total - completed
  const now = new Date()
  const overdue = todos.value.filter(t =>
    !t.completed
    && t.dueDate
    && new Date(t.dueDate) < now,
  ).length

  return {
    total,
    completed,
    pending,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
})

// 方法
function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `逾期 ${Math.abs(diffDays)} 天`
  }
  else if (diffDays === 0) {
    return '今天到期'
  }
  else if (diffDays === 1) {
    return '明天到期'
  }
  else {
    return `${diffDays} 天后到期`
  }
}

function getPriorityInfo(priority: number) {
  return priorityOptions.find(p => p.value === priority) || priorityOptions[1]
}

// 筛选相关函数
function filterByCategory(categoryId: string) {
  selectedCategory.value = categoryId
  selectedTag.value = 'all' // 清除标签筛选
}

function filterByTag(tagId: string) {
  selectedTag.value = tagId
  selectedCategory.value = 'all' // 清除分类筛选
}

function clearFilters() {
  selectedFilter.value = 'all'
  selectedCategory.value = 'all'
  selectedTag.value = 'all'
}

async function createCategory() {
  if (!newCategoryName.value.trim())
    return

  const category: TodoCategory = {
    id: generateId(),
    name: newCategoryName.value.trim(),
    color: '#0891b2',
    icon: 'folder',
    sortOrder: categories.value.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    await dbCreateTodoCategory(category)
    categories.value.push(category)
    newTodo.value.categoryId = category.id
    newCategoryName.value = ''
    isCreatingCategory.value = false
  }
  catch (err) {
    console.error('创建分类失败:', err)
  }
}

async function createTag() {
  if (!newTagName.value.trim())
    return

  const tag: TodoTag = {
    id: generateId(),
    name: newTagName.value.trim(),
    level: 1,
    color: '#06b6d4',
    sortOrder: tags.value.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    await dbCreateTodoTag(tag)
    tags.value.push(tag)
    newTodo.value.tagIds.push(tag.id)
    newTagName.value = ''
    isCreatingTag.value = false
  }
  catch (err) {
    console.error('创建标签失败:', err)
  }
}

async function createTodo() {
  if (!newTodo.value.title.trim())
    return

  const todo = {
    id: generateId(),
    title: newTodo.value.title.trim(),
    description: newTodo.value.description.trim() || undefined,
    completed: false,
    priority: newTodo.value.priority,
    dueDate: newTodo.value.dueDate || undefined,
    categoryId: newTodo.value.categoryId || undefined,
    tagIds: newTodo.value.tagIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    await dbCreateTodo(todo)
    await loadTodos() // 重新加载待办列表

    // 重置表单
    newTodo.value = {
      title: '',
      description: '',
      priority: 2,
      dueDate: '',
      categoryId: '',
      tagIds: [],
    }

    isCreateDialogOpen.value = false
  }
  catch (err) {
    console.error('创建待办失败:', err)
  }
}

// 数据加载函数
async function loadTodos() {
  try {
    const todoList = await dbGetAllTodos()

    // 为每个待办事项关联分类和标签信息
    for (const todo of todoList) {
      // 关联分类信息
      if (todo.categoryId) {
        todo.category = categories.value.find(cat => cat.id === todo.categoryId)
      }

      // 关联标签信息
      if (todo.tagIds && todo.tagIds.length > 0) {
        todo.tags = tags.value.filter(tag => todo.tagIds.includes(tag.id))
      }
    }

    todos.value = todoList
  }
  catch (err) {
    console.error('加载待办列表失败:', err)
  }
}

async function loadCategories() {
  try {
    const categoryList = await dbGetAllTodoCategories()
    categories.value = categoryList
  }
  catch (err) {
    console.error('加载分类列表失败:', err)
  }
}

async function loadTags() {
  try {
    const tagList = await dbGetAllTodoTags()
    tags.value = tagList
  }
  catch (err) {
    console.error('加载标签列表失败:', err)
  }
}

async function toggleTodo(todoId: string, checked: boolean) {
  console.log('toggleTodo called with id:', todoId, 'checked:', checked)
  const todo = todos.value.find(t => t.id === todoId)
  console.log('Found todo:', todo)
  if (todo) {
    try {
      console.log('Updating todo completed status from', todo.completed, 'to', checked)
      await dbUpdateTodo(todoId, {
        completed: checked,
      })
      console.log('Database update successful, reloading todos...')
      // 重新加载数据以确保状态同步
      await loadTodos()
      console.log('Todos reloaded successfully')
    }
    catch (err) {
      console.error('更新待办状态失败:', err)
    }
  }
  else {
    console.error('Todo not found with id:', todoId)
  }
}

async function deleteTodo(todoId: string) {
  try {
    await dbDeleteTodo(todoId)
    const index = todos.value.findIndex(t => t.id === todoId)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
  }
  catch (err) {
    console.error('删除待办失败:', err)
  }
}

function toggleTagSelection(tagId: string) {
  const index = newTodo.value.tagIds.indexOf(tagId)
  if (index > -1) {
    newTodo.value.tagIds.splice(index, 1)
  }
  else {
    newTodo.value.tagIds.push(tagId)
  }
}

// 初始化数据
onMounted(async () => {
  try {
    // 初始化数据库
    await initDatabase()

    // 加载所有数据
    await Promise.all([
      loadCategories(),
      loadTags(),
      loadTodos(),
    ])

    // 如果没有分类，创建默认分类
    if (categories.value.length === 0) {
      const defaultCategory = {
        id: generateId(),
        name: '默认分类',
        description: '默认待办分类',
        color: '#0891b2',
        icon: 'folder',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await dbCreateTodoCategory(defaultCategory)
      categories.value.push(defaultCategory)
    }

    // 如果没有标签，创建默认标签
    if (tags.value.length === 0) {
      const defaultTags = [
        {
          id: generateId(),
          name: '重要',
          level: 1,
          color: '#ef4444',
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          name: '紧急',
          level: 1,
          color: '#f97316',
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      for (const tag of defaultTags) {
        await dbCreateTodoTag(tag)
        tags.value.push(tag)
      }
    }
  }
  catch (err) {
    console.error('初始化失败:', err)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 p-3">
    <!-- 页面标题和统计 -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-3">
        <h1 class="text-xl font-bold text-gray-100">
          待办事项
        </h1>
        <Dialog v-model:open="isCreateDialogOpen">
          <DialogTrigger as-child>
            <Button class="bg-cyan-600 hover:bg-cyan-500">
              <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
              新建待办
            </Button>
          </DialogTrigger>
          <DialogContent class="bg-gray-900 border-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>创建新的待办事项</DialogTitle>
              <DialogDescription class="text-gray-400">
                填写待办事项的详细信息，选择分类和标签
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-4">
              <!-- 标题 -->
              <div>
                <label class="text-sm font-medium text-gray-200 mb-2 block">标题 *</label>
                <Input
                  v-model="newTodo.title"
                  placeholder="输入待办事项标题"
                  class="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>

              <!-- 描述 -->
              <div>
                <label class="text-sm font-medium text-gray-200 mb-2 block">描述</label>
                <Textarea
                  v-model="newTodo.description"
                  placeholder="输入详细描述（可选）"
                  class="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>

              <!-- 优先级和截止日期 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-200 mb-2 block">优先级</label>
                  <Select v-model="newTodo.priority">
                    <SelectTrigger class="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent class="bg-gray-800 border-gray-700">
                      <SelectItem
                        v-for="option in priorityOptions"
                        :key="option.value"
                        :value="option.value"
                        class="text-gray-100 hover:bg-gray-700"
                      >
                        <div class="flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full" :class="[option.color]" />
                          {{ option.label }}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-200 mb-2 block">截止日期</label>
                  <Input
                    v-model="newTodo.dueDate"
                    type="datetime-local"
                    class="bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>
              </div>

              <!-- 分类选择 -->
              <div>
                <label class="text-sm font-medium text-gray-200 mb-2 block">分类</label>
                <div class="flex gap-2">
                  <Select v-model="newTodo.categoryId" class="flex-1">
                    <SelectTrigger class="bg-gray-800 border-gray-700 text-gray-100">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent class="bg-gray-800 border-gray-700">
                      <SelectItem
                        v-for="category in categories"
                        :key="category.id"
                        :value="category.id"
                        class="text-gray-100 hover:bg-gray-700"
                      >
                        <div class="flex items-center gap-2">
                          <Icon :name="`lucide:${category.icon}`" class="w-4 h-4" />
                          {{ category.name }}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    class="border-gray-700 text-gray-300 hover:bg-gray-800"
                    @click="isCreatingCategory = !isCreatingCategory"
                  >
                    <Icon name="lucide:plus" class="w-4 h-4" />
                  </Button>
                </div>

                <!-- 创建新分类 -->
                <div v-if="isCreatingCategory" class="mt-2 flex gap-2">
                  <Input
                    v-model="newCategoryName"
                    placeholder="输入新分类名称"
                    class="bg-gray-800 border-gray-700 text-gray-100"
                    @keyup.enter="createCategory"
                  />
                  <Button size="sm" class="bg-cyan-600 hover:bg-cyan-500" @click="createCategory">
                    创建
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    class="border-gray-700 text-gray-300"
                    @click="isCreatingCategory = false"
                  >
                    取消
                  </Button>
                </div>
              </div>

              <!-- 标签选择 -->
              <div>
                <label class="text-sm font-medium text-gray-200 mb-2 block">标签</label>
                <div class="space-y-2">
                  <!-- 现有标签 -->
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="tag in tags"
                      :key="tag.id"
                      :variant="newTodo.tagIds.includes(tag.id) ? 'default' : 'outline'"
                      class="cursor-pointer transition-colors"
                      :class="{
                        'bg-cyan-600 text-white': newTodo.tagIds.includes(tag.id),
                        'border-gray-600 text-gray-300 hover:bg-gray-800': !newTodo.tagIds.includes(tag.id),
                      }"
                      @click="toggleTagSelection(tag.id)"
                    >
                      {{ tag.name }}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      class="border-gray-700 text-gray-300 hover:bg-gray-800 h-6"
                      @click="isCreatingTag = !isCreatingTag"
                    >
                      <Icon name="lucide:plus" class="w-3 h-3" />
                    </Button>
                  </div>

                  <!-- 创建新标签 -->
                  <div v-if="isCreatingTag" class="flex gap-2">
                    <Input
                      v-model="newTagName"
                      placeholder="输入新标签名称"
                      class="bg-gray-800 border-gray-700 text-gray-100"
                      @keyup.enter="createTag"
                    />
                    <Button size="sm" class="bg-cyan-600 hover:bg-cyan-500" @click="createTag">
                      创建
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      class="border-gray-700 text-gray-300"
                      @click="isCreatingTag = false"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  class="border-gray-700 text-gray-300"
                  @click="isCreateDialogOpen = false"
                >
                  取消
                </Button>
                <Button
                  :disabled="!newTodo.title.trim()"
                  class="bg-cyan-600 hover:bg-cyan-500"
                  @click="createTodo"
                >
                  创建待办
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <!-- 简约统计信息 -->
      <div class="flex items-center justify-between mb-3">
        <div class="text-gray-400 text-xs">
          共 <span class="text-gray-100 font-medium">{{ todoStats.total }}</span> 条代办，
          还有 <span class="text-orange-500 font-medium">{{ todoStats.pending }}</span> 条未完成
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <!-- 状态筛选 -->
      <Select v-model="selectedFilter">
        <SelectTrigger class="bg-gray-900 border-gray-800 text-gray-100 w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent class="bg-gray-900 border-gray-800">
          <SelectItem
            v-for="option in filterOptions"
            :key="option.value"
            :value="option.value"
            class="text-gray-100 hover:bg-gray-800"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- 分类筛选 -->
      <Select v-model="selectedCategory">
        <SelectTrigger class="bg-gray-900 border-gray-800 text-gray-100 w-full sm:w-40">
          <SelectValue placeholder="选择分类" />
        </SelectTrigger>
        <SelectContent class="bg-gray-900 border-gray-800">
          <SelectItem value="all" class="text-gray-100 hover:bg-gray-800">
            全部分类
          </SelectItem>
          <SelectItem
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
            class="text-gray-100 hover:bg-gray-800"
          >
            <div class="flex items-center gap-2">
              <Icon :name="`lucide:${category.icon}`" class="w-4 h-4" />
              {{ category.name }}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- 标签筛选 -->
      <Select v-model="selectedTag">
        <SelectTrigger class="bg-gray-900 border-gray-800 text-gray-100 w-full sm:w-40">
          <SelectValue placeholder="选择标签" />
        </SelectTrigger>
        <SelectContent class="bg-gray-900 border-gray-800">
          <SelectItem value="all" class="text-gray-100 hover:bg-gray-800">
            全部标签
          </SelectItem>
          <SelectItem
            v-for="tag in tags"
            :key="tag.id"
            :value="tag.id"
            class="text-gray-100 hover:bg-gray-800"
          >
            {{ tag.name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- 清除筛选按钮 -->
      <Button
        v-if="(selectedCategory && selectedCategory !== 'all') || (selectedTag && selectedTag !== 'all') || selectedFilter !== 'all'"
        variant="outline"
        size="sm"
        class="border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap"
        @click="clearFilters"
      >
        <Icon name="lucide:x" class="w-4 h-4 mr-1" />
        清除筛选
      </Button>
    </div>

    <!-- 待办列表 -->
    <div class="space-y-2">
      <div v-if="filteredTodos.length === 0" class="text-center py-8">
        <Icon name="lucide:inbox" class="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p class="text-gray-400">
          暂无待办事项
        </p>
        <p class="text-gray-500 text-sm">
          点击上方按钮创建第一个待办事项
        </p>
      </div>

      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors rounded-lg p-3"
      >
        <div class="flex items-start gap-3">
          <!-- 完成状态 -->
          <Checkbox
            :model-value="todo.completed"
            class="mt-0.5"
            @update:model-value="(value: boolean | 'indeterminate') => toggleTodo(todo.id, Boolean(value))"
          />

          <!-- 主要内容 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h3
                  class="font-medium text-gray-100 text-sm leading-tight"
                  :class="{ 'line-through text-gray-500': todo.completed }"
                >
                  {{ todo.title }}
                </h3>

                <p
                  v-if="todo.description"
                  class="text-xs text-gray-400 mt-1 mb-2 line-clamp-2"
                  :class="{ 'line-through': todo.completed }"
                >
                  {{ todo.description }}
                </p>

                <!-- 标签和分类 -->
                <div class="flex flex-wrap items-center gap-1 mb-2">
                  <!-- 分类 -->
                  <Badge
                    v-if="todo.category"
                    variant="outline"
                    class="border-cyan-600 text-cyan-400 text-xs px-1.5 py-0.5 cursor-pointer hover:bg-cyan-600/20 transition-colors"
                    @click="filterByCategory(todo.category.id)"
                  >
                    <Icon :name="`lucide:${todo.category.icon}`" class="w-2.5 h-2.5 mr-1" />
                    {{ todo.category.name }}
                  </Badge>

                  <!-- 标签 -->
                  <Badge
                    v-for="tag in todo.tags"
                    :key="tag.id"
                    variant="outline"
                    class="border-gray-600 text-gray-300 text-xs px-1.5 py-0.5 cursor-pointer hover:bg-gray-600/20 transition-colors"
                    @click="filterByTag(tag.id)"
                  >
                    {{ tag.name }}
                  </Badge>

                  <!-- 优先级 -->
                  <Badge
                    :class="getPriorityInfo(todo.priority)?.color"
                    class="text-white text-xs px-1.5 py-0.5"
                  >
                    {{ getPriorityInfo(todo.priority)?.label }}
                  </Badge>
                </div>

                <!-- 截止日期 -->
                <div v-if="todo.dueDate" class="flex items-center gap-1 text-xs">
                  <Icon name="lucide:calendar" class="w-3 h-3" />
                  <span
                    :class="{
                      'text-red-400': !todo.completed && new Date(todo.dueDate) < new Date(),
                      'text-orange-400': !todo.completed && new Date(todo.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000,
                      'text-gray-400': todo.completed || new Date(todo.dueDate).getTime() - new Date().getTime() >= 24 * 60 * 60 * 1000,
                    }"
                  >
                    {{ formatDate(todo.dueDate) }}
                  </span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                  @click="deleteTodo(todo.id)"
                >
                  <Icon name="lucide:trash-2" class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
