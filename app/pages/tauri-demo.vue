<script setup lang="ts">
// 使用新的 Composables API
const services = useTauriServices()
const store = useTauriStore()
const notification = useTauriNotification()
const sql = useTauriSQL()

// 存储相关状态
const storeKey = ref('')
const storeValue = ref('')
const retrievedValue = ref<any>(null)

// 通知相关状态
const notificationTitle = ref('测试通知')
const notificationBody = ref('这是一个测试通知消息')

// SQL 相关状态
const userName = ref('')
const userEmail = ref('')
const users = ref<any[]>([])
const settingKey = ref('')
const settingValue = ref('')
const settings = ref<any[]>([])

// 初始化服务
function initServices() {
  services.initializeServices()
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

// SQL 操作
function initDatabase() {
  sql.initDatabase()
    .then(() => {
      notification.sendSuccessNotification('数据库初始化成功！')
      loadUsers()
      loadSettings()
    })
    .catch((error: any) => {
      notification.sendErrorNotification('数据库初始化失败！')
      console.error(error)
    })
}

function addUser() {
  if (!userName.value || !userEmail.value) {
    notification.sendErrorNotification('请填写用户名和邮箱！')
    return
  }

  sql.createUser(userName.value, userEmail.value)
    .then(() => {
      notification.sendSuccessNotification('用户添加成功！')
      userName.value = ''
      userEmail.value = ''
      loadUsers()
    })
    .catch((error: any) => {
      notification.sendErrorNotification('用户添加失败！')
      console.error(error)
    })
}

function loadUsers() {
  sql.getAllUsers()
    .then((result) => {
      users.value = result
    })
    .catch(console.error)
}

function deleteUser(id: number) {
  sql.deleteUser(id)
    .then(() => {
      notification.sendSuccessNotification('用户删除成功！')
      loadUsers()
    })
    .catch((error: any) => {
      notification.sendErrorNotification('用户删除失败！')
      console.error(error)
    })
}

function setSetting() {
  if (!settingKey.value || !settingValue.value) {
    notification.sendErrorNotification('请填写设置键和值！')
    return
  }

  sql.setSetting(settingKey.value, settingValue.value)
    .then(() => {
      notification.sendSuccessNotification('设置保存成功！')
      settingKey.value = ''
      settingValue.value = ''
      loadSettings()
    })
    .catch((error: any) => {
      notification.sendErrorNotification('设置保存失败！')
      console.error(error)
    })
}

function loadSettings() {
  sql.getAllSettings()
    .then((result) => {
      // getAllSettings返回的是Record<string, string>，需要转换为数组格式
      settings.value = Object.entries(result).map(([key, value]) => ({ key, value }))
    })
    .catch(console.error)
}

function deleteSetting(key: string) {
  sql.deleteSetting(key)
    .then(() => {
      notification.sendSuccessNotification('设置删除成功！')
      loadSettings()
    })
    .catch((error: any) => {
      notification.sendErrorNotification('设置删除失败！')
      console.error(error)
    })
}

// 页面加载时初始化
onMounted(() => {
  // 自动初始化服务
  services.autoInit()

  // 加载 SQL 数据
  setTimeout(() => {
    if (sql.isInitialized.value) {
      loadUsers()
      loadSettings()
    }
  }, 1000)
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

    <!-- SQL 数据库操作 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">
        SQL 数据库操作
      </h2>
      <div class="space-y-6">
        <!-- 数据库初始化 -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded">
          <span>数据库状态:</span>
          <span
            :class="{
              'text-green-600': sql.isInitialized.value,
              'text-red-600': !sql.isInitialized.value,
            }"
          >
            {{ sql.isInitialized.value ? '已初始化' : '未初始化' }}
          </span>
          <button
            v-if="!sql.isInitialized.value"
            :disabled="sql.isLoading.value"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="initDatabase"
          >
            初始化数据库
          </button>
        </div>

        <!-- 用户管理 -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium mb-4">
            用户管理
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                v-model="userName"
                placeholder="用户名"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <input
                v-model="userEmail"
                placeholder="邮箱"
                type="email"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <button
              :disabled="sql.isLoading.value || !userName || !userEmail"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="addUser"
            >
              添加用户
            </button>

            <!-- 用户列表 -->
            <div v-if="users.length > 0" class="mt-4">
              <h4 class="font-medium mb-2">
                用户列表:
              </h4>
              <div class="space-y-2">
                <div
                  v-for="user in users"
                  :key="user.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <span class="font-medium">{{ user.name }}</span>
                    <span class="text-gray-600 ml-2">{{ user.email }}</span>
                  </div>
                  <button
                    :disabled="sql.isLoading.value"
                    class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    @click="deleteUser(user.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设置管理 -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium mb-4">
            设置管理
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                v-model="settingKey"
                placeholder="设置键"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <input
                v-model="settingValue"
                placeholder="设置值"
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <button
              :disabled="sql.isLoading.value || !settingKey || !settingValue"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="setSetting"
            >
              保存设置
            </button>

            <!-- 设置列表 -->
            <div v-if="settings.length > 0" class="mt-4">
              <h4 class="font-medium mb-2">
                设置列表:
              </h4>
              <div class="space-y-2">
                <div
                  v-for="setting in settings"
                  :key="setting.key"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <span class="font-medium">{{ setting.key }}</span>
                    <span class="text-gray-600 ml-2">{{ setting.value }}</span>
                  </div>
                  <button
                    :disabled="sql.isLoading.value"
                    class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    @click="deleteSetting(setting.key)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="sql.error.value" class="text-red-600 text-sm">
          SQL 错误: {{ sql.error.value }}
        </div>
      </div>
    </div>
  </div>
</template>
