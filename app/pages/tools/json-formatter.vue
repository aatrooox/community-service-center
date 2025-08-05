<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

// 页面标题
useHead({
  title: 'JSON 格式化工具 - 社区服务中心',
})

// 响应式数据
const inputJson = ref('')
const outputJson = ref('')
const isValid = ref(true)
const errorMessage = ref('')
const indentSize = ref(2)

// 格式化 JSON
function formatJson() {
  try {
    if (!inputJson.value.trim()) {
      outputJson.value = ''
      isValid.value = true
      errorMessage.value = ''
      return
    }

    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, indentSize.value)
    isValid.value = true
    errorMessage.value = ''
  }
  catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的 JSON 格式'
    outputJson.value = ''
  }
}

// 压缩 JSON
function compressJson() {
  try {
    if (!inputJson.value.trim()) {
      outputJson.value = ''
      return
    }

    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    isValid.value = true
    errorMessage.value = ''
  }
  catch (error) {
    isValid.value = false
    errorMessage.value = error instanceof Error ? error.message : '无效的 JSON 格式'
    outputJson.value = ''
  }
}

// 清空内容
function clearAll() {
  inputJson.value = ''
  outputJson.value = ''
  isValid.value = true
  errorMessage.value = ''
}

// 复制到剪贴板
function copyToClipboard() {
  if (outputJson.value) {
    navigator.clipboard.writeText(outputJson.value)
  }
}

// 示例 JSON
function loadExample() {
  inputJson.value = JSON.stringify({
    name: '张三',
    age: 30,
    city: '北京',
    hobbies: ['阅读', '游泳', '编程'],
    address: {
      street: '中关村大街',
      number: 123,
      zipCode: '100080',
    },
    isActive: true,
  }, null, 2)
}

// 监听输入变化
watch(inputJson, () => {
  if (inputJson.value.trim()) {
    formatJson()
  }
  else {
    outputJson.value = ''
    isValid.value = true
    errorMessage.value = ''
  }
})

// 监听缩进大小变化
watch(indentSize, () => {
  if (inputJson.value.trim() && isValid.value) {
    formatJson()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 工具标题 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <Icon name="lucide:braces" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            JSON 格式化工具
          </h1>
          <p class="text-gray-600">
            格式化、验证和压缩 JSON 数据
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Badge class="bg-blue-100 text-blue-700 border-blue-200">
          开发工具
        </Badge>
        <Badge variant="outline" class="text-gray-600 border-gray-300">
          JSON
        </Badge>
      </div>
    </div>

    <!-- 控制面板 -->
    <Card class="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-gray-900 flex items-center gap-2">
          <Icon name="lucide:settings" class="w-5 h-5" />
          控制面板
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-3">
          <Button @click="formatJson">
            <Icon name="lucide:align-left" class="w-4 h-4 mr-2" />
            格式化
          </Button>
          <Button variant="outline" @click="compressJson">
            <Icon name="lucide:minimize-2" class="w-4 h-4 mr-2" />
            压缩
          </Button>
          <Button variant="outline" @click="loadExample">
            <Icon name="lucide:file-text" class="w-4 h-4 mr-2" />
            加载示例
          </Button>
          <Button variant="outline" @click="clearAll">
            <Icon name="lucide:trash-2" class="w-4 h-4 mr-2" />
            清空
          </Button>
          <Button v-if="outputJson" variant="outline" @click="copyToClipboard">
            <Icon name="lucide:copy" class="w-4 h-4 mr-2" />
            复制结果
          </Button>

          <!-- 缩进设置 -->
          <div class="flex items-center gap-2 ml-auto">
            <label class="text-sm text-gray-600">缩进大小:</label>
            <select
              v-model="indentSize"
              class="px-3 py-1 bg-white border border-gray-300 rounded text-gray-900 text-sm shadow-sm"
            >
              <option :value="2">
                2 空格
              </option>
              <option :value="4">
                4 空格
              </option>
              <option :value="8">
                8 空格
              </option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 输入输出区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <Card class="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle class="text-gray-900 flex items-center gap-2">
            <Icon name="lucide:edit" class="w-5 h-5" />
            输入 JSON
          </CardTitle>
          <CardDescription class="text-gray-600">
            在此处粘贴或输入需要格式化的 JSON 数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            v-model="inputJson"
            placeholder="请输入 JSON 数据..."
            class="min-h-[400px] font-mono text-sm bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
          />
        </CardContent>
      </Card>

      <!-- 输出区域 -->
      <Card class="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-gray-900 flex items-center gap-2">
                <Icon name="lucide:check-circle" class="w-5 h-5" />
                格式化结果
              </CardTitle>
              <CardDescription class="text-gray-600">
                格式化后的 JSON 数据
              </CardDescription>
            </div>
            <div class="flex items-center gap-2">
              <Badge
                v-if="inputJson.trim()"
                :class="isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ isValid ? '有效' : '无效' }}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <!-- 错误信息 -->
          <div v-if="!isValid && errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center gap-2 text-red-700">
              <Icon name="lucide:alert-circle" class="w-4 h-4" />
              <span class="text-sm font-medium">JSON 格式错误</span>
            </div>
            <p class="text-sm text-red-600 mt-1">
              {{ errorMessage }}
            </p>
          </div>

          <!-- 输出文本框 -->
          <Textarea
            v-model="outputJson"
            readonly
            placeholder="格式化后的 JSON 将显示在这里..."
            class="min-h-[400px] font-mono text-sm bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
          />
        </CardContent>
      </Card>
    </div>

    <!-- 使用说明 -->
    <Card class="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-gray-900 flex items-center gap-2">
          <Icon name="lucide:info" class="w-5 h-5" />
          使用说明
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">
              功能特性
            </h4>
            <ul class="space-y-1">
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3 h-3 text-green-600" />
                实时 JSON 验证
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3 h-3 text-green-600" />
                自动格式化美化
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3 h-3 text-green-600" />
                JSON 数据压缩
              </li>
              <li class="flex items-center gap-2">
                <Icon name="lucide:check" class="w-3 h-3 text-green-600" />
                可调节缩进大小
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">
              使用方法
            </h4>
            <ul class="space-y-1">
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-mono">1.</span>
                在左侧输入框中粘贴或输入 JSON 数据
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-mono">2.</span>
                系统会自动验证并格式化 JSON
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-mono">3.</span>
                使用控制面板的按钮进行格式化或压缩
              </li>
              <li class="flex items-start gap-2">
                <span class="text-cyan-600 font-mono">4.</span>
                点击复制按钮将结果复制到剪贴板
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
