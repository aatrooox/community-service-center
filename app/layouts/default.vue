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
  <div class="min-h-screen bg-gray-950">
    <!-- 全局灵动岛组件 -->
    <AppDynamicIsland />
    <!-- 主要内容区域 -->
    <main class="pb-20">
      <slot />
    </main>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
      <div class="flex justify-around items-center h-16 px-4">
        <NuxtLink to="/" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:home" class="w-5 h-5" />
          <span class="text-xs">Home</span>
        </NuxtLink>
        <NuxtLink to="/todos" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:briefcase" class="w-5 h-5" />
          <span class="text-xs">代办</span>
        </NuxtLink>
        <NuxtLink to="/residents" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:users" class="w-5 h-5" />
          <span class="text-xs">Residents</span>
        </NuxtLink>
        <NuxtLink to="/tauri-demo" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:zap" class="w-5 h-5" />
          <span class="text-xs">Demo</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:settings" class="w-5 h-5" />
          <span class="text-xs">Settings</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
