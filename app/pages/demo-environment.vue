<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGlobalEnvironment } from '~/composables/useEnvironment'
import { getRouteConfig, isRouteAllowed, isStaticRoute, ROUTE_CONFIGS } from '~/config/routes'

// 页面标题
useHead({
  title: '环境检测演示 - 社区服务中心',
})

// 获取环境信息
const { isTauriEnvironment, isLoading, supportsFeature } = useGlobalEnvironment()

// 当前路由信息
const route = useRoute()
const currentRouteConfig = computed(() => getRouteConfig(route.path))

// 获取路由类型的颜色
function getRouteTypeColor(type: string) {
  switch (type) {
    case 'static': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'tauri': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'database': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-100 mb-2">
        环境检测演示
      </h1>
      <p class="text-gray-400">
        此页面演示环境检测和路由保护功能
      </p>
    </div>

    <!-- 当前环境状态 -->
    <Card class="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle class="text-gray-100 flex items-center gap-2">
          <Icon name="lucide:monitor" class="w-5 h-5" />
          当前环境状态
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2">
          <div v-if="isLoading" class="flex items-center gap-2">
            <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin text-blue-400" />
            <span class="text-gray-400">检测中...</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <Icon
              :name="isTauriEnvironment ? 'lucide:check-circle' : 'lucide:x-circle'"
              :class="isTauriEnvironment ? 'text-green-400' : 'text-red-400'"
              class="w-4 h-4"
            />
            <span :class="isTauriEnvironment ? 'text-green-400' : 'text-red-400'">
              {{ isTauriEnvironment ? 'Tauri 客户端环境' : '浏览器环境' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="feature in ['sql', 'store', 'notification', 'http']"
            :key="feature"
            class="flex items-center justify-between p-3 rounded-lg border"
            :class="supportsFeature(feature) ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'"
          >
            <span class="font-medium capitalize">{{ feature }}</span>
            <Icon
              :name="supportsFeature(feature) ? 'lucide:check' : 'lucide:x'"
              class="w-4 h-4"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 当前路由信息 -->
    <Card class="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle class="text-gray-100 flex items-center gap-2">
          <Icon name="lucide:route" class="w-5 h-5" />
          当前路由信息
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-gray-400">路径:</span>
            <code class="text-cyan-400 bg-gray-800 px-2 py-1 rounded text-sm">{{ route.path }}</code>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-400">静态页面:</span>
            <Badge :class="isStaticRoute(route.path) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'">
              {{ isStaticRoute(route.path) ? '是' : '否' }}
            </Badge>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-400">白名单允许:</span>
            <Badge :class="isRouteAllowed(route.path) ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'">
              {{ isRouteAllowed(route.path) ? '是' : '否' }}
            </Badge>
          </div>
        </div>

        <div v-if="currentRouteConfig" class="bg-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium text-gray-300 mb-2">
            路由配置
          </h3>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-gray-400">名称:</span>
              <span class="text-gray-300">{{ currentRouteConfig.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">类型:</span>
              <Badge :class="getRouteTypeColor(currentRouteConfig.type)">
                {{ currentRouteConfig.type }}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 测试链接 -->
    <Card class="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle class="text-gray-100 flex items-center gap-2">
          <Icon name="lucide:external-link" class="w-5 h-5" />
          测试环境检测
        </CardTitle>
        <CardDescription class="text-gray-400">
          点击以下链接测试环境检测功能（非白名单页面在浏览器中会显示错误页面）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <NuxtLink
            v-for="config in ROUTE_CONFIGS"
            :key="config.path"
            :to="config.path"
            class="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div class="flex items-center gap-2">
              <Icon
                :name="config.type === 'static' ? 'lucide:file-text' : 'lucide:settings'"
                class="w-4 h-4 text-gray-400"
              />
              <span class="text-gray-300">{{ config.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Badge :class="getRouteTypeColor(config.type)" class="text-xs">
                {{ config.type }}
              </Badge>
              <Icon name="lucide:chevron-right" class="w-4 h-4 text-gray-400" />
            </div>
          </NuxtLink>
        </div>
      </CardContent>
    </Card>

    <!-- 说明信息 -->
    <Card class="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle class="text-gray-100 flex items-center gap-2">
          <Icon name="lucide:info" class="w-5 h-5" />
          功能说明
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3 text-sm text-gray-300">
          <div class="flex items-start gap-2">
            <Icon name="lucide:check" class="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span><strong>静态页面</strong>：可以在任何环境中正常访问，不依赖 Tauri API</span>
          </div>
          <div class="flex items-start gap-2">
            <Icon name="lucide:alert-triangle" class="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <span><strong>非白名单页面</strong>：不在白名单中的页面需要在 Tauri 客户端中运行，在浏览器中会显示错误提示</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
