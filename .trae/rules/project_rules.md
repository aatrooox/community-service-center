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
- **vue-bits 组件必须使用 VB 前缀**：`<VBFadeContent>`、`<VBSlideIn>` 等
- **shadcn-vue 组件无前缀**：`<Button>`、`<Card>` 等
- **自定义组件无前缀**：`<UserCard>`、`<DataTable>` 等

### 3. UI设计规范

#### 3.1 设计风格 - 像素风格（Pixel Art Style）
- **像素艺术风格**：采用复古8位像素风格设计，营造怀旧游戏氛围
- **深色主题**：以深灰色系为主，配合青色、绿色、黄色等像素化强调色
- **像素化边框**：所有元素使用2px-4px的硬边边框，营造像素块效果
- **方块阴影**：使用多层方块阴影（box-shadow）模拟3D像素效果
- **等宽字体**：统一使用 Courier New、Consolas 等等宽字体
- **像素化渲染**：启用 `image-rendering: pixelated` 确保像素边缘清晰
- **高对比度**：使用高对比度的颜色组合，确保像素风格的清晰可读
- **图标系统**：使用像素风格的emoji图标，配合像素化文字

#### 3.2 布局规范 - 像素风格布局
- **网格化布局**：所有元素基于8px网格系统对齐
- **卡片式布局**：使用像素化卡片，带有立体边框和阴影效果
- **响应式网格**：使用grid布局，在不同屏幕尺寸下保持像素比例
- **移动端适配**：在移动端保持像素风格的同时优化显示比例

```vue
<!-- ✅ 响应式布局示例 -->
<template>
  <!-- Web端：左侧导航 + 右侧内容 -->
  <div class="hidden lg:flex h-screen">
    <!-- 左侧导航栏 -->
    <aside class="w-64 bg-gray-900 border-r border-gray-800">
      <nav class="p-4">
        <!-- 导航菜单 -->
      </nav>
    </aside>
    
    <!-- 右侧内容区 -->
    <main class="flex-1 bg-gray-950 overflow-auto">
      <div class="p-6">
        <!-- 页面内容 -->
      </div>
    </main>
  </div>
  
  <!-- 移动端：上方内容 + 底部导航 -->
  <div class="lg:hidden flex flex-col h-screen">
    <!-- 上方内容区 -->
    <main class="flex-1 bg-gray-950 overflow-auto">
      <div class="p-4">
        <!-- 页面内容 -->
      </div>
    </main>
    
    <!-- 底部导航栏 -->
    <nav class="h-16 bg-gray-900 border-t border-gray-800">
      <!-- 底部导航菜单 -->
    </nav>
  </div>
</template>
```

#### 3.2 配色规范 - 像素风格配色
- **主色调**：以像素青色为核心强调色
- **配色方案**：
  - **主要强调色**：`oklch(70% 0.15 195)` - 像素青色，用于主要按钮、链接、重要状态
  - **次要强调色**：`oklch(80% 0.1 195)` - 淡青色，用于悬停状态、次要按钮
  - **渐变背景色**：`oklch(70% 0.15 195)` 到 `oklch(60% 0.2 195)` - 用于特殊区域背景、重要卡片
  - **辅助色1**：`oklch(70% 0.15 220)` - 像素蓝色，用于信息提示、图表数据
  - **辅助色2**：`oklch(70% 0.15 145)` - 像素绿色，用于成功状态、正向数据
  - **辅助色3**：`oklch(75% 0.15 85)` - 像素黄色，用于警告状态、中性数据
  - **辅助色4**：`oklch(65% 0.15 25)` - 像素红色，用于特殊功能、图表变化
  - **背景色**：
    - 主背景：`oklch(25% 0.05 250)` - 深灰色像素背景
    - 卡片背景：`oklch(30% 0.05 250)` - 中灰色像素卡片
    - 边框颜色：`oklch(40% 0.05 250)` - 像素边框色
  - **文字色**：
    - 主要文字：`oklch(90% 0.02 250)` - 像素亮白色
    - 次要文字：`oklch(75% 0.03 250)` - 像素中灰色
    - 禁用文字：`oklch(50% 0.03 250)` - 像素暗灰色

```vue
<!-- ✅ 配色使用示例 -->
<template>
  <div class="bg-gray-950 min-h-screen">
    <!-- 主要按钮 -->
    <button class="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg">
      主要操作
    </button>
    
    <!-- 信息卡片 -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 class="text-gray-100 text-lg font-semibold">卡片标题</h3>
      <p class="text-gray-400 mt-2">卡片描述内容</p>
      
      <!-- 状态指示器 -->
      <div class="flex gap-2 mt-4">
        <span class="bg-emerald-600 text-white px-2 py-1 rounded text-sm">成功</span>
        <span class="bg-orange-500 text-white px-2 py-1 rounded text-sm">警告</span>
        <span class="bg-blue-600 text-white px-2 py-1 rounded text-sm">信息</span>
      </div>
    </div>
  </div>
</template>
```

