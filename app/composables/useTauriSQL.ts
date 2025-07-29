// Tauri SQL 数据库 Composable
import Database from '@tauri-apps/plugin-sql'

export class SQLService {
  private db: Database | null = null
  private dbPath: string

  constructor(dbPath = 'sqlite:app.db') {
    this.dbPath = dbPath
  }

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await Database.load(this.dbPath)
      // 创建示例表
      await this.createTables()
    }
  }

  private ensureDB(): Database {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用 init() 方法')
    }
    return this.db
  }

  private async createTables(): Promise<void> {
    const db = this.ensureDB()

    // 创建用户表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建设置表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  // 用户操作
  async createUser(name: string, email: string): Promise<number> {
    const db = this.ensureDB()
    const result = await db.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email],
    )
    return result.lastInsertId as number
  }

  async getUser(id: number): Promise<any> {
    const db = this.ensureDB()
    const result = await db.select(
      'SELECT * FROM users WHERE id = ?',
      [id],
    ) as any[]
    return result[0] || null
  }

  async getAllUsers(): Promise<any[]> {
    const db = this.ensureDB()
    return await db.select('SELECT * FROM users ORDER BY created_at DESC')
  }

  async updateUser(id: number, name: string, email: string): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id],
    )
  }

  async deleteUser(id: number): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM users WHERE id = ?', [id])
  }

  // 设置操作
  async setSetting(key: string, value: string): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value],
    )
  }

  async getSetting(key: string): Promise<string | null> {
    const db = this.ensureDB()
    const result = await db.select(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    ) as any[]
    return result[0]?.value || null
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const db = this.ensureDB()
    const result = await db.select('SELECT key, value FROM settings') as any[]
    return result.reduce((acc: Record<string, string>, row: any) => {
      acc[row.key] = row.value
      return acc
    }, {})
  }

  async deleteSetting(key: string): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM settings WHERE key = ?', [key])
  }

  // 关闭数据库连接
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }
}

// 创建单例实例
const sqlService = new SQLService()

/**
 * Tauri SQL 数据库 Composable
 * 提供数据库操作的响应式接口
 */
export function useTauriSQL() {
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const initDatabase = async () => {
    if (isInitialized.value)
      return

    isLoading.value = true
    error.value = null

    try {
      await sqlService.init()
      isInitialized.value = true
      console.log('数据库初始化成功')
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '数据库初始化失败'
      console.error('数据库初始化失败:', err)
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const createUser = async (name: string, email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const userId = await sqlService.createUser(name, email)
      console.log('用户创建成功:', userId)
      return userId
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建用户失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const user = await sqlService.getUser(id)
      return user
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllUsers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const users = await sqlService.getAllUsers()
      return users
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const setSetting = async (key: string, value: string) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.setSetting(key, value)
      console.log('设置保存成功:', key)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '保存设置失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getSetting = async (key: string) => {
    isLoading.value = true
    error.value = null

    try {
      const value = await sqlService.getSetting(key)
      return value
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取设置失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllSettings = async () => {
    isLoading.value = true
    error.value = null

    try {
      const settings = await sqlService.getAllSettings()
      return settings
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取设置列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteUser(id)
      console.log('用户删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除用户失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteSetting = async (key: string) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteSetting(key)
      console.log('设置删除成功:', key)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除设置失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 自动初始化（可选）
  const autoInit = async () => {
    if (import.meta.client && !isInitialized.value) {
      await initDatabase()
    }
  }

  return {
    // 状态
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    initDatabase,
    createUser,
    getUser,
    getAllUsers,
    deleteUser,
    setSetting,
    getSetting,
    getAllSettings,
    deleteSetting,
    autoInit,
  }
}
