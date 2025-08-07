/**
 * API 数据获取服务
 * 提供统一的接口数据获取、缓存管理和错误处理功能
 */

import { useTauriHTTP } from './useTauriHTTP'
import { useTauriSQL } from './useTauriSQL'
import { useTauriStore } from './useTauriStore'

// ============= 类型定义 =============

/**
 * API 接口配置
 */
export interface ApiEndpoint {
  id: number
  serverUrl: string
  name: string
  path: string
  method: string
  description?: string
  params?: Record<string, any>
  headers?: Record<string, string>
  cacheDuration: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 服务器配置
 */
export interface ServerConfig {
  url: string
  name: string
  token?: string
  endpoints: ApiEndpoint[]
}

/**
 * API 响应数据
 */
export interface ApiResponse<T = any> {
  data: T
  cached: boolean
  timestamp: string
  endpoint: ApiEndpoint
}

/**
 * 数据获取选项
 */
export interface FetchOptions {
  forceRefresh?: boolean
  timeout?: number
  customParams?: Record<string, any>
  customHeaders?: Record<string, string>
}

// ============= API 服务类 =============

export class APIService {
  private httpClient: ReturnType<typeof useTauriHTTP>
  private sqlService: ReturnType<typeof useTauriSQL>
  private storeService: ReturnType<typeof useTauriStore>