#### 3.4 组件设计规范
- **圆角规范**：
  - 主要卡片：16-20px 圆角（`rounded-2xl` 或 `rounded-3xl`）
  - 次要组件：8-12px 圆角（`rounded-lg` 或 `rounded-xl`）
  - 小型元素：6-8px 圆角（`rounded-md` 或 `rounded-lg`）
- **间距规范**：
  - 组件内边距：16-24px (`p-4` 到 `p-6`)
  - 组件间距：16-24px (`gap-4` 或 `gap-6`)
  - 页面边距：24px (`p-6`)
- **阴影规范**：使用 Tailwind 的 `shadow-lg` 或 `shadow-xl` 为卡片添加深度
- **边框规范**：使用 `border-gray-800` 作为分割线和边框颜色
- **卡片设计规范**：
  - **主要信息卡片**：使用渐变背景或深色背景，大圆角，突出显示
  - **数据展示卡片**：半透明背景，适中圆角，清晰的数据层次
  - **功能按钮卡片**：圆形或圆角矩形，图标+文字组合
  - **头像设计**：圆形头像，带边框或阴影效果

#### 3.5 像素风格字体规范
- **主要字体**：使用等宽字体，确保像素风格统一性
  - 首选：`font-mono` (Courier New, Consolas, Monaco, monospace)
  - 备选：`ui-monospace`, `SFMono-Regular`, `Menlo`
- **字体权重**：
  - 标题：700 (bold) - 粗体像素效果
  - 正文：400 (normal) - 标准像素字体
  - 强调：600 (semibold) - 半粗体强调
- **字体大小**：
  - 大标题：text-2xl 到 text-4xl - 像素化大标题
  - 中标题：text-xl 到 text-2xl - 像素化中标题
  - 正文：text-base 到 text-lg - 像素化正文
  - 小字：text-sm 到 text-xs - 像素化小字
- **像素化渲染**：
  ```css
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  ```

#### 3.6 像素风格边框规范
- **边框宽度**：2px-4px 硬边像素边框
- **边框样式**：使用 `border-2` 或 `border-4` 类
- **边框颜色**：严格按照配色规范使用
- **立体边框效果**：
  ```css
  .pixel-border {
    border: 2px solid #374151;
    box-shadow: 
      0 0 0 2px #1f2937,
      2px 2px 0 0 #4b5563;
  }
  ```

#### 3.7 像素风格阴影规范
- **方块阴影**：使用多层 `box-shadow` 模拟3D像素效果
- **阴影层级**：
  - 基础：2px 2px 0 0 #4b5563
  - 中级：2px 2px 0 0 #4b5563, 4px 4px 0 0 #374151
  - 高级：2px 2px 0 0 #4b5563, 4px 4px 0 0 #374151, 6px 6px 0 0 #1f2937
- **示例**：
  ```css
  .pixel-shadow {
    box-shadow: 
      2px 2px 0 0 #4b5563,
      4px 4px 0 0 #374151,
      6px 6px 0 0 #1f2937;
  }
  ```

#### 3.8 响应式设计规范
- **必须同时考虑移动端和PC端的用户体验**
- 使用移动优先（Mobile First）的设计理念
- **如果用户要求的样式不合理，必须提示该排版在移动端或PC端可能存在的问题**
- 确保关键功能在所有设备上都能正常使用
- **断点规范**：
  - `sm`: 640px+ (小型平板)
  - `md`: 768px+ (平板)
  - `lg`: 1024px+ (小型桌面)
  - `xl`: 1280px+ (桌面)
  - `2xl`: 1536px+ (大型桌面)

```vue
<!-- ✅ 完整响应式设计示例 -->
<template>
  <div class="min-h-screen bg-gray-950">
    <!-- Web端布局 -->
    <div class="hidden lg:flex h-screen">
      <!-- 左侧导航 -->
      <aside class="w-64 bg-gray-900 border-r border-gray-800">
        <!-- 导航内容 -->
      </aside>
      
      <!-- 右侧内容 -->
      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <!-- 网格布局 -->
          <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <!-- 卡片内容 -->
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 移动端布局 -->
    <div class="lg:hidden flex flex-col h-screen">
      <!-- 内容区 -->
      <main class="flex-1 overflow-auto">
        <div class="p-4">
          <!-- 单列布局 -->
          <div class="space-y-4">
            <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <!-- 卡片内容 -->
            </div>
          </div>
        </div>
      </main>
      
      <!-- 底部导航 -->
      <nav class="h-16 bg-gray-900 border-t border-gray-800">
        <!-- 导航菜单 -->
      </nav>
    </div>
  </div>
</template>
```

### 4. 样式开发规范

#### 4.1 Tailwind CSS v4 使用规范
- **完全使用 Tailwind CSS v4 进行样式开发**
- 优先使用 Tailwind 的原子类
- 充分利用 Tailwind 的响应式断点：`sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- 严格遵循上述配色规范，使用指定的颜色类
- 对于复杂样式，可以在 `<style>` 标签内使用 CSS

```vue
<!-- ✅ 推荐写法（符合设计规范） -->
<template>
  <div class="flex items-center justify-between p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold text-gray-100">标题</h1>
    <button class="custom-gradient-button">按钮</button>
  </div>
