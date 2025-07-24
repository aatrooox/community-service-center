<script setup lang="ts">
// 设置页面标题
useHead({
  title: '首页',
})
</script>

<template>
  <div>
    <!-- 欢迎横幅 -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 mb-8 text-white">
      <h1 class="text-3xl font-bold mb-4">
        欢迎使用社区服务中心管理系统
      </h1>
      <p class="text-blue-100 text-lg">
        为社区居民提供便民服务，提升社区管理效率
      </p>
    </div>

    <!-- 功能卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- 服务管理卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:settings" class="w-6 h-6 text-blue-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 ml-3">
            服务管理
          </h3>
        </div>
        <p class="text-gray-600 mb-4">
          管理社区提供的各类便民服务，包括服务项目、流程和资源配置。
        </p>
        <NuxtLink
          to="/services"
          class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          查看详情
          <Icon name="lucide:arrow-right" class="w-4 h-4 ml-1" />
        </NuxtLink>
      </div>

      <!-- 居民管理卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:users" class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 ml-3">
            居民管理
          </h3>
        </div>
        <p class="text-gray-600 mb-4">
          管理社区居民信息，包括基本资料、服务记录和需求统计。
        </p>
        <NuxtLink
          to="/residents"
          class="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          查看详情
          <Icon name="lucide:arrow-right" class="w-4 h-4 ml-1" />
        </NuxtLink>
      </div>

      <!-- 数据统计卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:bar-chart-3" class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 ml-3">
            数据统计
          </h3>
        </div>
        <p class="text-gray-600 mb-4">
          查看服务使用情况、居民满意度和各类数据分析报告。
        </p>
        <NuxtLink
          to="/analytics"
          class="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
        >
          查看详情
          <Icon name="lucide:arrow-right" class="w-4 h-4 ml-1" />
        </NuxtLink>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        快速操作
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <Icon name="lucide:plus" class="w-6 h-6 text-blue-600 mb-2" />
          <span class="text-sm text-gray-700">新增服务</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
          <Icon name="lucide:user-plus" class="w-6 h-6 text-green-600 mb-2" />
          <span class="text-sm text-gray-700">添加居民</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
          <Icon name="lucide:file-text" class="w-6 h-6 text-yellow-600 mb-2" />
          <span class="text-sm text-gray-700">生成报告</span>
        </button>
        <button class="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
          <Icon name="lucide:settings" class="w-6 h-6 text-purple-600 mb-2" />
          <span class="text-sm text-gray-700">系统设置</span>
        </button>
      </div>
    </div>
  </div>
</template>
