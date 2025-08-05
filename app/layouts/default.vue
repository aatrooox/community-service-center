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
    name: '链接',
    path: '/connect',
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
  <div class="pixel-layout">
    <!-- 全局灵动岛组件 -->
    <AppDynamicIsland />
    <!-- 全局 Toast 组件 -->
    <Sonner />
    <!-- 主要内容区域 -->
    <main class="pixel-main">
      <slot />
    </main>

    <!-- 像素风格底部导航 -->
    <nav class="pixel-nav">
      <div class="pixel-nav-container">
        <NuxtLink
          v-for="nav in appNavBar"
          :key="nav.path"
          :to="nav.path"
          class="pixel-nav-item"
          :class="{ active: $route.path === nav.path }"
        >
          <Icon :name="nav.icon" class="pixel-nav-icon" />
          <span class="pixel-nav-text">{{ nav.name }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.pixel-layout {
  min-height: 100vh;
  background-color: oklch(0.269 0.006 274.872);
  font-family: 'Courier New', 'Consolas', monospace;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.pixel-main {
  overflow-y: auto;
  padding-bottom: 80px;
  min-height: calc(100vh - 64px);
}

.pixel-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: oklch(0.269 0.006 274.872);
  border-top: 2px solid oklch(0.215 0.006 264.081);
  box-shadow:
    0 -4px 0 oklch(0.144 0.004 285.823),
    0 -8px 0 oklch(0.144 0.004 285.823);
  z-index: 1000;
}

.pixel-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  padding: 0 8px;
}

.pixel-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  color: oklch(0.704 0.04 256.788);
  text-decoration: none;
  transition: all 0.15s ease;
  border: 2px solid transparent;
  border-radius: 0;
  min-width: 64px;
  position: relative;
}

.pixel-nav-item:hover {
  color: oklch(0.715 0.143 215.221);
  background-color: oklch(0.215 0.006 264.081);
  border-color: oklch(0.144 0.004 285.823);
  transform: translateY(-1px);
}

.pixel-nav-item.active {
  color: oklch(0.715 0.143 215.221);
  background-color: oklch(0.215 0.006 264.081);
  border-color: oklch(0.715 0.143 215.221);
  box-shadow:
    2px 2px 0 oklch(0.144 0.004 285.823),
    4px 4px 0 oklch(0.144 0.004 285.823);
}

.pixel-nav-item:active {
  transform: translateY(1px);
  box-shadow:
    1px 1px 0 oklch(0.144 0.004 285.823),
    2px 2px 0 oklch(0.144 0.004 285.823);
}

.pixel-nav-icon {
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
}

.pixel-nav-text {
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .pixel-nav-container {
    padding: 0 4px;
  }

  .pixel-nav-item {
    min-width: 60px;
    padding: 6px 8px;
  }

  .pixel-nav-text {
    font-size: 9px;
  }
}

@media (min-width: 1024px) {
  .pixel-main {
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .pixel-nav {
    display: none;
  }
}
</style>
