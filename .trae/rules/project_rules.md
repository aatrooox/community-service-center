# 社区服务中心开发规范

## 项目概述

本项目是一个基于 Nuxt 4 + Tauri 2 的桌面应用程序，用于社区服务中心管理系统。

> **注意**：本规范整合了项目的所有开发标准和最佳实践，是团队开发的权威参考文档。

## 技术栈

### 前端技术栈
- **框架**: Nuxt 4.0.1 (Vue 3.5.17)
- **路由**: Vue Router 4.5.1
- **样式**: Tailwind CSS v4.1.11
- **UI 组件**: shadcn-vue (reka-ui 2.4.0)
- **图标**: @nuxt/icon 1.15.0 + Lucide Vue Next
- **代码规范**: ESLint 9.31.0 + @nuxt/eslint 1.7.0
- **类型检查**: TypeScript
- **构建工具**: Vite (Nuxt 内置)

### 后端技术栈
- **桌面应用框架**: Tauri 2.7.0
- **编程语言**: Rust (edition 2021, rust-version 1.88.0)
- **序列化**: serde 1.0 + serde_json 1.0
- **日志**: log 0.4 + tauri-plugin-log 2

## 项目结构

```
community-service-center/
├── app/                    # Nuxt 4 应用主目录
│   ├── app.vue            # 根组件
│   ├── assets/            # 静态资源
│   │   └── css/           # 样式文件
│   ├── components/        # Vue 组件
│   │   └── ui/            # shadcn-vue UI 组件
│   └── lib/               # 工具函数库
│       └── utils.ts       # 通用工具函数
├── public/                # 公共静态文件
├── src-tauri/             # Tauri 后端
│   ├── src/               # Rust 源码
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 应用配置
├── components.json        # shadcn-vue 配置
├── nuxt.config.ts         # Nuxt 配置
├── package.json           # 前端依赖
├── tsconfig.json          # TypeScript 配置
└── eslint.config.mjs      # ESLint 配置
```

## 前端开发规范

### 1. Nuxt 4 配置规范

#### 1.1 SSR 模式配置
- **必须使用 `ssr: false` 模式**（桌面应用不需要 SSR）
- 禁止使用任何 SSR 相关的 API

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // 必须设置为 false
  // 其他配置...
})
```

#### 1.2 路径别名配置
- `~` 和 `@` 前缀指向 `app/` 目录
- 在 Nuxt 4 中，所有应用代码都在 `app/` 目录下

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "~/*": ["./app/*"]
    }
  }
}
```

#### 1.3 自动导入规范
- **充分利用 Nuxt 4 的自动导入功能**
- 以下 API 已被自动导入，**禁止手动导入**：
  - Vue 相关：`ref`, `reactive`, `computed`, `watch`, `onMounted` 等
  - Nuxt 相关：`navigateTo`, `useRoute`, `useRouter`, `useCookie` 等

```vue
<!-- ✅ 正确使用（无需导入） -->
<script setup lang="ts">
const count = ref(0)
const route = useRoute()

function increment() {
  count.value++
}
</script>

<!-- ❌ 错误使用（不要手动导入） -->
<script setup lang="ts">
import { ref } from 'vue' // 禁止
import { useRoute } from 'nuxt/app' // 禁止
</script>
```

### 2. Vue 组件开发规范

#### 2.1 Script 标签规范
- **必须使用 `<script setup lang="ts">` 模式**
- 强制使用 TypeScript，禁止使用纯 JavaScript
- 必须启用 setup 语法糖

```vue
<!-- ✅ 正确写法 -->
<script setup lang="ts">
// TypeScript 代码
</script>

<!-- ❌ 错误写法 -->
<script>
// 禁止使用纯 JS
</script>

<script lang="ts">
// 禁止使用非 setup 模式
export default {
  // ...
}
</script>
```

#### 2.2 函数定义规范
- **Vue 文件中的函数必须使用 `function` 关键字定义**
- 禁止使用 `const` 定义函数

```vue
<!-- ✅ 正确写法 -->
<script setup lang="ts">
function handleClick() {
  console.log('clicked')
}

function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
</script>

<!-- ❌ 错误写法 -->
<script setup lang="ts">
const handleClick = () => { // 禁止
  console.log('clicked')
}

const calculateTotal = (items: Item[]) => { // 禁止
  return items.reduce((sum, item) => sum + item.price, 0)
}
</script>
```

#### 2.3 组件命名规范
- 组件文件名使用 PascalCase：`UserProfile.vue`
- 页面文件名使用 kebab-case：`user-profile.vue`
- 组件内部名称使用 PascalCase

### 3. 样式开发规范

#### 3.1 响应式设计规范
- **必须同时考虑移动端和PC端的用户体验**
- 使用移动优先（Mobile First）的设计理念
- **如果用户要求的样式不合理，必须提示该排版在移动端或PC端可能存在的问题**
- 确保关键功能在所有设备上都能正常使用

```vue
<!-- ✅ 响应式设计示例 -->
<template>
  <div class="container mx-auto px-4">
    <!-- 移动端单列，桌面端多列布局 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="card">内容1</div>
      <div class="card">内容2</div>
      <div class="card">内容3</div>
    </div>
    
    <!-- 移动端隐藏，桌面端显示的侧边栏 -->
    <aside class="hidden lg:block lg:w-64">
      侧边栏内容
    </aside>
  </div>
</template>
```

