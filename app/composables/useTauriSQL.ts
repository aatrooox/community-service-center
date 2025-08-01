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

    // 创建待办分类表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todo_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL DEFAULT '#0891b2',
        icon TEXT NOT NULL DEFAULT 'folder',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建待办标签表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todo_tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        color TEXT NOT NULL DEFAULT '#06b6d4',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES todo_tags(id) ON DELETE CASCADE
      )
    `)

    // 创建待办事项表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN NOT NULL DEFAULT 0,
        priority INTEGER NOT NULL DEFAULT 2,
        due_date DATETIME,
        category_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES todo_categories(id) ON DELETE SET NULL
      )
    `)

    // 创建待办事项标签关联表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todo_tag_relations (
        todo_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (todo_id, tag_id),
        FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES todo_tags(id) ON DELETE CASCADE
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

  // 待办分类操作
  async createTodoCategory(category: any): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'INSERT INTO todo_categories (id, name, description, color, icon, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [category.id, category.name, category.description, category.color, category.icon, category.sortOrder, category.createdAt, category.updatedAt],
    )
  }

  async getAllTodoCategories(): Promise<any[]> {
    const db = this.ensureDB()
    return await db.select('SELECT * FROM todo_categories ORDER BY sort_order ASC, created_at DESC')
  }

  async deleteTodoCategory(id: string): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM todo_categories WHERE id = ?', [id])
  }

  // 待办标签操作
  async createTodoTag(tag: any): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'INSERT INTO todo_tags (id, name, parent_id, level, color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tag.id, tag.name, tag.parentId, tag.level, tag.color, tag.sortOrder, tag.createdAt, tag.updatedAt],
    )
  }

  async getAllTodoTags(): Promise<any[]> {
    const db = this.ensureDB()
    return await db.select('SELECT * FROM todo_tags ORDER BY level ASC, sort_order ASC, created_at DESC')
  }

  async deleteTodoTag(id: string): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM todo_tags WHERE id = ?', [id])
  }

  // 待办事项操作
  async createTodo(todo: any): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'INSERT INTO todos (id, title, description, completed, priority, due_date, category_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [todo.id, todo.title, todo.description, todo.completed ? 1 : 0, todo.priority, todo.dueDate, todo.categoryId, todo.createdAt, todo.updatedAt],
    )

    // 添加标签关联
    if (todo.tagIds && todo.tagIds.length > 0) {
      for (const tagId of todo.tagIds) {
        await db.execute(
          'INSERT INTO todo_tag_relations (todo_id, tag_id) VALUES (?, ?)',
          [todo.id, tagId],
        )
      }
    }
  }

  async getAllTodos(): Promise<any[]> {
    const db = this.ensureDB()
    const todos = await db.select(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM todos t
      LEFT JOIN todo_categories c ON t.category_id = c.id
      ORDER BY t.priority DESC, t.created_at DESC
    `) as any[]

    // 获取每个待办的标签并转换数据格式
    for (const todo of todos) {
      // 转换布尔值：SQLite的0/1转换为JavaScript的true/false
      todo.completed = Boolean(todo.completed)

      // 构建分类对象
      if (todo.category_name) {
        todo.category = {
          id: todo.category_id,
          name: todo.category_name,
          color: todo.category_color,
          icon: todo.category_icon,
        }
      }

      const tags = await db.select(`
        SELECT tg.* FROM todo_tags tg
        JOIN todo_tag_relations tr ON tg.id = tr.tag_id
        WHERE tr.todo_id = ?
        ORDER BY tg.level ASC, tg.sort_order ASC
      `, [todo.id]) as any[]
      todo.tags = tags

      // 清理临时字段
      delete todo.category_name
      delete todo.category_color
      delete todo.category_icon
    }

    return todos
  }

  async updateTodo(id: string, updates: any): Promise<void> {
    const db = this.ensureDB()
    const fields = []
    const values = []

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.completed !== undefined) {
      fields.push('completed = ?')
      values.push(updates.completed ? 1 : 0)
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?')
      values.push(updates.priority)
    }
    if (updates.dueDate !== undefined) {
      fields.push('due_date = ?')
      values.push(updates.dueDate)
    }
    if (updates.categoryId !== undefined) {
      fields.push('category_id = ?')
      values.push(updates.categoryId)
    }

    fields.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    await db.execute(
      `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
      values,
    )
  }

  async deleteTodo(id: string): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM todos WHERE id = ?', [id])
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

  // 待办分类操作
  const createTodoCategory = async (category: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.createTodoCategory(category)
      console.log('分类创建成功:', category.name)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建分类失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllTodoCategories = async () => {
    isLoading.value = true
    error.value = null

    try {
      const categories = await sqlService.getAllTodoCategories()
      return categories
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取分类列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteTodoCategory = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteTodoCategory(id)
      console.log('分类删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除分类失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 待办标签操作
  const createTodoTag = async (tag: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.createTodoTag(tag)
      console.log('标签创建成功:', tag.name)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建标签失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllTodoTags = async () => {
    isLoading.value = true
    error.value = null

    try {
      const tags = await sqlService.getAllTodoTags()
      return tags
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取标签列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteTodoTag = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteTodoTag(id)
      console.log('标签删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除标签失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 待办事项操作
  const createTodo = async (todo: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.createTodo(todo)
      console.log('待办创建成功:', todo.title)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建待办失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllTodos = async () => {
    isLoading.value = true
    error.value = null

    try {
      const todos = await sqlService.getAllTodos()
      return todos
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取待办列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateTodo = async (id: string, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateTodo(id, updates)
      console.log('待办更新成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新待办失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteTodo = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteTodo(id)
      console.log('待办删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除待办失败'
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

    // 待办相关方法
    createTodoCategory,
    getAllTodoCategories,
    deleteTodoCategory,
    createTodoTag,
    getAllTodoTags,
    deleteTodoTag,
    createTodo,
    getAllTodos,
    updateTodo,
    deleteTodo,

    autoInit,
  }
}
