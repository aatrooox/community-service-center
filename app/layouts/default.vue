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
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- 底部导航栏 - macOS Dock 风格 -->
    <nav class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div class="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl px-4 py-2">
        <div class="flex items-center space-x-2">
          <!-- 首页 -->
          <NuxtLink
            to="/"
            class="dock-item flex flex-col items-center justify-center p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 group rounded-xl hover:bg-blue-50/50"
            active-class="!text-blue-600 !bg-blue-50"
          >
            <Icon name="lucide:home" class="w-6 h-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
            <span class="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">首页</span>
          </NuxtLink>

          <!-- 服务管理 -->
          <NuxtLink
            to="/services"
            class="dock-item flex flex-col items-center justify-center p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 group rounded-xl hover:bg-blue-50/50"
            active-class="!text-blue-600 !bg-blue-50"
          >
            <Icon name="lucide:briefcase" class="w-6 h-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
            <span class="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">服务</span>
          </NuxtLink>

          <!-- 居民管理 -->
          <NuxtLink
            to="/residents"
            class="dock-item flex flex-col items-center justify-center p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 group rounded-xl hover:bg-blue-50/50"
            active-class="!text-blue-600 !bg-blue-50"
          >
            <Icon name="lucide:users" class="w-6 h-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
            <span class="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">居民</span>
          </NuxtLink>

          <!-- Tauri 演示 -->
          <NuxtLink
            to="/tauri-demo"
            class="dock-item flex flex-col items-center justify-center p-3 text-gray-600 hover:text-purple-600 transition-all duration-300 group rounded-xl hover:bg-purple-50/50"
            active-class="!text-purple-600 !bg-purple-50"
          >
            <Icon name="lucide:cpu" class="w-6 h-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
            <span class="text-xs font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-300">演示</span>
          </NuxtLink>

          <!-- 设置 -->
          <NuxtLink
            to="/settings"
            class="dock-item flex flex-col items-center justify-center p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 group rounded-xl hover:bg-blue-50/50"
            active-class="!text-blue-600 !bg-blue-50"
          >
            <Icon name="lucide:settings" class="w-6 h-6 mb-1 transition-transform duration-300 group-hover:scale-110" />
            <span class="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">设置</span>
          </NuxtLink>
        </div>
      </div>
    </nav>
  </div>
</template>