#### 3.2 Tailwind CSS v4 使用规范
- **完全使用 Tailwind CSS v4 进行样式开发**
- 优先使用 Tailwind 的原子类
- 充分利用 Tailwind 的响应式断点：`sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- 对于复杂样式，可以在 `<style>` 标签内使用 CSS

```vue
<!-- ✅ 推荐写法 -->
<template>
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-gray-800">标题</h1>
    <button class="custom-gradient-button">按钮</button>
  </div>
</template>

<style scoped>
.custom-gradient-button {
  @apply px-6 py-2 rounded-md text-white font-medium;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
```

#### 3.3 基础组件库使用规范
- **优先使用 shadcn-vue 提供的 UI 组件**
- 组件配置在 `components.json` 中
- 基础颜色使用 `zinc`，样式使用 `new-york`
- **如果需要的组件不存在，必须先提示用户使用 CLI 添加**

```bash
# 添加 shadcn-vue 组件
pnpm dlx shadcn-vue@latest add button
pnpm dlx shadcn-vue@latest add card
pnpm dlx shadcn-vue@latest add input
pnpm dlx shadcn-vue@latest add dialog
```

#### 3.4 动画组件库使用规范
- **优先使用 vue-bits 动画组件库**
- 官方文档：https://vue-bits.dev/
- **如果需要的动画组件不存在，必须先提示用户添加**

```bash
# 添加 vue-bits 动画组件（示例）
npx jsrepo add https://vue-bits.dev/ui/TextAnimations/SplitText
npx jsrepo add https://vue-bits.dev/ui/Animations/FadeIn
npx jsrepo add https://vue-bits.dev/ui/Animations/SlideIn
```

#### 3.5 动画插件使用规范
- **优先使用 GSAP 和 motion-v 作为动画插件**
- GSAP 用于复杂的时间轴动画和高性能动画
- motion-v 用于 Vue 3 的声明式动画

```vue
<!-- GSAP 使用示例 -->
<script setup lang="ts">
import { gsap } from 'gsap'

function animateElement() {
  gsap.to('.element', { duration: 1, x: 100, rotation: 360 })
}
</script>

<!-- motion-v 使用示例 -->
<template>
  <Motion
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.5 }"
  >
    <div>动画内容</div>
  </Motion>
</template>
```

### 4. TypeScript 使用规范

#### 4.1 类型定义
- 为组件 props 定义明确的类型
- 使用接口定义复杂数据结构
- 充分利用 TypeScript 的类型推导

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface Props {
  user: User
  showAvatar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAvatar: true
})
</script>
```

## Tauri 开发规范

### 1. 配置规范

#### 1.1 应用配置
- 开发服务器端口：`4577`
- 应用标识符：`com.community-service-center.app`
- 窗口默认尺寸：800x600

#### 1.2 构建配置
- 前端构建输出：`../dist`
- 开发命令：`pnpm dev`
- 构建命令：`pnpm generate`

### 2. Rust 开发规范

#### 2.1 依赖管理
- Rust 版本：1.88.0
- 使用 `serde` 进行序列化
- 使用 `tauri-plugin-log` 进行日志记录

#### 2.2 命令定义
- 使用 `#[tauri::command]` 宏定义命令
- 命令函数使用 snake_case 命名
- 为命令添加适当的错误处理

```rust
#[tauri::command]
fn get_user_data(user_id: u32) -> Result<String, String> {
    // 实现逻辑
    Ok("user data".to_string())
}
```

### 3. 前后端通信规范

#### 3.1 命令调用
- 使用 `@tauri-apps/api` 进行前后端通信
- 统一错误处理机制

```typescript
import { invoke } from '@tauri-apps/api/core'

interface UserData {
  id: number
  name: string
}

async function fetchUserData(userId: number): Promise<UserData> {
  try {
    const result = await invoke<UserData>('get_user_data', { userId })
    return result
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    throw error
  }
}
```

## 开发工具配置

### 1. ESLint 配置
- 使用 `@nuxt/eslint` 预设配置
- 配置文件：`eslint.config.mjs`

### 2. 开发服务器
- 前端开发服务器：`http://localhost:4577`
- 启动命令：`pnpm dev`
- Tauri 开发模式会自动启动前端服务器

### 3. 构建命令
- 开发模式：`pnpm dev`
- 生产构建：`pnpm generate`
- Tauri 打包：`cargo tauri build`

## 代码质量保证

### 1. 代码规范
- 所有代码必须通过 ESLint 检查
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践

### 2. 性能优化
- 合理使用 Vue 3 的响应式系统
- 避免不必要的重新渲染
- 优化 Tauri 命令的执行效率

### 3. 安全规范
- 不在代码中硬编码敏感信息
- 使用环境变量管理配置
- 遵循 Tauri 安全最佳实践

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm generate

# 运行 ESLint 检查
pnpm lint

# 添加 shadcn-vue 组件
pnpm dlx shadcn-vue@latest add [component-name]

# 添加 vue-bits 动画组件
npx jsrepo add [vue-bits-component-url]

# Tauri 开发模式
cd src-tauri && cargo tauri dev

# Tauri 构建
cd src-tauri && cargo tauri build
```

---

**注意**：本规范基于项目当前配置制定，会根据项目发展和技术栈更新进行调整。