</template>

<style scoped>
.custom-gradient-button {
  @apply px-6 py-2 rounded-lg text-white font-medium bg-cyan-600 hover:bg-cyan-500 transition-colors;
}

/* 自定义渐变（如需要） */
.custom-gradient {
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
}
</style>
```

#### 4.2 基础组件库使用规范
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

#### 4.3 动画组件库使用规范
- **优先使用 vue-bits 动画组件库**
- 官方文档：https://vue-bits.dev/
- **如果需要的动画组件不存在，必须先提示用户添加**

```bash
# 添加 vue-bits 动画组件（示例）
npx jsrepo add https://vue-bits.dev/ui/TextAnimations/SplitText
npx jsrepo add https://vue-bits.dev/ui/Animations/FadeIn
npx jsrepo add https://vue-bits.dev/ui/Animations/SlideIn
```

#### 4.4 动画插件使用规范
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

### 5. 像素风格组件规范

#### 5.1 像素按钮规范
```css
.pixel-btn {
  background: oklch(30% 0.05 250);
  border: 2px solid oklch(40% 0.05 250);
  color: oklch(90% 0.02 250);
  font-family: ui-monospace, monospace;
  padding: 8px 16px;
  box-shadow: 2px 2px 0 oklch(40% 0.05 250);
  transition: all 0.15s ease;
}
.pixel-btn:hover {
  background: oklch(35% 0.05 250);
  transform: translateY(-1px);
  box-shadow: 3px 3px 0 oklch(40% 0.05 250);
}
.pixel-btn:active {
  transform: translateY(1px);
  box-shadow: 1px 1px 0 oklch(40% 0.05 250);
}
```

#### 5.2 像素卡片规范
```css
.pixel-card {
  background: oklch(30% 0.05 250);
  border: 2px solid oklch(40% 0.05 250);
  box-shadow: 
    2px 2px 0 oklch(40% 0.05 250),
    4px 4px 0 oklch(35% 0.05 250);
  padding: 16px;
  margin: 8px;
}
```

#### 5.3 像素状态指示器
- **在线状态**：绿色像素点 `oklch(70% 0.15 145)`
- **离线状态**：红色像素点 `oklch(65% 0.15 25)`
- **警告状态**：黄色像素点 `oklch(75% 0.15 85)`
- **未知状态**：灰色像素点 `oklch(50% 0.05 250)`

#### 5.4 像素进度条
```css
.pixel-progress-bar {
  background: oklch(25% 0.05 250);
  border: 2px solid oklch(40% 0.05 250);
  height: 16px;
  position: relative;
}
.pixel-progress-fill {
  background: oklch(70% 0.15 195);
  height: 100%;
  transition: width 0.3s ease;
}
```

#### 5.5 像素风格响应式适配
- **像素网格系统**：基于8px网格对齐所有元素
- **移动端适配**：
  - 调整像素边框为1px（移动端优化）
  - 保持字体清晰可读
  - 确保触摸目标足够大
- **桌面端优化**：
  - 完整像素化效果展示
  - 增强交互反馈
  - 保持像素风格一致性

### 5. TypeScript 使用规范

#### 5.1 类型定义
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

## 数据架构设计

### 1. 混合存储架构

本项目采用**本地优先 + 远程同步**的混合架构设计，确保应用在离线状态下完全可用，同时支持远程数据同步和扩展功能。

#### 1.1 架构原则
- **本地优先**：默认使用本地 SQLite 数据库，无需网络连接即可完整使用
- **可选同步**：支持配置远程服务器进行数据同步
- **渐进增强**：远程服务提供额外功能，不影响核心本地功能
- **数据一致性**：本地和远程数据保持同步，支持冲突解决

#### 1.2 数据分层设计

```typescript
// 数据层架构
interface DataLayer {
  // 本地存储层
  local: {
    sqlite: SQLiteDatabase
    cache: LocalCache
  }
  
  // 远程服务层
  remote?: {
    api: RemoteAPIClient
    sync: SyncManager
  }
  
  // 数据访问层
  repository: DataRepository
}
```

#### 1.3 数据类型分类

**本地数据（Local-First Data）**
- 个人信息（用户资料、偏好设置）
- 个人待办事项
- 本地笔记和草稿
- 应用配置和主题设置
- 离线缓存数据

**同步数据（Sync Data）**
- 跨设备共享的待办事项
- 用户生成的内容（如果需要备份）
- 应用设置同步

**远程数据（Remote Data）**
- 动态和文章内容
- 社区数据
- 实时通知
- 共享资源

### 2. 技术实现方案

#### 2.1 本地存储实现

```rust
// Tauri 后端 - 本地数据库管理
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
async fn init_local_database() -> Result<(), String> {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_users_table",
            sql: "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_todos_table",
            sql: "CREATE TABLE todos (id INTEGER PRIMARY KEY, title TEXT, completed BOOLEAN, user_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
            kind: MigrationKind::Up,
        },
    ];
    
    // 执行迁移
    Ok(())
}
```

#### 2.2 远程服务配置

```typescript
// 前端 - 远程服务配置
interface RemoteConfig {
  enabled: boolean
  baseUrl: string
  apiKey?: string
  syncInterval: number // 分钟
  features: {
    contentSync: boolean
    dynamicFeed: boolean
    notifications: boolean
  }
}

