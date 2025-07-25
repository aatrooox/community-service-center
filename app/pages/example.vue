<script setup lang="ts">
// 设置页面标题
useHead({
  title: '灵动岛示例 - 社区服务中心',
})

// 使用灵动岛 composable
const {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showLoading,
  showPersistentMessage,
  clearQueue,
} = useDynamicIsland()

// 简单通知
function showSimpleNotification() {
  showNotification('这是一条简单的通知消息', {
    title: '通知',
    icon: 'lucide:bell',
  })
}

// 带进度条的通知
function showProgressNotification() {
  showNotification('文件正在上传中...', {
    title: '上传进度',
    icon: 'lucide:upload',
    duration: 5,
    showProgress: true,
  })
}

// 成功消息
function showSuccessMessage() {
  showSuccess('操作成功完成！')
}

// 错误消息
function showErrorMessage() {
  showError('操作失败，请重试')
}

// 警告消息
function showWarningMessage() {
  showWarning('请注意：此操作不可撤销')
}

// 持续信息
let persistentMessageCounter = 0
function showPersistentInfo() {
  persistentMessageCounter++
  showPersistentMessage(`系统维护中，部分功能可能受影响（${persistentMessageCounter}）`, {
    id: `maintenance-${persistentMessageCounter}`,
    title: `系统通知 #${persistentMessageCounter}`,
    icon: 'lucide:settings',
  })
}

// 加载消息
function showLoadingMessage() {
  showLoading('正在加载，请稍候...', 3)
}

// 注意：灵动岛组件现在使用全局状态管理，无需手动设置引用
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">
        灵动岛 Composable 示例页面
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 通知消息 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4 text-blue-600">
            通知消息
          </h2>
          <div class="space-y-3">
            <button
              class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showSimpleNotification"
            >
              简单通知
            </button>
            <button
              class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showProgressNotification"
            >
              带进度条通知
            </button>
          </div>
        </div>

        <!-- 状态消息 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4 text-green-600">
            状态消息
          </h2>
          <div class="space-y-3">
            <button
              class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showSuccessMessage"
            >
              成功消息
            </button>
            <button
              class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showErrorMessage"
            >
              错误消息
            </button>
            <button
              class="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showWarningMessage"
            >
              警告消息
            </button>
            <button
              class="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showLoadingMessage"
            >
              加载中消息
            </button>
          </div>
        </div>

        <!-- 持续消息 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4 text-purple-600">
            持续消息
          </h2>
          <div class="space-y-3">
            <button
              class="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="showPersistentInfo"
            >
              显示持续信息
            </button>
            <button
              class="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              @click="clearQueue"
            >
              清除所有消息
            </button>
          </div>
        </div>
      </div>

      <!-- 返回首页 -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
        >
          <Icon name="lucide:arrow-left" class="mr-2" />
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
