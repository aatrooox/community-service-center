// Tauri SQL 数据库 Composable
import Database from '@tauri-apps/plugin-sql'

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

// 创建单例实例
const databaseService = new DatabaseService()

/**
 * Tauri 数据库 Composable
 * 提供数据库操作的响应式接口
 */
export function useTauriDatabase() {
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const initDatabase = async () => {
    if (isInitialized.value)
      return

    isLoading.value = true
    error.value = null

    try {
      await databaseService.init()
      isInitialized.value = true
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '数据库初始化失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const insertUser = async (name: string, email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await databaseService.insertUser(name, email)
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '插入用户失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getUsers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await databaseService.getUsers()
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: number, name: string, email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await databaseService.updateUser(id, name, email)
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新用户失败'
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
      const result = await databaseService.deleteUser(id)
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除用户失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const closeDatabase = async () => {
    await databaseService.close()
    isInitialized.value = false
  }

  return {
    // 状态
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 方法
    initDatabase,
    insertUser,
    getUsers,
    updateUser,
    deleteUser,
    closeDatabase,
  }
}