// 配置管理
const useRemoteConfig = () => {
  const config = ref<RemoteConfig>({
    enabled: false,
    baseUrl: '',
    syncInterval: 30,
    features: {
      contentSync: false,
      dynamicFeed: false,
      notifications: false
    }
  })
  
  const saveConfig = async (newConfig: RemoteConfig) => {
    await invoke('save_remote_config', { config: newConfig })
    config.value = newConfig
  }
  
  return { config, saveConfig }
}
```

#### 2.3 数据访问层设计

```typescript
// 统一数据访问接口
interface DataRepository<T> {
  // 本地操作
  getLocal(id: string): Promise<T | null>
  saveLocal(data: T): Promise<void>
  deleteLocal(id: string): Promise<void>
  listLocal(filter?: any): Promise<T[]>
  
  // 远程操作（可选）
  getRemote?(id: string): Promise<T | null>
  saveRemote?(data: T): Promise<void>
  syncWithRemote?(): Promise<void>
}

// 具体实现示例 - 待办事项
class TodoRepository implements DataRepository<Todo> {
  async getLocal(id: string): Promise<Todo | null> {
    return await invoke('get_todo_local', { id })
  }
  
  async saveLocal(todo: Todo): Promise<void> {
    await invoke('save_todo_local', { todo })
  }
  
  async syncWithRemote(): Promise<void> {
    const remoteConfig = await invoke('get_remote_config')
    if (!remoteConfig.enabled) return
    
    // 执行同步逻辑
    const localTodos = await this.listLocal()
    const remoteTodos = await this.getRemoteList()
    
    // 合并和冲突解决
    await this.mergeData(localTodos, remoteTodos)
  }
}
```

#### 2.4 同步机制设计

```typescript
// 同步管理器
class SyncManager {
  private syncInterval: number = 30 * 60 * 1000 // 30分钟
  private isOnline: boolean = navigator.onLine
  
  async startAutoSync() {
    if (!this.isOnline) return
    
    setInterval(async () => {
      try {
        await this.performSync()
      } catch (error) {
        console.error('同步失败:', error)
      }
    }, this.syncInterval)
  }
  
  async performSync() {
    const repositories = [
      new TodoRepository(),
      new UserRepository(),
      // 其他需要同步的数据仓库
    ]
    
    for (const repo of repositories) {
      if (repo.syncWithRemote) {
        await repo.syncWithRemote()
      }
    }
  }
  
  // 冲突解决策略
  resolveConflict<T>(local: T, remote: T): T {
    // 实现冲突解决逻辑
    // 例如：最后修改时间优先、用户选择、合并等
    return local // 简化示例
  }
}
```

### 3. 配置界面设计

#### 3.1 远程服务配置页面

```vue
<template>
  <div class="bg-gray-950 min-h-screen p-6">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-100 mb-8">远程服务配置</h1>
      
      <!-- 基础配置 -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="text-gray-100">服务器设置</CardTitle>
          <CardDescription class="text-gray-400">
            配置远程服务器以启用数据同步和扩展功能
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center space-x-2">
            <Switch v-model:checked="config.enabled" />
            <Label class="text-gray-300">启用远程服务</Label>
          </div>
          
          <div v-if="config.enabled" class="space-y-4">
            <div>
              <Label class="text-gray-300">服务器地址</Label>
              <Input 
                v-model="config.baseUrl" 
                placeholder="https://api.example.com"
                class="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
            
            <div>
              <Label class="text-gray-300">API 密钥（可选）</Label>
              <Input 
                v-model="config.apiKey" 
                type="password"
                placeholder="输入 API 密钥"
                class="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
            
            <div>
              <Label class="text-gray-300">同步间隔（分钟）</Label>
              <Input 
                v-model.number="config.syncInterval" 
                type="number"
                min="5"
                max="1440"
                class="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <!-- 功能配置 -->
      <Card class="mb-6" v-if="config.enabled">
        <CardHeader>
          <CardTitle class="text-gray-100">功能设置</CardTitle>
          <CardDescription class="text-gray-400">
            选择要启用的远程功能
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <Label class="text-gray-300">内容同步</Label>
              <p class="text-sm text-gray-500">同步待办事项和个人数据</p>
            </div>
            <Switch v-model:checked="config.features.contentSync" />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <Label class="text-gray-300">动态推送</Label>
              <p class="text-sm text-gray-500">获取最新动态和文章</p>
            </div>
            <Switch v-model:checked="config.features.dynamicFeed" />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <Label class="text-gray-300">实时通知</Label>
              <p class="text-sm text-gray-500">接收推送通知</p>
            </div>
            <Switch v-model:checked="config.features.notifications" />
          </div>
        </CardContent>
      </Card>
      
      <!-- 操作按钮 -->
      <div class="flex gap-4">
        <Button @click="saveConfiguration" class="bg-cyan-600 hover:bg-cyan-500">
          保存配置
        </Button>
        <Button @click="testConnection" variant="outline" v-if="config.enabled">
          测试连接
        </Button>
        <Button @click="performManualSync" variant="outline" v-if="config.enabled">
          立即同步
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { config, saveConfig } = useRemoteConfig()
const { performSync } = useSyncManager()