  constructor() {
    this.httpClient = useTauriHTTP()
    this.sqlService = useTauriSQL()
    this.storeService = useTauriStore()
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(endpointId: number, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `endpoint_${endpointId}_${btoa(paramStr)}`
  }

  /**
   * 获取服务器的 Token
   */
  private async getServerToken(serverUrl: string): Promise<string | null> {
    try {
      const tokens = await this.sqlService.getServerTokensByUrl(serverUrl)
      return tokens.length > 0 ? tokens[0].tokenValue : null
    }
    catch (err) {
      console.warn('获取服务器 Token 失败:', err)
      return null
    }
  }

  /**
   * 构建请求头
   */
  private async buildHeaders(
    endpoint: ApiEndpoint,
    customHeaders?: Record<string, string>,
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...endpoint.headers,
      ...customHeaders,
    }

    // 添加 Token 认证
    const token = await this.getServerToken(endpoint.serverUrl)
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  /**
   * 构建请求 URL
   */
  private buildUrl(endpoint: ApiEndpoint, params?: Record<string, any>): string {
    const baseUrl = endpoint.serverUrl.replace(/\/$/, '')
    const path = endpoint.path.replace(/^\//, '')
    let url = `${baseUrl}/${path}`

    // 处理 GET 请求参数
    if (endpoint.method.toUpperCase() === 'GET' && params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return url
  }

  /**
   * 执行 HTTP 请求
   */
  private async executeRequest(
    endpoint: ApiEndpoint,
    options: FetchOptions = {},
  ): Promise<any> {
    const { customParams, customHeaders, timeout } = options
    const mergedParams = { ...endpoint.params, ...customParams }
    const headers = await this.buildHeaders(endpoint, customHeaders)
    const url = this.buildUrl(endpoint, mergedParams)

    const requestOptions: any = {
      method: endpoint.method,
      headers,
      timeout: timeout || 10000,
    }

    // 对于非 GET 请求，将参数放在请求体中
    if (endpoint.method.toUpperCase() !== 'GET' && mergedParams) {
      requestOptions.body = JSON.stringify(mergedParams)
    }

    console.log(`[API] 请求 ${endpoint.name}:`, { url, method: endpoint.method })

    const response = await this.httpClient.request(url, requestOptions)

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response?.status || 'Unknown'}: ${response?.statusText || 'Request failed'}`)
    }

    return response.data
  }

  /**
   * 获取接口数据（带缓存）
   */
  async fetchEndpointData(
    endpointId: number,
    options: FetchOptions = {},
  ): Promise<ApiResponse> {
    const { forceRefresh = false } = options

    // 获取接口配置
    const endpoints = await this.sqlService.getAllApiEndpoints()
    const endpoint = endpoints.find(ep => ep.id === endpointId)

    if (!endpoint) {
      throw new Error(`接口配置不存在: ${endpointId}`)
    }

    if (!endpoint.isActive) {
      throw new Error(`接口已禁用: ${endpoint.name}`)
    }

    const cacheKey = this.generateCacheKey(endpointId, options.customParams)

    // 检查缓存（如果不强制刷新）
    if (!forceRefresh) {
      try {
        const cached = await this.sqlService.getApiCache(cacheKey)
        if (cached) {
          console.log(`[API] 使用缓存数据: ${endpoint.name}`)
          return {
            data: cached.data,
            cached: true,
            timestamp: cached.createdAt,
            endpoint,
          }
        }
      }
      catch (err) {
        console.warn('获取缓存失败:', err)
      }
    }

    // 执行请求
    const data = await this.executeRequest(endpoint, options)
    const timestamp = new Date().toISOString()

    // 保存到缓存
    if (endpoint.cacheDuration > 0) {
      try {
        const expiresAt = new Date(Date.now() + endpoint.cacheDuration * 1000)
        await this.sqlService.setApiCache(endpointId, cacheKey, data, expiresAt)
      }
      catch (err) {
        console.warn('保存缓存失败:', err)
      }
    }

    return {
      data,
      cached: false,
      timestamp,
      endpoint,
    }
  }

  /**
   * 获取服务器的所有接口数据
   */
  async fetchServerData(
    serverUrl: string,
    options: FetchOptions = {},
  ): Promise<Record<string, ApiResponse>> {
    const endpoints = await this.sqlService.getApiEndpointsByServer(serverUrl)
    const results: Record<string, ApiResponse> = {}
    const errors: Record<string, string> = {}

    // 并发获取所有接口数据
    await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        try {
          const response = await this.fetchEndpointData(endpoint.id, options)
          results[endpoint.name] = response
        }
        catch (err) {
          const errorMsg = err instanceof Error ? err.message : '未知错误'
          errors[endpoint.name] = errorMsg
          console.error(`[API] 获取 ${endpoint.name} 数据失败:`, errorMsg)
        }
      }),
    )

    if (Object.keys(errors).length > 0) {
      console.warn('[API] 部分接口请求失败:', errors)
    }

    return results
  }

  /**
   * 获取所有服务器的数据
   */
  async fetchAllServersData(
    options: FetchOptions = {},
  ): Promise<Record<string, Record<string, ApiResponse>>> {
    // 获取所有服务器配置
    const servers = await this.sqlService.getAllServers()
    const results: Record<string, Record<string, ApiResponse>> = {}

    // 并发获取所有服务器数据
    await Promise.allSettled(
      servers.map(async (server) => {
        try {
          const serverData = await this.fetchServerData(server.url, options)
          results[server.name] = serverData
        }
        catch (err) {
          console.error(`[API] 获取服务器 ${server.name} 数据失败:`, err)
          results[server.name] = {}
        }
      }),
    )

    return results
  }

  /**
   * 清理过期缓存
   */
  async cleanupCache(): Promise<void> {
    await this.sqlService.clearExpiredCache()
  }

  /**
   * 清理指定接口的缓存
   */
  async clearEndpointCache(endpointId: number): Promise<void> {
    await this.sqlService.clearApiCache(endpointId)
  }
}

// ============= Composable =============

let globalAPIService: APIService | null = null

/**
 * API 服务 Composable
 */
export function useAPIService() {
  if (!globalAPIService) {
    globalAPIService = new APIService()
  }

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取接口数据
   */
  const fetchData = async (
    endpointId: number,
    options: FetchOptions = {},
  ): Promise<ApiResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await globalAPIService!.fetchEndpointData(endpointId, options)
      return response
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取数据失败'
      console.error('[API Service] 获取数据失败:', err)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 获取服务器数据
   */
  const fetchServerData = async (
    serverUrl: string,
    options: FetchOptions = {},
  ): Promise<Record<string, ApiResponse>> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await globalAPIService!.fetchServerData(serverUrl, options)
      return response
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器数据失败'
      console.error('[API Service] 获取服务器数据失败:', err)
      return {}
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 获取所有数据
   */
  const fetchAllData = async (
    options: FetchOptions = {},
  ): Promise<Record<string, Record<string, ApiResponse>>> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await globalAPIService!.fetchAllServersData(options)
      return response
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取所有数据失败'
      console.error('[API Service] 获取所有数据失败:', err)
      return {}
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 清理缓存
   */
  const cleanupCache = async (): Promise<void> => {
    try {
      await globalAPIService!.cleanupCache()
      console.log('[API Service] 缓存清理完成')
    }
    catch (err) {
      console.error('[API Service] 缓存清理失败:', err)
    }
  }

  /**
   * 清理指定接口缓存
   */
  const clearEndpointCache = async (endpointId: number): Promise<void> => {
    try {
      await globalAPIService!.clearEndpointCache(endpointId)
      console.log(`[API Service] 接口 ${endpointId} 缓存清理完成`)
    }
    catch (err) {
      console.error(`[API Service] 接口 ${endpointId} 缓存清理失败:`, err)
    }
  }

  return {
    // 状态
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    fetchData,
    fetchServerData,
    fetchAllData,
    cleanupCache,
    clearEndpointCache,

    // 服务实例（用于高级用法）
    service: globalAPIService!,
  }
}

export default useAPIService
