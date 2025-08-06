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
      // Migration 会在插件初始化时自动执行，无需手动创建表
    }
  }

  private ensureDB(): Database {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用 init() 方法')
    }
    return this.db
  }

  // Migration 会在 Tauri 插件初始化时自动执行，无需手动创建表

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

  // 待办事项操作

  // 服务器 Token 操作
  async createServerToken(token: any): Promise<number> {
    const db = this.ensureDB()
    const result = await db.execute(
      'INSERT INTO server_tokens (server_url, token_name, token_value, description, is_active) VALUES (?, ?, ?, ?, ?)',
      [token.serverUrl, token.tokenName, token.tokenValue, token.description || null, token.isActive ? 1 : 0],
    )
    return result.lastInsertId as number
  }

  async getAllServerTokens(): Promise<any[]> {
    const db = this.ensureDB()
    const tokens = await db.select('SELECT * FROM server_tokens ORDER BY created_at DESC') as any[]

    // 转换数据格式
    return tokens.map(token => ({
      ...token,
      isActive: Boolean(token.is_active),
      serverName: token.server_name,
      serverUrl: token.server_url,
      tokenName: token.token_name,
      tokenValue: token.token_value,
      createdAt: token.created_at,
      updatedAt: token.updated_at,
    }))
  }

  async getServerTokensByUrl(serverUrl: string): Promise<any[]> {
    const db = this.ensureDB()
    const tokens = await db.select(
      'SELECT * FROM server_tokens WHERE server_url = ? AND is_active = 1 ORDER BY created_at DESC',
      [serverUrl],
    ) as any[]

    // 转换数据格式
    return tokens.map(token => ({
      ...token,
      isActive: Boolean(token.is_active),
      serverName: token.server_name,
      serverUrl: token.server_url,
      tokenName: token.token_name,
      tokenValue: token.token_value,
      createdAt: token.created_at,
      updatedAt: token.updated_at,
    }))
  }

  async updateServerToken(id: number, updates: any): Promise<void> {
    const db = this.ensureDB()
    const fields = []
    const values = []

    if (updates.serverUrl !== undefined) {
      fields.push('server_url = ?')
      values.push(updates.serverUrl)
    }
    if (updates.tokenName !== undefined) {
      fields.push('token_name = ?')
      values.push(updates.tokenName)
    }
    if (updates.tokenValue !== undefined) {
      fields.push('token_value = ?')
      values.push(updates.tokenValue)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = ?')
      values.push(updates.isActive ? 1 : 0)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await db.execute(
      `UPDATE server_tokens SET ${fields.join(', ')} WHERE id = ?`,
      values,
    )
  }

  async deleteServerToken(id: number): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM server_tokens WHERE id = ?', [id])
  }

  // 链接实体操作
  async createLinkEntity(entity: any): Promise<number> {
    const db = this.ensureDB()
    const result = await db.execute(
      'INSERT INTO link_entities (name, description, affection_points, color, icon, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        entity.name,
        entity.description || null,
        entity.affectionPoints || 0,
        entity.color,
        entity.icon,
        entity.startDate || null,
        entity.endDate || null,
      ],
    )
    return result.lastInsertId as number
  }

  async getAllLinkEntities(): Promise<any[]> {
    const db = this.ensureDB()
    const entities = await db.select('SELECT * FROM link_entities ORDER BY created_at DESC') as any[]

    // 转换数据格式
    return entities.map((entity: any) => ({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      affectionPoints: entity.affection_points,
      color: entity.color,
      icon: entity.icon,
      startDate: entity.start_date,
      endDate: entity.end_date,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    }))
  }

  async updateLinkEntity(id: number, updates: any): Promise<void> {
    const db = this.ensureDB()
    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.affectionPoints !== undefined) {
      fields.push('affection_points = ?')
      values.push(updates.affectionPoints)
    }
    if (updates.color !== undefined) {
      fields.push('color = ?')
      values.push(updates.color)
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?')
      values.push(updates.icon)
    }
    if (updates.startDate !== undefined) {
      fields.push('start_date = ?')
      values.push(updates.startDate)
    }
    if (updates.endDate !== undefined) {
      fields.push('end_date = ?')
      values.push(updates.endDate)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await db.execute(
      `UPDATE link_entities SET ${fields.join(', ')} WHERE id = ?`,
      values,
    )
  }

  async deleteLinkEntity(id: number): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM link_entities WHERE id = ?', [id])
  }

  // 链接标签操作
  async createLinkTag(tag: any): Promise<number> {
    const db = this.ensureDB()
    const result = await db.execute(
      'INSERT INTO link_tags (name, color, sort_order) VALUES (?, ?, ?)',
      [tag.name, tag.color, tag.sortOrder || 0],
    )
    return result.lastInsertId as number
  }

  async getAllLinkTags(): Promise<any[]> {
    const db = this.ensureDB()
    const tags: any[] = await db.select('SELECT * FROM link_tags ORDER BY sort_order ASC, created_at DESC') as any[]

    // 转换数据格式
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      sortOrder: tag.sort_order,
      createdAt: tag.created_at,
      updatedAt: tag.updated_at,
    }))
  }

  async updateLinkTag(id: number, updates: any): Promise<void> {
    const db = this.ensureDB()
    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.color !== undefined) {
      fields.push('color = ?')
      values.push(updates.color)
    }
    if (updates.sortOrder !== undefined) {
      fields.push('sort_order = ?')
      values.push(updates.sortOrder)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await db.execute(
      `UPDATE link_tags SET ${fields.join(', ')} WHERE id = ?`,
      values,
    )
  }

  async deleteLinkTag(id: number): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM link_tags WHERE id = ?', [id])
  }

  // 链接任务操作
  async createLinkTask(task: any): Promise<number> {
    const db = this.ensureDB()
    const result = await db.execute(
      'INSERT INTO link_tasks (title, description, completed, priority, due_date, entity_id, tag_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [task.title, task.description || null, task.completed ? 1 : 0, task.priority, task.dueDate || null, task.entityId, task.tagId || null],
    )
    return result.lastInsertId as number
  }

  async getAllLinkTasks(): Promise<any[]> {
    const db = this.ensureDB()
    const tasks: any[] = await db.select(`
      SELECT t.*, e.name as entity_name, e.color as entity_color, e.icon as entity_icon, tg.name as tag_name, tg.color as tag_color
      FROM link_tasks t
      LEFT JOIN link_entities e ON t.entity_id = e.id
      LEFT JOIN link_tags tg ON t.tag_id = tg.id
      ORDER BY t.priority DESC, t.created_at DESC
    `)

    return tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: Boolean(task.completed),
      priority: task.priority,
      dueDate: task.due_date,
      linkEntityId: task.entity_id,
      tagId: task.tag_id,
      entity: task.entity_name
        ? {
            id: task.entity_id,
            name: task.entity_name,
            color: task.entity_color,
            icon: task.entity_icon,
          }
        : null,
      tag: task.tag_name
        ? {
            id: task.tag_id,
            name: task.tag_name,
            color: task.tag_color,
          }
        : null,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }))
  }

  async updateLinkTask(id: number, updates: any): Promise<void> {
    const db = this.ensureDB()
    const fields: string[] = []
    const values: any[] = []

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
    if (updates.entityId !== undefined) {
      fields.push('entity_id = ?')
      values.push(updates.entityId)
    }
    if (updates.tagId !== undefined) {
      fields.push('tag_id = ?')
      values.push(updates.tagId)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    await db.execute(
      `UPDATE link_tasks SET ${fields.join(', ')} WHERE id = ?`,
      values,
    )
  }

  async deleteLinkTask(id: number): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM link_tasks WHERE id = ?', [id])
  }

  // 积分系统操作
  async addAffectionPoints(entityId: number, points: number): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'UPDATE link_entities SET affection_points = affection_points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [points, entityId],
    )
  }

  async getAffectionPoints(entityId: number): Promise<number> {
    const db = this.ensureDB()
    const result = await db.select(
      'SELECT affection_points FROM link_entities WHERE id = ?',
      [entityId],
    ) as any[]
    return result[0]?.affection_points || 0
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

  // 链接实体操作
  const createLinkEntity = async (entity: any): Promise<number> => {
    isLoading.value = true
    error.value = null

    try {
      const newId = await sqlService.createLinkEntity(entity)
      console.log('链接实体创建成功:', entity.name)
      return newId
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建链接实体失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllLinkEntities = async () => {
    isLoading.value = true
    error.value = null

    try {
      const entities = await sqlService.getAllLinkEntities()
      return entities
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取链接实体列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateLinkEntity = async (id: number, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateLinkEntity(id, updates)
      console.log('链接实体更新成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新链接实体失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteLinkEntity = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteLinkEntity(id)
      console.log('链接实体删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除链接实体失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 链接标签操作
  const createLinkTag = async (tag: any): Promise<number> => {
    isLoading.value = true
    error.value = null

    try {
      const newId = await sqlService.createLinkTag(tag)
      console.log('链接标签创建成功:', tag.name)
      return newId
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建链接标签失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllLinkTags = async () => {
    isLoading.value = true
    error.value = null

    try {
      const tags = await sqlService.getAllLinkTags()
      return tags
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取链接标签列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateLinkTag = async (id: number, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateLinkTag(id, updates)
      console.log('链接标签更新成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新链接标签失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteLinkTag = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteLinkTag(id)
      console.log('链接标签删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除链接标签失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 链接任务操作
  const createLinkTask = async (task: any): Promise<number> => {
    isLoading.value = true
    error.value = null

    try {
      const newId = await sqlService.createLinkTask(task)
      console.log('链接任务创建成功:', task.title)
      return newId
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建链接任务失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllLinkTasks = async () => {
    isLoading.value = true
    error.value = null

    try {
      const tasks = await sqlService.getAllLinkTasks()
      return tasks
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取链接任务列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateLinkTask = async (id: number, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateLinkTask(id, updates)
      console.log('链接任务更新成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新链接任务失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteLinkTask = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteLinkTask(id)
      console.log('链接任务删除成功:', id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除链接任务失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // 积分系统操作
  const addAffectionPoints = async (entityId: number, points: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.addAffectionPoints(entityId, points)
      console.log('好感度积分增加成功:', entityId, '+', points)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '增加好感度积分失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAffectionPoints = async (entityId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const points = await sqlService.getAffectionPoints(entityId)
      return points
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取好感度积分失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // Server Token related methods
  const createServerToken = async (token: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.createServerToken(token)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建服务器 Token 失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllServerTokens = async () => {
    isLoading.value = true
    error.value = null

    try {
      const tokens = await sqlService.getAllServerTokens()
      return tokens
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器 Token 列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getServerTokensByUrl = async (serverUrl: string) => {
    isLoading.value = true
    error.value = null

    try {
      const tokens = await sqlService.getServerTokensByUrl(serverUrl)
      return tokens
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器 Token 失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateServerToken = async (id: number, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateServerToken(id, updates)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新服务器 Token 失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteServerToken = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteServerToken(id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除服务器 Token 失败'
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

    // 链接管理相关方法
    createLinkEntity,
    getAllLinkEntities,
    updateLinkEntity,
    deleteLinkEntity,
    createLinkTag,
    getAllLinkTags,
    updateLinkTag,
    deleteLinkTag,
    createLinkTask,
    getAllLinkTasks,
    updateLinkTask,
    deleteLinkTask,

    // 积分系统相关方法
    addAffectionPoints,
    getAffectionPoints,

    // 服务器 Token 相关方法
    createServerToken,
    getAllServerTokens,
    getServerTokensByUrl,
    updateServerToken,
    deleteServerToken,

    autoInit,
  }
}
