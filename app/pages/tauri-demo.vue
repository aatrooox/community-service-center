<script setup lang="ts">
// 使用新的 Composables API
const services = useTauriServices()
const database = useTauriDatabase()
const store = useTauriStore()
const notification = useTauriNotification()

// 数据库相关状态
const users = ref<any[]>([])
const newUser = ref({ name: '', email: '' })

// 存储相关状态
const storeKey = ref('')
const storeValue = ref('')
const retrievedValue = ref<any>(null)

// 通知相关状态
const notificationTitle = ref('测试通知')
const notificationBody = ref('这是一个测试通知消息')

// 初始化服务
function initServices() {
  services.initializeServices()
}

// 数据库操作
function addUser() {
  database.insertUser(newUser.value.name, newUser.value.email)
    .then(() => {
      newUser.value = { name: '', email: '' }
      loadUsers()
    })
    .catch(console.error)
}

function loadUsers() {
  database.getUsers()
    .then((result: any) => {
      users.value = result as any[]
    })
    .catch(console.error)
}

function deleteUser(id: number) {
  database.deleteUser(id)
    .then(() => {
      loadUsers()
    })
    .catch(console.error)
}

// 存储操作
function setStoreValue() {
  store.setItem(storeKey.value, storeValue.value)
    .then(() => {
      storeValue.value = ''
    })
    .catch(console.error)
}

function getStoreValue() {
  store.getItem(storeKey.value)
    .then((value) => {
      retrievedValue.value = value
    })
    .catch(console.error)
}

function deleteStoreValue() {
  store.deleteItem(storeKey.value)
    .then(() => {
      retrievedValue.value = null
    })
    .catch(console.error)
}

// 通知操作
function requestNotificationPermission() {
  notification.requestPermission()
    .catch(console.error)
}

function sendTestNotification() {
  notification.sendNotification(notificationTitle.value, notificationBody.value)
    .catch(console.error)
}

function sendSuccessNotification() {
  notification.sendSuccessNotification('操作执行成功！')
    .catch(console.error)
}

function sendErrorNotification() {
  notification.sendErrorNotification('操作执行失败！')
    .catch(console.error)
}

// 页面加载时初始化
onMounted(() => {
  // 自动初始化服务
  services.autoInit()
})
</script>

<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Tauri 服务演示
      </h1>
      <p class="text-gray-600">
        使用新的 Composables API 进行 Tauri 插件操作
      </p>
    </div>

    <!-- 服务初始化状态 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">
        服务初始化状态
      </h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span>初始化状态:</span>
          <span
            :class="{
              'text-green-600': services.isInitialized.value,
              'text-yellow-600': services.isLoading.value,
              'text-red-600': services.error.value,
            }"
          >
            {{ services.isInitialized.value ? '已完成' : services.isLoading.value ? '初始化中...' : '未初始化' }}
          </span>
        </div>
        <div v-if="services.isLoading.value" class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${services.initProgress.value}%` }"
          />
        </div>
        <div v-if="services.error.value" class="text-red-600 text-sm">
          错误: {{ services.error.value }}
        </div>
        <button
          v-if="!services.isInitialized.value && !services.isLoading.value"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          @click="initServices"
        >
          初始化服务
        </button>
      </div>
    </div>

    <!-- 数据库操作 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">
        数据库操作
      </h2>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            v-model="newUser.name"
            placeholder="用户名"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <input
            v-model="newUser.email"
            placeholder="邮箱"
            type="email"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div class="flex gap-2">
          <button
            :disabled="database.isLoading.value || !newUser.name || !newUser.email"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="addUser"
          >
            添加用户
          </button>
          <button
            :disabled="database.isLoading.value"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="loadUsers"
          >
            刷新列表
          </button>
        </div>
        <div v-if="database.error.value" class="text-red-600 text-sm">
          数据库错误: {{ database.error.value }}
        </div>
        <div v-if="users.length > 0" class="space-y-2">
          <h3 class="font-medium">
            用户列表:
          </h3>
          <div class="space-y-1">
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span>{{ user.name }} ({{ user.email }})</span>
              <button
                class="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                @click="deleteUser(user.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 存储操作 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">
        键值存储操作
      </h2>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            v-model="storeKey"
            placeholder="键名"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <input
            v-model="storeValue"
            placeholder="值"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div class="flex gap-2">
          <button
            :disabled="store.isLoading.value || !storeKey || !storeValue"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="setStoreValue"
          >
            设置值
          </button>
          <button
            :disabled="store.isLoading.value || !storeKey"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="getStoreValue"
          >
            获取值
          </button>
          <button
            :disabled="store.isLoading.value || !storeKey"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="deleteStoreValue"
          >
            删除值
          </button>
        </div>
        <div v-if="store.error.value" class="text-red-600 text-sm">
          存储错误: {{ store.error.value }}
        </div>
        <div v-if="retrievedValue !== null" class="p-3 bg-gray-50 rounded">
          <strong>获取的值:</strong> {{ retrievedValue }}
        </div>
      </div>
    </div>

    <!-- 通知操作 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">
        通知操作
      </h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span>通知权限:</span>
          <span
            :class="{
              'text-green-600': notification.hasPermission.value,
              'text-red-600': !notification.hasPermission.value,
            }"
          >
            {{ notification.hasPermission.value ? '已授权' : '未授权' }}
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            v-model="notificationTitle"
            placeholder="通知标题"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <input
            v-model="notificationBody"
            placeholder="通知内容"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div class="flex gap-2">
          <button
            v-if="!notification.hasPermission.value"
            :disabled="notification.isLoading.value"
            class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="requestNotificationPermission"
          >
            请求权限
          </button>
          <button
            :disabled="notification.isLoading.value || !notificationTitle || !notificationBody"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="sendTestNotification"
          >
            发送通知
          </button>
          <button
            :disabled="notification.isLoading.value"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="sendSuccessNotification"
          >
            成功通知
          </button>
          <button
            :disabled="notification.isLoading.value"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="sendErrorNotification"
          >
            错误通知
          </button>
        </div>
        <div v-if="notification.error.value" class="text-red-600 text-sm">
          通知错误: {{ notification.error.value }}
        </div>
      </div>
    </div>
  </div>
</template>
