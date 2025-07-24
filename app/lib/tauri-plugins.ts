// Tauri 插件使用示例
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'
import Database from '@tauri-apps/plugin-sql'
import { Store } from '@tauri-apps/plugin-store'

// SQL 数据库操作
export class DatabaseService {
  private db: Database | null = null

  async init() {
    try {
      // 加载 SQLite 数据库（相对于 App 目录）
      this.db = await Database.load('sqlite:app_data.db')

      // 创建示例表
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      console.log('数据库初始化成功')
    }
    catch (error) {
      console.error('数据库初始化失败:', error)
      throw error
    }
  }

  async insertUser(name: string, email: string) {
    if (!this.db)
      throw new Error('数据库未初始化')

    try {
      const result = await this.db.execute(
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        [name, email],
      )
      return result
    }
    catch (error) {
      console.error('插入用户失败:', error)
      throw error
    }
  }

  async getUsers() {
    if (!this.db)
      throw new Error('数据库未初始化')

    try {
      const result = await this.db.select('SELECT * FROM users ORDER BY created_at DESC')
      return result
    }
    catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  async updateUser(id: number, name: string, email: string) {
    if (!this.db)
      throw new Error('数据库未初始化')

    try {
      const result = await this.db.execute(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
      )
      return result
    }
    catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  async deleteUser(id: number) {
    if (!this.db)
      throw new Error('数据库未初始化')

    try {
      const result = await this.db.execute('DELETE FROM users WHERE id = $1', [id])
      return result
    }
    catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  async close() {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }
}

// Store 键值存储操作
export class StoreService {
  private store: Store | null = null

  constructor(private fileName = 'app_settings.bin') {
    // Store 需要异步初始化
  }

  async init(): Promise<void> {
    if (!this.store) {
      this.store = await Store.load(this.fileName)
    }
  }

  private ensureStore(): Store {
    if (!this.store) {
      throw new Error('Store 未初始化，请先调用 init() 方法')
    }
    return this.store
  }

  async set(key: string, value: any) {
    try {
      const store = this.ensureStore()
      await store.set(key, value)
      console.log(`设置 ${key} 成功`)
    }
    catch (error) {
      console.error(`设置 ${key} 失败:`, error)
      throw error
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const store = this.ensureStore()
      const value = await store.get<T>(key)
      return value ?? null
    }
    catch (error) {
      console.error(`获取 ${key} 失败:`, error)
      throw error
    }
  }

  async delete(key: string) {
    try {
      const store = this.ensureStore()
      await store.delete(key)
      console.log(`删除 ${key} 成功`)
    }
    catch (error) {
      console.error(`删除 ${key} 失败:`, error)
      throw error
    }
  }

  async clear() {
    try {
      const store = this.ensureStore()
      await store.clear()
      console.log('清空存储成功')
    }
    catch (error) {
      console.error('清空存储失败:', error)
      throw error
    }
  }

  async save() {
    try {
      const store = this.ensureStore()
      await store.save()
      console.log('保存存储成功')
    }
    catch (error) {
      console.error('保存存储失败:', error)
      throw error
    }
  }

  async keys() {
    try {
      const store = this.ensureStore()
      const keys = await store.keys()
      return keys
    }
    catch (error) {
      console.error('获取键列表失败:', error)
      throw error
    }
  }

  async values() {
    try {
      const store = this.ensureStore()
      const values = await store.values()
      return values
    }
    catch (error) {
      console.error('获取值列表失败:', error)
      throw error
    }
  }

  async entries() {
    try {
      const store = this.ensureStore()
      const entries = await store.entries()
      return entries
    }
    catch (error) {
      console.error('获取条目列表失败:', error)
      throw error
    }
  }

  async length() {
    try {
      const store = this.ensureStore()
      const length = await store.length()
      return length
    }
    catch (error) {
      console.error('获取存储长度失败:', error)
      throw error
    }
  }

  async has(key: string) {
    try {
      const store = this.ensureStore()
      const exists = await store.has(key)
      return exists
    }
    catch (error) {
      console.error(`检查 ${key} 是否存在失败:`, error)
      throw error
    }
  }
}

// 通知服务
export class NotificationService {
  async checkPermission(): Promise<boolean> {
    try {
      const granted = await isPermissionGranted()
      return granted
    }
    catch (error) {
      console.error('检查通知权限失败:', error)
      return false
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await requestPermission()
      return permission === 'granted'
    }
    catch (error) {
      console.error('请求通知权限失败:', error)
      return false
    }
  }

  async sendNotification(title: string, body: string, icon?: string) {
    try {
      // 检查权限
      let permissionGranted = await this.checkPermission()

      // 如果没有权限，请求权限
      if (!permissionGranted) {
        permissionGranted = await this.requestPermission()
      }

      // 发送通知
      if (permissionGranted) {
        await sendNotification({
          title,
          body,
          icon,
        })
        console.log('通知发送成功')
      }
      else {
        console.warn('通知权限未授予')
      }
    }
    catch (error) {
      console.error('发送通知失败:', error)
      throw error
    }
  }

  async sendSuccessNotification(message: string) {
    await this.sendNotification('操作成功', message)
  }

  async sendErrorNotification(message: string) {
    await this.sendNotification('操作失败', message)
  }

  async sendInfoNotification(title: string, message: string) {
    await this.sendNotification(title, message)
  }
}

// 导出单例实例
export const databaseService = new DatabaseService()
export const storeService = new StoreService()
export const notificationService = new NotificationService()

// 使用示例
export async function initializeServices() {
  try {
    // 初始化数据库
    await databaseService.init()

    // 初始化存储
    await storeService.init()

    // 设置一些默认配置
    await storeService.set('app_version', '1.0.0')
    await storeService.set('user_preferences', {
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
    })

    // 发送初始化完成通知
    await notificationService.sendSuccessNotification('应用初始化完成')

    console.log('所有服务初始化完成')
  }
  catch (error) {
    console.error('服务初始化失败:', error)
    await notificationService.sendErrorNotification('应用初始化失败')
    throw error
  }
}