async function saveConfiguration() {
  try {
    await saveConfig(config.value)
    // 显示成功提示
  } catch (error) {
    // 显示错误提示
  }
}

async function testConnection() {
  try {
    const result = await invoke('test_remote_connection', { 
      baseUrl: config.value.baseUrl,
      apiKey: config.value.apiKey 
    })
    // 显示连接结果
  } catch (error) {
    // 显示连接失败
  }
}

async function performManualSync() {
  try {
    await performSync()
    // 显示同步成功
  } catch (error) {
    // 显示同步失败
  }
}
</script>
```

### 4. 数据库设计

#### 4.1 本地数据库表结构

```sql
-- 用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  preferences TEXT, -- JSON 格式存储用户偏好
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME
);

-- 待办事项分类表（一级分类）
CREATE TABLE todo_categories (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL, -- 分类名称，如："xxx小程序开发"
  description TEXT,
  color TEXT, -- 分类颜色标识
  icon TEXT, -- 分类图标
  user_id INTEGER REFERENCES users(id),
  sort_order INTEGER DEFAULT 0, -- 排序顺序
  remote_id TEXT, -- 远程服务器上的 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 标签表（支持多级标签）
CREATE TABLE todo_tags (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL, -- 标签名称，如："首页"、"UI界面"、"接口对接"
  parent_id TEXT REFERENCES todo_tags(id), -- 父标签ID，支持多级结构
  level INTEGER DEFAULT 1, -- 标签层级：1为一级标签，2为二级标签，以此类推
  color TEXT, -- 标签颜色
  user_id INTEGER REFERENCES users(id),
  sort_order INTEGER DEFAULT 0, -- 同级标签排序
  remote_id TEXT, -- 远程服务器上的 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 待办事项表（修改版）
CREATE TABLE todos (
  id TEXT PRIMARY KEY, -- UUID
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0, -- 优先级：1-低，2-中，3-高，4-紧急
  due_date DATETIME,
  category_id TEXT REFERENCES todo_categories(id), -- 所属分类
  user_id INTEGER REFERENCES users(id),
  remote_id TEXT, -- 远程服务器上的 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 待办事项标签关联表（多对多关系）
CREATE TABLE todo_tag_relations (
  id TEXT PRIMARY KEY, -- UUID
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES todo_tags(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(todo_id, tag_id) -- 防止重复关联
);

-- 应用配置表
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT, -- JSON 格式
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 同步日志表
CREATE TABLE sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  record_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'success', 'failed'
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5. API 接口设计

#### 5.1 远程 API 接口规范

```typescript
// 待办事项分类接口
interface TodoCategory {
  id: string // UUID
  name: string // 分类名称，如："xxx小程序开发"
  description?: string
  color?: string // 分类颜色标识
  icon?: string // 分类图标
  userId: number
  sortOrder: number // 排序顺序
  remoteId?: string // 远程服务器上的 ID
  createdAt: string
  updatedAt: string
  lastSyncAt?: string
  isDeleted: boolean
}

// 标签接口（支持多级标签）
interface TodoTag {
  id: string // UUID
  name: string // 标签名称，如："首页"、"UI界面"、"接口对接"
  parentId?: string // 父标签ID，支持多级结构
  level: number // 标签层级：1为一级标签，2为二级标签，以此类推
  color?: string // 标签颜色
  userId: number
  sortOrder: number // 同级标签排序
  remoteId?: string // 远程服务器上的 ID
  createdAt: string
  updatedAt: string
  lastSyncAt?: string
  isDeleted: boolean
  children?: TodoTag[] // 子标签（用于前端展示树形结构）
}

// 待办事项接口（修改版）
interface Todo {
  id: string // UUID
  title: string
  description?: string
  completed: boolean
  priority: number // 优先级：1-低，2-中，3-高，4-紧急
  dueDate?: string
  categoryId?: string // 所属分类
  userId: number
  remoteId?: string // 远程服务器上的 ID
  createdAt: string
  updatedAt: string
  lastSyncAt?: string
  isDeleted: boolean
  // 关联数据（用于前端展示）
  category?: TodoCategory
  tags?: TodoTag[]
}

// 待办事项标签关联接口
interface TodoTagRelation {
  id: string // UUID
  todoId: string
  tagId: string
  createdAt: string
}

// API 接口定义
interface RemoteAPI {
  // 认证
  auth: {
    login(credentials: LoginCredentials): Promise<AuthToken>
    refresh(token: string): Promise<AuthToken>
    logout(): Promise<void>
  }
  
  // 数据同步
  sync: {
    getTodos(lastSync?: Date): Promise<Todo[]>
    uploadTodos(todos: Todo[]): Promise<SyncResult>
    getCategories(lastSync?: Date): Promise<TodoCategory[]>
    uploadCategories(categories: TodoCategory[]): Promise<SyncResult>
    getTags(lastSync?: Date): Promise<TodoTag[]>
    uploadTags(tags: TodoTag[]): Promise<SyncResult>
    getConflicts(): Promise<Conflict[]>
    resolveConflict(conflictId: string, resolution: any): Promise<void>
  }
  
  // 内容获取
  content: {
    getDynamics(page: number, limit: number): Promise<Dynamic[]>
    getArticles(page: number, limit: number): Promise<Article[]>
    getNotifications(): Promise<Notification[]>
  }
}

// 同步结果
interface SyncResult {
  success: boolean
  conflicts: Conflict[]
  updated: number
  created: number
  deleted: number
}

// 待办事项查询参数
interface TodoQueryParams {
  categoryId?: string // 按分类筛选
  tagIds?: string[] // 按标签筛选（支持多个标签）
  completed?: boolean // 按完成状态筛选
  priority?: number // 按优先级筛选
  dueDateFrom?: string // 截止日期范围开始
  dueDateTo?: string // 截止日期范围结束
  keyword?: string // 关键词搜索（标题和描述）
  sortBy?: 'created_at' | 'updated_at' | 'due_date' | 'priority' // 排序字段
  sortOrder?: 'asc' | 'desc' // 排序方向
  page?: number // 分页页码
  limit?: number // 每页数量
}

// 待办事项统计信息
interface TodoStats {
  total: number // 总数
  completed: number // 已完成
  pending: number // 待完成
  overdue: number // 已逾期
  byCategory: Record<string, number> // 按分类统计
  byPriority: Record<number, number> // 按优先级统计
  byTag: Record<string, number> // 按标签统计
}
```

### 6. 待办事项分类和标签系统使用示例

#### 6.1 数据结构示例

```typescript
// 示例：创建"xxx小程序开发"分类
const category: TodoCategory = {
  id: 'cat-001',
  name: 'xxx小程序开发',
  description: '小程序项目相关的所有待办事项',
  color: '#0891b2', // cyan-600
  icon: 'smartphone',
  userId: 1,
  sortOrder: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isDeleted: false
}

// 示例：创建多级标签结构
const tags: TodoTag[] = [
  // 一级标签：首页
  {
    id: 'tag-001',
    name: '首页',
    level: 1,
    color: '#06b6d4', // cyan-500
    userId: 1,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  // 二级标签：UI界面
  {
    id: 'tag-002',
    name: 'UI界面',
    parentId: 'tag-001', // 父标签为"首页"
    level: 2,
    color: '#3b82f6', // blue-500
    userId: 1,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  },
  // 二级标签：接口对接
  {
    id: 'tag-003',
    name: '接口对接',
    parentId: 'tag-001', // 父标签为"首页"
    level: 2,
    color: '#10b981', // emerald-500
    userId: 1,
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isDeleted: false
  }
]

// 示例：创建待办事项
const todo: Todo = {
  id: 'todo-001',
  title: '设计首页轮播图组件',
  description: '实现首页轮播图的UI设计和交互效果',
  completed: false,
  priority: 3, // 高优先级
  dueDate: '2024-01-15T23:59:59Z',
  categoryId: 'cat-001', // 属于"xxx小程序开发"分类
  userId: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isDeleted: false,
  // 关联的标签：首页 > UI界面
  tags: [tags[0], tags[1]] // 首页 + UI界面
}
```

#### 6.2 查询使用示例

```typescript
// 查询某个分类下的所有待办事项
const todosByCategory = await queryTodos({
  categoryId: 'cat-001',
  sortBy: 'priority',
  sortOrder: 'desc'
})

// 查询包含特定标签的待办事项
const todosByTags = await queryTodos({
  tagIds: ['tag-002'], // UI界面标签
  completed: false,
  sortBy: 'due_date',
  sortOrder: 'asc'
})

// 复合查询：特定分类 + 多个标签 + 优先级
const complexQuery = await queryTodos({
  categoryId: 'cat-001',
  tagIds: ['tag-001', 'tag-002'], // 首页 + UI界面
  priority: 3, // 高优先级
  completed: false
})

// 获取统计信息
const stats = await getTodoStats({
  categoryId: 'cat-001'
})
// 结果示例：
// {
//   total: 25,
//   completed: 10,
//   pending: 15,
//   overdue: 3,
//   byCategory: { 'cat-001': 25 },
//   byPriority: { 1: 5, 2: 8, 3: 10, 4: 2 },
//   byTag: { 'tag-001': 15, 'tag-002': 8, 'tag-003': 7 }
// }
```

#### 6.3 UI组件设计建议

```vue
<!-- 分类选择器组件 -->
<template>
  <div class="category-selector">
    <h3 class="text-lg font-semibold text-gray-100 mb-4">项目分类</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-cyan-500 transition-colors"
        :class="{ 'border-cyan-500 bg-cyan-900/20': selectedCategoryId === category.id }"
        @click="selectCategory(category.id)"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: category.color }"
          />
          <Icon :name="category.icon" class="w-5 h-5 text-gray-400" />
          <span class="text-gray-100 font-medium">{{ category.name }}</span>
        </div>
        <p class="text-gray-400 text-sm mt-2">{{ category.description }}</p>
      </div>
    </div>
  </div>
</template>

<!-- 多级标签选择器组件 -->
<template>
  <div class="tag-selector">
    <h3 class="text-lg font-semibold text-gray-100 mb-4">标签筛选</h3>
    <div class="space-y-3">
      <div v-for="parentTag in parentTags" :key="parentTag.id">
        <!-- 一级标签 -->
        <div class="flex items-center gap-2 mb-2">
          <input 
            :id="`tag-${parentTag.id}`"
            v-model="selectedTagIds"
            :value="parentTag.id"
            type="checkbox"
            class="rounded border-gray-600 bg-gray-800 text-cyan-600"
          >
          <label 
            :for="`tag-${parentTag.id}`"
            class="text-gray-100 font-medium cursor-pointer"
          >
            {{ parentTag.name }}
          </label>
        </div>
        
        <!-- 二级标签 -->
        <div v-if="parentTag.children?.length" class="ml-6 space-y-2">
          <div 
            v-for="childTag in parentTag.children" 
            :key="childTag.id"
            class="flex items-center gap-2"
          >
            <input 
              :id="`tag-${childTag.id}`"
              v-model="selectedTagIds"
              :value="childTag.id"
              type="checkbox"
              class="rounded border-gray-600 bg-gray-800 text-cyan-600"
            >
            <label 
              :for="`tag-${childTag.id}`"
              class="text-gray-300 cursor-pointer"
            >
              {{ childTag.name }}
            </label>
            <div 
              class="w-3 h-3 rounded-full ml-auto"
              :style="{ backgroundColor: childTag.color }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 7. 实施建议

#### 7.1 开发阶段
1. **第一阶段**：实现完整的本地功能，确保离线可用
   - 创建数据库表结构
   - 实现基础的CRUD操作
   - 开发分类和标签管理界面
2. **第二阶段**：添加远程配置界面和基础 API 集成
   - 实现分类和标签的同步机制
   - 添加冲突解决策略
3. **第三阶段**：实现数据同步机制和冲突解决
   - 完善增量同步逻辑
   - 实现多设备数据一致性
4. **第四阶段**：添加高级功能（动态推送、通知等）
   - 基于分类和标签的智能提醒
   - 数据统计和可视化

#### 7.2 技术要点
- 使用 `tauri-plugin-sql` 管理本地 SQLite 数据库
- 使用 `tauri-plugin-store` 存储应用配置
- 实现乐观锁机制处理并发更新
- 使用增量同步减少网络传输
- 实现离线队列，网络恢复时自动同步
- **分类和标签最佳实践**：
  - 分类用于项目级别的组织（如："xxx小程序开发"、"yyy网站重构"）
  - 标签用于功能模块的细分（如："首页 > UI界面"、"用户中心 > 权限管理"）
  - 支持标签的多级嵌套，但建议不超过3级
  - 为分类和标签提供颜色标识，提升视觉识别度
  - 实现标签的智能推荐功能，基于历史使用记录

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
- **重要**：由于 Tauri 使用固定端口，只能启动一个开发服务器实例
- **禁止在每次代码修改后重新启动服务器**，应保持服务器持续运行
- 开发过程中服务器会自动热重载，无需手动重启

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

## 设计参考规范

### 运动健康页面设计规范

基于现代运动健康应用的设计理念，本项目采用以下设计要点：

#### 设计关键特征
1. **现代扁平化设计**：简洁的界面，避免过度装饰
2. **深色主题**：以深灰色背景为主，营造专业感
3. **卡片式布局**：信息分组清晰，层次分明
4. **数据可视化**：重视图表和数据的直观展示
5. **圆角设计**：统一使用 8-12px 圆角，增加亲和力

#### 具体实现要点

**1. 布局结构**
```vue
<template>
  <!-- 主容器：深色背景 -->
  <div class="min-h-screen bg-gray-950 p-6">
    <!-- 顶部问候区域 -->
    <header class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-100">Hello, Alex!</h1>
          <p class="text-gray-400">Ready for today's challenges?</p>
        </div>
        <div class="flex gap-3">
          <button class="p-2 bg-gray-800 rounded-lg text-gray-300">
            <Icon name="lucide:search" />
          </button>
          <button class="px-4 py-2 bg-cyan-600 text-white rounded-lg">
            Premium
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主要内容网格 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：数据卡片 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 运动数据卡片 -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <!-- 卡片内容 -->
        </div>
      </div>
      
      <!-- 右侧：日历和活动 -->
      <div class="space-y-6">
        <!-- 日历卡片 -->
        <div class="bg-cyan-600 rounded-xl p-6">
          <!-- 日历内容 -->
        </div>
      </div>
    </div>
  </div>
</template>
```

**2. 数据展示卡片**
```vue
<template>
  <!-- 数据指标卡片 -->
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <!-- 标题区域 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-100">Physical Activity</h3>
      <select class="bg-gray-800 text-gray-300 rounded-lg px-3 py-1 text-sm">
        <option>Today</option>
      </select>
    </div>
    
    <!-- 数据指标网格 -->
    <div class="grid grid-cols-3 gap-6">
      <!-- 步数 -->
      <div class="text-center">
        <div class="mb-2">
          <!-- 图表或图标 -->
          <div class="w-12 h-12 bg-emerald-600 rounded-lg mx-auto flex items-center justify-center">
            <Icon name="lucide:footprints" class="text-white" />
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-100">8,745</div>
        <div class="text-sm text-gray-400">Steps</div>
        <div class="text-xs text-emerald-500 mt-1">Goal: 8,000</div>
      </div>
      
      <!-- 卡路里 -->
      <div class="text-center">
        <div class="mb-2">
          <div class="w-12 h-12 bg-orange-500 rounded-lg mx-auto flex items-center justify-center">
            <Icon name="lucide:flame" class="text-white" />
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-100">700</div>
        <div class="text-sm text-gray-400">Calories burned</div>
        <div class="text-xs text-orange-500 mt-1">Goal: 500</div>
      </div>
      
      <!-- 活动时间 -->
      <div class="text-center">
        <div class="mb-2">
          <div class="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
            <Icon name="lucide:clock" class="text-white" />
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-100">2h 45min</div>
        <div class="text-sm text-gray-400">Activity time</div>
        <div class="text-xs text-blue-500 mt-1">Goal: 2h 30min</div>
      </div>
    </div>
  </div>
</template>
```

**3. 进度环形图**
```vue
<template>
  <!-- 睡眠时间卡片 -->
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <h3 class="text-lg font-semibold text-gray-100 mb-4">Sleep Time</h3>
    <div class="flex items-center gap-4">
      <!-- 环形进度条 -->
      <div class="relative w-20 h-20">
        <svg class="w-20 h-20 transform -rotate-90">
          <!-- 背景圆环 -->
          <circle cx="40" cy="40" r="36" stroke="#374151" stroke-width="8" fill="none" />
          <!-- 进度圆环 -->
          <circle 
            cx="40" 
            cy="40" 
            r="36" 
            stroke="#10b981" 
            stroke-width="8" 
            fill="none"
            stroke-dasharray="226"
            stroke-dashoffset="45"
            stroke-linecap="round"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-lg font-bold text-gray-100">7.4h</span>
        </div>
      </div>
      
      <!-- 睡眠信息 -->
      <div>
        <div class="text-gray-100 font-medium">Last night</div>
        <div class="text-gray-400 text-sm">Goal is 8 hours</div>
      </div>
    </div>
  </div>
</template>
```

**4. 活动列表**
```vue
<template>
  <!-- 我的活动卡片 -->
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-100">My Activities</h3>
      <span class="text-sm text-gray-400">You have 3 planned activities</span>
    </div>
    
    <!-- 活动标签 -->
    <div class="flex gap-2 mb-4">
      <button class="px-3 py-1 bg-cyan-600 text-white rounded-full text-sm">All</button>
      <button class="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">Alone</button>
      <button class="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">With friends</button>
    </div>
    
    <!-- 活动列表 -->
    <div class="space-y-3">
      <!-- 跑步活动 -->
      <div class="flex items-center gap-3 p-3 bg-blue-600 rounded-lg">
        <div class="flex -space-x-2">
          <img class="w-8 h-8 rounded-full border-2 border-white" src="/avatar1.jpg" alt="">
          <img class="w-8 h-8 rounded-full border-2 border-white" src="/avatar2.jpg" alt="">
        </div>
        <div class="flex-1">
          <div class="text-white font-medium">Running</div>
          <div class="text-blue-100 text-sm">7:00 AM</div>
        </div>
        <Icon name="lucide:chevron-right" class="text-white" />
      </div>
      
      <!-- 健身房活动 -->
      <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
        <div class="flex -space-x-2">
          <img class="w-8 h-8 rounded-full border-2 border-gray-600" src="/avatar3.jpg" alt="">
        </div>
        <div class="flex-1">
          <div class="text-gray-100 font-medium">Gym</div>
          <div class="text-gray-400 text-sm">8:00 PM</div>
        </div>
        <Icon name="lucide:chevron-right" class="text-gray-400" />
      </div>
    </div>
  </div>
</template>
```

#### 设计实现注意事项

1. **颜色使用**：严格按照配色规范，主要使用 `cyan-600` 作为强调色
2. **间距统一**：卡片内边距使用 `p-6`，组件间距使用 `gap-6`
3. **圆角一致**：所有卡片使用 `rounded-xl` (12px圆角)
4. **文字层次**：标题用 `text-gray-100`，描述用 `text-gray-400`
5. **交互反馈**：按钮要有 hover 状态，使用 `transition-colors`
6. **图标使用**：统一使用 Lucide 图标库，保持视觉一致性

---

**注意**：本规范基于项目当前配置制定，会根据项目发展和技术栈更新进行调整。