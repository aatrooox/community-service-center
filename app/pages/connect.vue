<script setup lang="ts">
import { nextTick } from 'vue'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useLog } from '@/composables/useLog'
import { useTauriSQL } from '@/composables/useTauriSQL'
import { useToast } from '@/composables/useToast'

// 页面标题
useHead({
  title: '链接管理',
})

// 数据类型定义
interface LinkEntity {
  id: number
  name: string
  description?: string
  affectionPoints: number // 好感度积分
  color: string
  icon: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface LinkTag {
  id: number
  name: string
  color: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface LinkTask {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: number
  dueDate?: string
  linkEntityId: number
  tagId?: number
  createdAt: string
  updatedAt: string
  linkEntity?: LinkEntity
  tag?: LinkTag
}

// 数据库接口
const {
  initDatabase,
  createLinkEntity: dbCreateLinkEntity,
  getAllLinkEntities: dbGetAllLinkEntities,
  // updateLinkEntity: dbUpdateLinkEntity,
  deleteLinkEntity: dbDeleteLinkEntity,
  createLinkTag: dbCreateLinkTag,
  getAllLinkTags: dbGetAllLinkTags,
  createLinkTask: dbCreateLinkTask,
  getAllLinkTasks: dbGetAllLinkTasks,
  updateLinkTask: dbUpdateLinkTask,
  deleteLinkTask: dbDeleteLinkTask,
  addAffectionPoints,
  getAffectionPoints,
} = useTauriSQL()

// Toast 提示
const toast = useToast()

// 日志记录
const { info, error, debug } = useLog()

// 响应式数据
const linkEntities = ref<LinkEntity[]>([])
const linkTags = ref<LinkTag[]>([])
const linkTasks = ref<LinkTask[]>([])
const isCreateEntityDialogOpen = ref(false)
const isCreateTaskDialogOpen = ref(false)
const affectionPoints = ref<Record<number, number>>({})

// Dialog control
function updateEntityDialog(open: boolean) {
  isCreateEntityDialogOpen.value = open
}

function updateTaskDialog(open: boolean) {
  isCreateTaskDialogOpen.value = open
}
const selectedEntity = ref<number | 'all'>('all')
const selectedTag = ref<number | 'all'>('all')
const selectedFilter = ref('all')
const searchKeyword = ref('')

// 新建链接实体表单数据
const newLinkEntity = ref({
  name: '',
  description: '',
  color: '#0891b2',
  icon: 'user',
  startDate: new Date().toISOString().split('T')[0],
})

// 新建任务表单数据
const newLinkTask = ref({
  title: '',
  description: '',
  priority: '2',
  dueDate: '',
  linkEntityId: '',
  tagId: '',
})

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

const linkStats = computed(() => {
  const totalEntities = linkEntities.value.length
  const totalTasks = linkTasks.value.length
  const completedTasks = linkTasks.value.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const now = new Date()
  const overdueTasks = linkTasks.value.filter(t =>
    !t.completed
    && t.dueDate
    && new Date(t.dueDate) < now,
  ).length
  const totalPoints = Object.values(affectionPoints.value).reduce((sum, points) => sum + points, 0)

  return {
    totalEntities,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    totalPoints,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  }
})

// 筛选后的链接实体
const filteredEntities = computed(() => {
  return linkEntities.value.filter((entity) => {
    const entityTasks = getEntityTasks(entity.id)
    return entityTasks.length > 0 || selectedEntity.value === 'all'
  })
})

// 获取指定实体的任务
function getEntityTasks(entityId: number) {
  let result = linkTasks.value.filter((task) => {
    return task.linkEntityId === entityId
  })

  // 应用除实体筛选外的其他筛选条件
  // 按状态筛选
  if (selectedFilter.value === 'pending') {
    result = result.filter(task => !task.completed)
  }
  else if (selectedFilter.value === 'completed') {
    result = result.filter(task => task.completed)
  }
  else if (selectedFilter.value === 'overdue') {
    const now = new Date()
    result = result.filter(task =>
      !task.completed
      && task.dueDate
      && new Date(task.dueDate) < now,
    )
  }

  // 按标签筛选
  if (selectedTag.value && selectedTag.value !== 'all') {
    result = result.filter(task => task.tagId === selectedTag.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(task =>
      task.title.toLowerCase().includes(keyword)
      || task.description?.toLowerCase().includes(keyword),
    )
  }

  return result.sort((a, b) => {
    // 首先按完成状态排序（未完成在前）
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 优先级排序（紧急优先）
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    // 创建时间排序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

// 移除链接度计算逻辑，改用积分制

// 方法 - 移除generateId函数，使用数据库自增ID

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

function clearFilters() {
  selectedFilter.value = 'all'
  selectedEntity.value = 'all'
  selectedTag.value = 'all'
}

async function handleCreateLinkEntity() {
  // 验证必填字段
  if (!newLinkEntity.value.name.trim()) {
    error('创建链接实体失败：名称为空', undefined, { tag: 'LinkEntity' })
    toast.error('请输入链接实体名称')
    return
  }

  const entity = {
    name: newLinkEntity.value.name.trim(),
    description: newLinkEntity.value.description.trim() || undefined,
    affectionPoints: 0,
    startDate: newLinkEntity.value.startDate,
    color: newLinkEntity.value.color,
    icon: newLinkEntity.value.icon,
  }

  debug('开始创建链接实体', { tag: 'LinkEntity', context: { ...entity } })
  try {
    const newId = await dbCreateLinkEntity(entity)
    linkEntities.value.push({
      id: newId,
      name: entity.name,
      description: entity.description,
      affectionPoints: entity.affectionPoints,
      startDate: entity.startDate as string,
      color: entity.color,
      icon: entity.icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 显示成功提示
    info(`链接实体创建成功：${entity.name}`, { tag: 'LinkEntity', context: { id: newId, name: entity.name } })
    toast.success(`链接实体「${entity.name}」已创建`)

    // 重置表单
    newLinkEntity.value = {
      name: '',
      description: '',
      color: '#0891b2',
      icon: 'user',
      startDate: new Date().toISOString().split('T')[0],
    }
    updateEntityDialog(false)
  }
  catch (err) {
    error('创建链接实体时发生错误', err as Error, { tag: 'LinkEntity', context: { entityData: entity } })
    toast.error('创建链接实体时发生错误，请重试')
  }
}

function handleAddTask(entityId: number) {
  newLinkTask.value.linkEntityId = String(entityId)
  nextTick(() => {
    updateTaskDialog(true)
  })
}

async function handleCreateLinkTask() {
  debug('开始创建链接任务', { tag: 'LinkTask', context: { title: newLinkTask.value.title, entityId: newLinkTask.value.linkEntityId } })

  // 验证必填字段
  if (!newLinkTask.value.title.trim()) {
    error('创建链接任务失败：标题为空', undefined, { tag: 'LinkTask' })
    toast.error('请输入任务标题')
    return
  }

  if (!newLinkTask.value.linkEntityId) {
    error('创建链接任务失败：未选择关联实体', undefined, { tag: 'LinkTask' })
    toast.error('请选择关联的链接实体')
    return
  }

  const task = {
    title: newLinkTask.value.title.trim(),
    description: newLinkTask.value.description?.trim() || undefined,
    completed: false,
    priority: Number(newLinkTask.value.priority),
    dueDate: newLinkTask.value.dueDate || undefined,
    entityId: Number(newLinkTask.value.linkEntityId),
    tagId: newLinkTask.value.tagId ? Number(newLinkTask.value.tagId) : undefined,
  }

  try {
    await dbCreateLinkTask(task)

    // 移除链接度更新逻辑

    // 添加积分（创建任务+1分）
    await addAffectionPoints(Number(newLinkTask.value.linkEntityId), 1)
    affectionPoints.value[Number(newLinkTask.value.linkEntityId)] = (affectionPoints.value[Number(newLinkTask.value.linkEntityId)] || 0) + 1

    // 重新加载任务列表
    await loadLinkTasks()

    // 显示成功提示
    info(`链接任务创建成功：${task.title}`, { tag: 'LinkTask', context: { title: task.title, entityId: task.entityId } })
    toast.success(`任务「${task.title}」已创建，获得1积分！`)

    // 重置表单
    newLinkTask.value = {
      title: '',
      description: '',
      priority: '2',
      dueDate: '',
      linkEntityId: '',
      tagId: '',
    }
    updateTaskDialog(false)
  }
  catch (err) {
    error('创建链接任务时发生错误', err as Error, { tag: 'LinkTask', context: { taskData: task } })
    toast.error('创建任务时发生错误，请重试')
  }
}

// 移除链接度更新函数

// 数据加载函数
async function loadLinkEntities() {
  try {
    const entityList = await dbGetAllLinkEntities()
    linkEntities.value = entityList
  }
  catch (err) {
    console.error('加载链接实体列表失败:', err)
  }
}

async function loadLinkTags() {
  try {
    const tagList = await dbGetAllLinkTags()
    linkTags.value = tagList
  }
  catch (err) {
    console.error('加载标签列表失败:', err)
  }
}

async function loadLinkTasks() {
  try {
    const taskList = await dbGetAllLinkTasks()
    linkTasks.value = taskList
  }
  catch (err) {
    console.error('加载任务列表失败:', err)
  }
}

async function loadAffectionPoints() {
  try {
    for (const entity of linkEntities.value) {
      const points = await getAffectionPoints(entity.id)
      affectionPoints.value[entity.id] = points
    }
  }
  catch (err) {
    console.error('加载积分失败:', err)
  }
}

async function toggleLinkTask(taskId: number, checked: boolean) {
  const task = linkTasks.value.find(t => t.id === taskId)
  if (task) {
    try {
      await dbUpdateLinkTask(taskId, {
        completed: checked,
      })

      // 更新任务状态
      task.completed = checked

      // 如果是完成任务，添加积分（完成任务+10分）
      if (checked) {
        await addAffectionPoints(task.linkEntityId, 10)
        affectionPoints.value[task.linkEntityId] = (affectionPoints.value[task.linkEntityId] || 0) + 10
        toast.success('任务完成，获得10积分！')
      }

      // 移除链接度更新逻辑

      // 重新加载数据
      await loadLinkEntities()
    }
    catch (err) {
      console.error('更新任务状态失败:', err)
    }
  }
}

async function handleDeleteLinkTask(taskId: number) {
  try {
    const task = linkTasks.value.find(t => t.id === taskId)
    if (task) {
      await dbDeleteLinkTask(taskId)
      // 从本地数组中移除
      const index = linkTasks.value.findIndex(t => t.id === taskId)
      if (index > -1) {
        linkTasks.value.splice(index, 1)
      }
    }
  }
  catch (err) {
    console.error('删除任务失败:', err)
  }
}

async function handleDeleteEntity(entityId: number, entityName: string) {
  // 使用 sonner 显示确认提示
  toast.warning(`确认删除实体 "${entityName}" 及其所有任务吗？`, {
    description: '此操作不可撤销！',
    action: {
      label: '确认删除',
      onClick: async () => {
        try {
          // 显示加载提示
          const loadingToast = toast.loading('正在删除...')

          // 删除该实体的所有任务
          const entityTasks = linkTasks.value.filter(task => task.linkEntityId === entityId)
          for (const task of entityTasks) {
            await dbDeleteLinkTask(task.id)
          }

          // 删除实体
          await dbDeleteLinkEntity(entityId)

          // 从本地数组中移除
          const entityIndex = linkEntities.value.findIndex(e => e.id === entityId)
          if (entityIndex > -1) {
            linkEntities.value.splice(entityIndex, 1)
          }

          // 移除该实体的所有任务
          linkTasks.value = linkTasks.value.filter(task => task.linkEntityId !== entityId)

          // 移除积分记录
          delete affectionPoints.value[entityId]

          // 关闭加载提示并显示成功消息
          toast.dismiss(loadingToast)
          toast.success('删除成功')
        }
        catch (err) {
          console.error('删除实体失败:', err)
          toast.error('删除失败，请重试')
        }
      },
    },
    cancel: {
      label: '取消',
    },
    duration: 10000, // 10秒后自动消失
  })
}

// 初始化数据
onMounted(async () => {
  info('链接管理页面开始初始化', { tag: 'PageInit' })

  try {
    // 初始化数据库
    debug('初始化数据库', { tag: 'Database' })
    await initDatabase()

    // 按顺序加载数据
    await loadLinkEntities()
    await loadLinkTags()
    await loadLinkTasks()
    await loadAffectionPoints()

    // 如果没有标签，创建默认标签
    if (linkTags.value.length === 0) {
      const defaultTags = [
        {
          name: '日常维护',
          color: '#06b6d4',
          sortOrder: 1,
        },
        {
          name: '重要事件',
          color: '#ef4444',
          sortOrder: 2,
        },
        {
          name: '定期联系',
          color: '#f97316',
          sortOrder: 3,
        },
      ]

      for (const tag of defaultTags) {
        const newId = await dbCreateLinkTag(tag)
        const newTag: LinkTag = {
          ...tag,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        linkTags.value.push(newTag)
      }
    }

    // 移除自动创建示例实体的逻辑
    // 用户可以手动创建需要的链接实体
  }
  catch (err) {
    console.error('初始化失败:', err)
  }
})
</script>

<template>
  <div class="pixel-dashboard px-3 py-4 md:px-8 md:py-10 max-w-5xl mx-auto">
    <!-- 像素风格页面头部 -->
    <div class="pixel-header mb-2">
      <div class="pixel-title">
        <span class="pixel-title text-[var(--pixel-text-primary)]">
          <span class="pixel-icon">🔗</span>
          <span>Connect</span>
        </span>
        <div class="pixel-status">
          <span class="pixel-status-dot online" />
          <span>【量化】关系</span>
        </div>
      </div>
    </div>
    <div>
      <!-- 主要内容区域 -->
      <div class="pixel-content">
        <!-- 操作按钮区域 -->
        <div class="hidden sm:pixel-card sm:mb-4">
          <div class="flex gap-3">
            <Button class="pixel-btn" @click="updateEntityDialog(true)">
              <Icon name="lucide:user-plus" class="w-4 h-4 mr-2" />
              新活动
            </Button>

            <Button class="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium" @click="updateTaskDialog(true)">
              <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
              新任务
            </Button>
          </div>
        </div>
        <!-- 移动端操作按钮 -->
        <div class="flex gap-2 mb-3 justify-between md:hidden">
          <Button class="pixel-btn text-xs px-3 py-2" @click="updateEntityDialog(true)">
            <Icon name="lucide:user-plus" class="w-3 h-3 mr-1" />
            <span class="hidden sm:inline">新活动</span><span class="sm:hidden">活动</span>
          </Button>

          <Button class="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-xl font-medium text-xs" @click="updateTaskDialog(true)">
            <Icon name="lucide:plus" class="w-3 h-3 mr-1" />
            <span class="hidden sm:inline">新任务</span><span class="sm:hidden">任务</span>
          </Button>
        </div>
        <!-- 统计信息 -->
        <div class="pixel-card md:mb-6 mb-4">
          <div class="hidden md:pixel-card-header">
            <span class="pixel-card-title text-[var(--pixel-text-primary)]">📊 统计</span>
          </div>
          <div class="flex items-center justify-between text-xs md:text-lg px-2 md:px-4 py-2">
            <span class="text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <span class="font-bold">{{ linkStats.totalEntities }}</span> <Icon name="lucide:paperclip" />
            </span>
            <span class="text-orange-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <span class="font-bold">{{ linkStats.totalTasks }}</span> <Icon name="lucide:list-todo" />
            </span>
            <span class="text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <span class="font-bold">{{ linkStats.completedTasks }}</span> <Icon name="lucide:check" />
            </span>
            <span class="text-yellow-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <span class="font-bold">{{ linkStats.totalPoints }}</span> <Icon name="lucide:heart-handshake" />
            </span>
          </div>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="pixel-card md:mb-6 mb-2">
        <!-- 桌面端筛选栏 -->
        <div class="hidden md:grid grid-cols-4 gap-4">
          <!-- 状态筛选 -->
          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">完成状态</label>
            <Select v-model="selectedFilter">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem
                  v-for="option in filterOptions"
                  :key="option.value"
                  :value="option.value"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 链接实体筛选 -->
          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">链接</label>
            <Select v-model="selectedEntity">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                <SelectValue placeholder="SELECT LINK" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem value="all" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  ALL LINKS
                </SelectItem>
                <SelectItem
                  v-for="entity in linkEntities"
                  :key="entity.id"
                  :value="entity.id"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                >
                  <div class="flex items-center gap-2">
                    <Icon :name="`lucide:${entity.icon}`" class="w-4 h-4" />
                    {{ entity.name }}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 标签筛选 -->
          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">标签</label>
            <Select v-model="selectedTag">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                <SelectValue placeholder="SELECT TAG" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem value="all" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                  ALL TAGS
                </SelectItem>
                <SelectItem
                  v-for="tag in linkTags"
                  :key="tag.id"
                  :value="tag.id"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                >
                  {{ tag.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 清除筛选按钮 -->
          <div class="flex items-end">
            <Button
              v-if="(selectedEntity && selectedEntity !== 'all') || (selectedTag && selectedTag !== 'all') || selectedFilter !== 'all'"
              class="pixel-btn border-2 border-[var(--pixel-border)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)] font-mono uppercase tracking-wider w-full"
              @click="clearFilters"
            >
              <Icon name="lucide:x" class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>

        <!-- 移动端筛选栏 -->
        <div class="md:hidden flex gap-2 overflow-x-auto pb-2">
          <!-- 状态筛选 -->
          <div class="min-w-[60px]">
            <Select v-model="selectedFilter">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono text-xs h-8">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem
                  v-for="option in filterOptions"
                  :key="option.value"
                  :value="option.value"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)] text-xs"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 链接实体筛选 -->
          <div class="min-w-[100px]">
            <Select v-model="selectedEntity">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono text-xs h-8">
                <SelectValue placeholder="链接" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem value="all" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)] text-xs">
                  全部链接
                </SelectItem>
                <SelectItem
                  v-for="entity in linkEntities"
                  :key="entity.id"
                  :value="entity.id"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)] text-xs"
                >
                  <div class="flex items-center gap-1">
                    <Icon :name="`lucide:${entity.icon}`" class="w-3 h-3" />
                    {{ entity.name }}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 标签筛选 -->
          <div class="min-w-[100px]">
            <Select v-model="selectedTag">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono text-xs h-8">
                <SelectValue placeholder="标签" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem value="all" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)] text-xs">
                  全部标签
                </SelectItem>
                <SelectItem
                  v-for="tag in linkTags"
                  :key="tag.id"
                  :value="tag.id"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)] text-xs"
                >
                  {{ tag.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 清除筛选按钮 -->
          <div v-if="(selectedEntity && selectedEntity !== 'all') || (selectedTag && selectedTag !== 'all') || selectedFilter !== 'all'" class="flex-shrink-0">
            <Button
              class="pixel-btn border-2 border-[var(--pixel-border)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)] font-mono text-xs h-8 px-2"
              @click="clearFilters"
            >
              <Icon name="lucide:x" class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <!-- 链接实体和任务列表 -->
      <div class="md:space-y-6 space-y-2">
        <!-- 按链接实体分组显示 -->
        <div v-for="entity in filteredEntities" :key="entity.id" class="pixel-card">
          <!-- 实体头部 -->
          <div class="pixel-card-header border-b-2 mb-2 border-[var(--pixel-border)]">
            <div class="flex items-center justify-between">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 pixel-icon flex items-center justify-center text-[var(--pixel-text-primary)]" :style="{ backgroundColor: entity.color }">
                  <Icon :name="`lucide:${entity.icon}`" class="w-6 h-6" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm md:text-xl font-bold text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider">
                      {{ entity.name }}
                    </h3>
                    <p v-if="entity.description" class="text-xs text-[var(--pixel-text-secondary)] font-mono ml-2 md:ml-4 hidden md:block">
                      {{ entity.description }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 md:gap-4 mt-1 text-xs font-mono">
                    <div class="text-cyan-400 uppercase tracking-wider flex items-center">
                      <span>{{ getEntityTasks(entity.id).length }} </span>
                      <Icon name="lucide:list-todo" size="0.8em" class="md:size-[1em]" />
                      <span class="hidden md:inline ml-1">TASKS</span>
                    </div>
                    <div class="text-yellow-400 uppercase tracking-wider flex items-center">
                      <span>{{ affectionPoints[entity.id] || 0 }}</span>
                      <Icon name="lucide:heart-handshake" size="0.8em" class="md:size-[1em]" />
                      <span class="hidden md:inline ml-1">PTS</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  size="sm"
                  class="pixel-btn bg-[var(--pixel-accent)] hover:bg-[var(--pixel-accent-hover)] text-[var(--pixel-text-primary)] px-2 md:px-4 py-1 md:py-2 font-mono uppercase tracking-wider text-xs"
                  @click="handleAddTask(entity.id)"
                >
                  <Icon name="lucide:plus" class="w-3 h-3 mr-0 md:mr-1" />
                  <span class="hidden md:inline">ADD</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  class="pixel-btn bg-red-600 hover:bg-red-700 text-white px-2 md:px-3 py-1 md:py-2 font-mono uppercase tracking-wider text-xs"
                  @click="handleDeleteEntity(entity.id, entity.name)"
                >
                  <Icon name="lucide:trash-2" class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="divide-y-2 divide-[var(--pixel-border)] space-y-2">
            <div
              v-for="task in getEntityTasks(entity.id)"
              :key="task.id"
              class="p-2 md:p-3 hover:bg-[var(--pixel-bg-tertiary)] transition-colors border-2 border-[var(--pixel-border)] shadow-lg"
            >
              <!-- 紧凑单行布局 -->
              <div class="flex items-center gap-2 md:gap-3">
                <!-- 任务标题和描述 -->
                <div class="flex-1 min-w-0">
                  <span
                    class="text-xs md:text-sm font-bold font-mono uppercase tracking-wider" :class="[
                      task.completed ? 'text-[var(--pixel-text-muted)] line-through' : 'text-[var(--pixel-text-primary)]',
                    ]"
                  >
                    {{ task.title }}
                  </span>
                  <span v-if="task.description" class="text-xs text-[var(--pixel-text-secondary)] font-mono ml-1 md:ml-2 hidden md:inline">
                    （{{ task.description }}）
                  </span>
                </div>

                <!-- 截止时间 -->
                <span v-if="task.dueDate" class="text-cyan-400 uppercase tracking-wider text-xs font-mono flex-shrink-0 hidden md:inline">
                  {{ formatDate(task.dueDate) }}
                </span>

                <!-- 优先级标签 -->
                <span
                  :class="getPriorityInfo(task.priority)?.color || 'bg-gray-500'"
                  class="text-xs font-mono uppercase tracking-wider flex-shrink-0 border px-1 py-0.5 text-white"
                >
                  <span class="hidden md:inline">{{ getPriorityInfo(task.priority)?.label || '中' }}</span>
                  <span class="md:hidden">{{ (getPriorityInfo(task.priority)?.label || '中').charAt(0) }}</span>
                </span>

                <!-- 标签 -->
                <span
                  v-if="task.tagId && linkTags.find(t => t.id === task.tagId)"
                  class="border border-cyan-400 text-cyan-400 px-1 py-0.5 text-xs font-mono uppercase tracking-wider flex-shrink-0 hidden md:inline"
                >
                  {{ linkTags.find(t => t.id === task.tagId)?.name }}
                </span>

                <!-- 完成按钮 -->
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-xs px-1.5 md:px-2 py-1 font-mono border-2 rounded transition-colors flex-shrink-0 shadow-md"
                  :class="{
                    'bg-green-600 border-green-500 text-white hover:bg-green-500': task.completed,
                    'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600': !task.completed,
                  }"
                  :title="task.completed ? '标记为未完成' : '标记为完成'"
                  @click="toggleLinkTask(task.id, !task.completed)"
                >
                  {{ task.completed ? '✓' : '○' }}
                </Button>

                <!-- 删除按钮 -->
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-xs px-1.5 md:px-2 py-1 font-mono border-2 border-red-600 bg-red-600 text-white hover:bg-red-500 hover:border-red-500 rounded transition-colors flex-shrink-0 shadow-md"
                  title="删除任务"
                  @click="handleDeleteLinkTask(task.id)"
                >
                  ✕
                </Button>
              </div>
            </div>

            <!-- 无任务状态 -->
            <div v-if="getEntityTasks(entity.id).length === 0" class="p-4 md:p-8 text-center">
              <Icon name="lucide:clipboard-check" class="w-8 h-8 md:w-12 md:h-12 text-[var(--pixel-text-muted)] mx-auto mb-2 md:mb-3 pixel-icon" />
              <p class="text-xs md:text-sm text-[var(--pixel-text-secondary)] mb-3 md:mb-4 font-mono uppercase tracking-wider">
                <span class="md:hidden">NO TASKS</span>
                <span class="hidden md:inline">NO MAINTENANCE TASKS</span>
              </p>
              <Button
                size="sm"
                class="pixel-btn bg-[var(--pixel-accent)] hover:bg-[var(--pixel-accent-hover)] text-[var(--pixel-text-primary)] px-2 md:px-4 py-1 md:py-2 font-mono uppercase tracking-wider text-xs"
                @click="handleAddTask(entity.id)"
              >
                <Icon name="lucide:plus" class="w-3 h-3 mr-0 md:mr-1" />
                <span class="hidden md:inline">ADD TASK</span>
              </Button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredEntities.length === 0" class="pixel-card p-6 md:p-12 text-center">
          <Icon name="lucide:users" class="w-12 h-12 md:w-16 md:h-16 text-[var(--pixel-text-muted)] mx-auto mb-3 md:mb-6 pixel-icon" />
          <h3 class="text-sm md:text-xl font-bold text-[var(--pixel-text-primary)] mb-2 md:mb-3 font-mono uppercase tracking-wider">
            <span class="md:hidden">NO LINKS</span>
            <span class="hidden md:inline">NO LINK ENTITIES</span>
          </h3>
          <p class="text-xs md:text-sm text-[var(--pixel-text-secondary)] mb-4 md:mb-6 font-mono">
            <span class="md:hidden">CREATE YOUR FIRST LINK</span>
            <span class="hidden md:inline">CREATE YOUR FIRST LINK ENTITY TO START MANAGING RELATIONSHIPS</span>
          </p>
          <Button
            class="pixel-btn bg-[var(--pixel-accent)] hover:bg-[var(--pixel-accent-hover)] text-[var(--pixel-text-primary)] px-3 md:px-6 py-2 md:py-3 font-mono uppercase tracking-wider text-xs md:text-sm"
            @click="updateEntityDialog(true)"
          >
            <Icon name="lucide:user-plus" class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span class="hidden md:inline">CREATE LINK</span>
            <span class="md:hidden">CREATE</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Dialogs at bottom -->
    <Drawer :open="isCreateEntityDialogOpen" @update:open="updateEntityDialog">
      <DrawerContent class="pixel-card border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg-secondary)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="pixel-text-cyan text-lg font-bold uppercase tracking-wider">
            创建新的实体
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono text-sm">
            记得增加待办，维持与实体的关系
          </DrawerDescription>
        </DrawerHeader>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">名称 *</label>
            <Input
              v-model="newLinkEntity.name"
              placeholder="输入名称"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">描述</label>
            <Textarea
              v-model="newLinkEntity.description"
              placeholder="输入描述 (可选)"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">图标</label>
              <Select v-model:model-value="newLinkEntity.icon">
                <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                  <SelectItem value="user" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                    👤 PERSON
                  </SelectItem>
                  <SelectItem value="heart" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                    ❤️ FAMILY
                  </SelectItem>
                  <SelectItem value="users" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                    👥 FRIENDS
                  </SelectItem>
                  <SelectItem value="briefcase" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                    💼 WORK
                  </SelectItem>
                  <SelectItem value="star" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                    ⭐ IMPORTANT
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">颜色</label>
              <Input
                v-model="newLinkEntity.color"
                type="color"
                class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] h-10 font-mono"
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-300 mb-2 block">开始日期</label>
            <Input
              v-model="newLinkEntity.startDate"
              type="date"
              class="bg-gray-800 border-gray-700 text-gray-100"
            />
          </div>
        </div>
        <DrawerFooter>
          <div class="flex justify-end gap-2">
            <DrawerClose as-child>
              <Button
                variant="outline"
                class="pixel-btn border-2 border-[var(--pixel-border)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)] font-mono uppercase tracking-wider"
                @click="updateEntityDialog(false)"
              >
                取消
              </Button>
            </DrawerClose>
            <Button
              :disabled="!newLinkEntity.name.trim()"
              class="pixel-btn bg-[var(--pixel-accent)] hover:bg-[var(--pixel-accent-hover)] text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider"
              @click="handleCreateLinkEntity"
            >
              创建
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <Drawer :open="isCreateTaskDialogOpen" @update:open="updateTaskDialog">
      <DrawerContent class="pixel-card border-4 border-[var(--pixel-border)] bg-[var(--pixel-bg-secondary)] text-[var(--pixel-text-primary)]">
        <DrawerHeader>
          <DrawerTitle class="pixel-text-cyan text-lg font-bold uppercase tracking-wider">
            创建新待办
          </DrawerTitle>
          <DrawerDescription class="text-[var(--pixel-text-secondary)] font-mono text-xs">
            完成待办会提升更多链接度
          </DrawerDescription>
        </DrawerHeader>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">实体 *</label>
            <Select v-model:model-value="newLinkTask.linkEntityId">
              <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                <SelectValue placeholder="SELECT LINK TO MAINTAIN" />
              </SelectTrigger>
              <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                <SelectItem
                  v-for="entity in linkEntities"
                  :key="entity.id"
                  :value="String(entity.id)"
                  class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                >
                  <div class="flex items-center gap-2">
                    <Icon :name="`lucide:${entity.icon}`" class="w-4 h-4" />
                    {{ entity.name }}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">标题 *</label>
            <Input
              v-model="newLinkTask.title"
              placeholder="输入标题"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">描述</label>
            <Textarea
              v-model="newLinkTask.description"
              placeholder="输入描述 (可选)"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] placeholder-[var(--pixel-text-muted)] font-mono"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">优先级</label>
              <Select v-model:model-value="newLinkTask.priority">
                <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                  <SelectItem
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :value="String(option.value)"
                    class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full" :class="[option.color]" />
                      {{ option.label }}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- <div>
              <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">TAG</label>
              <Select v-model="newLinkTask.tagId">
                <SelectTrigger class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono">
                  <SelectValue placeholder="SELECT TAG" />
                </SelectTrigger>
                <SelectContent class="bg-[var(--pixel-bg-secondary)] border-2 border-[var(--pixel-border)]">
                  <SelectItem value="" class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]">
                    NO TAG
                  </SelectItem>
                  <SelectItem
                    v-for="tag in linkTags"
                    :key="tag.id"
                    :value="String(tag.id)"
                    class="text-[var(--pixel-text-primary)] font-mono hover:bg-[var(--pixel-bg-tertiary)]"
                  >
                    {{ tag.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> -->
          </div>

          <div>
            <label class="text-xs font-bold text-[var(--pixel-text-secondary)] mb-2 block uppercase tracking-wider font-mono">截止时间</label>
            <Input
              v-model="newLinkTask.dueDate"
              type="datetime-local"
              class="bg-[var(--pixel-bg-primary)] border-2 border-[var(--pixel-border)] text-[var(--pixel-text-primary)] font-mono"
            />
          </div>
        </div>
        <DrawerFooter>
          <div class="flex justify-end gap-2">
            <DrawerClose as-child>
              <Button
                variant="outline"
                class="pixel-btn border-2 border-[var(--pixel-border)] text-[var(--pixel-text-secondary)] hover:bg-[var(--pixel-bg-tertiary)] font-mono uppercase tracking-wider"
                @click="updateTaskDialog(false)"
              >
                取消
              </Button>
            </DrawerClose>
            <Button
              :disabled="!newLinkTask.title.trim() || !newLinkTask.linkEntityId"
              class="pixel-btn bg-[var(--pixel-accent)] hover:bg-[var(--pixel-accent-hover)] text-[var(--pixel-text-primary)] font-mono uppercase tracking-wider"
              @click="handleCreateLinkTask"
            >
              创建
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
