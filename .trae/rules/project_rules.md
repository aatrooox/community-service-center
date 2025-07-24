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
- **编程语言**: Rust (edition 2021, rust-version 1.77.2)
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

#### 3.1 Tailwind CSS v4 使用规范
- **完全使用 Tailwind CSS v4 进行样式开发**
- 优先使用 Tailwind 的原子类
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

#### 3.2 shadcn-vue 组件使用
- 使用 shadcn-vue 提供的 UI 组件
- 组件配置在 `components.json` 中
- 基础颜色使用 `zinc`，样式使用 `new-york`

```bash
# 添加新组件
pnpm dlx shadcn-vue@latest add button
pnpm dlx shadcn-vue@latest add card
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
- Rust 版本：1.77.2
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

# Tauri 开发模式
cd src-tauri && cargo tauri dev

# Tauri 构建
cd src-tauri && cargo tauri build
```

---

**注意**：本规范基于项目当前配置制定，会根据项目发展和技术栈更新进行调整。