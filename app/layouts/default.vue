<script setup lang="ts">
import Sonner from '@/components/ui/sonner.vue'

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

const appNavBar = [
  {
    name: '首页',
    path: '/',
    icon: 'lucide:home',
  },
  {
    name: '待办',
    path: '/todos',
    icon: 'lucide:briefcase',
  },
  {
    name: '工具',
    path: '/tools',
    icon: 'lucide:tool-case',
  },
  {
    name: '设置',
    path: '/settings',
    icon: 'lucide:settings',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-950">
    <!-- 全局灵动岛组件 -->
    <AppDynamicIsland />
    <!-- 全局 Toast 组件 -->
    <Sonner />
    <!-- 主要内容区域 -->
    <main class="main-content overflow-y-auto">
      <slot />
    </main>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
      <div class="flex justify-around items-center h-16 px-4">
        <NuxtLink v-for="nav in appNavBar" :key="nav.path" :to="nav.path" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon :name="nav.icon" class="w-5 h-5" />
          <span class="text-xs">{{ nav.name }}</span>
        </NuxtLink>
        <!-- <NuxtLink to="/example" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:sparkles" class="w-5 h-5" />
          <span class="text-xs">示例</span>
        </NuxtLink>
        <NuxtLink to="/todos" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:briefcase" class="w-5 h-5" />
          <span class="text-xs">待办</span>
        </NuxtLink>
        <NuxtLink to="/tauri-demo" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:zap" class="w-5 h-5" />
          <span class="text-xs">演示</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Icon name="lucide:settings" class="w-5 h-5" />
          <span class="text-xs">设置</span>
        </NuxtLink> -->
      </div>
    </nav>
  </div>
</template>

<style scoped>
</style>
