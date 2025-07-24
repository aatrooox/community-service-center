<script setup lang="ts">
// 页面标题设置
useHead({
  titleTemplate: '%s - 社区服务中心',
  meta: [
    {
      name: 'description',
      content: '社区服务中心管理系统 - 提供便民服务管理功能',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo 区域 -->
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              社区服务中心
            </h1>
          </div>

          <!-- 导航菜单 -->
          <nav class="hidden md:flex space-x-8">
            <NuxtLink
              to="/"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="!text-blue-600 !bg-blue-50"
            >
              首页
            </NuxtLink>
            <NuxtLink
              to="/services"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="!text-blue-600 !bg-blue-50"
            >
              服务管理
            </NuxtLink>
            <NuxtLink
              to="/residents"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="!text-blue-600 !bg-blue-50"
            >
              居民管理
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="!text-blue-600 !bg-blue-50"
            >
              设置
            </NuxtLink>
          </nav>

          <!-- 用户信息 -->
          <div class="flex items-center space-x-4">
            <button class="text-gray-600 hover:text-gray-900 p-2 rounded-md transition-colors">
              <Icon name="lucide:bell" class="w-5 h-5" />
            </button>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">管</span>
              </div>
              <span class="text-sm text-gray-700">管理员</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- 底部信息 -->
    <footer class="bg-white border-t mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="text-center text-sm text-gray-500">
          © 2024 社区服务中心管理系统. 保留所有权利.
        </div>
      </div>
    </footer>
  </div>
</template>
