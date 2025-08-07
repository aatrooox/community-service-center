// Tauri SQL 数据库 Composable
import Database from '@tauri-apps/plugin-sql'
import { useLog } from './useLog'

export class SQLService {
  private db: Database | null = null
  private dbPath: string
  private logger = useLog()

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
    await this.logger.info('创建用户', { tag: 'SQL', context: { name, email } })
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
    await this.logger.info('删除用户', { tag: 'SQL', context: { id } })
    await db.execute('DELETE FROM users WHERE id = ?', [id])
  }

  // 设置操作
  async setSetting(key: string, value: string): Promise<void> {
    const db = this.ensureDB()
    await this.logger.info('设置配置', { tag: 'SQL', context: { key, value } })
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
    await this.logger.info('删除设置', { tag: 'SQL', context: { key } })
    await db.execute('DELETE FROM settings WHERE key = ?', [key])
  }

  // 待办事项操作

  // 服务器操作
  async createServer(server: any): Promise<number> {
    const db = this.ensureDB()

    await this.logger.debug('createServer 参数', { tag: 'SQL', context: { server } })
    try {
      const params = [server.name, server.url, server.description || null, server.isActive ? 1 : 0]
      await this.logger.debug('createServer SQL参数', { tag: 'SQL', context: { params } })
      const result = await db.execute(
        'INSERT OR IGNORE INTO servers (name, url, description, is_active) VALUES (?, ?, ?, ?)',
        params,
      )
      await this.logger.debug('createServer 执行结果', { tag: 'SQL', context: { result } })
      return result.lastInsertId as number
    }
    catch (err) {
      await this.logger.error('createServer 错误', err, { tag: 'SQL' })
      // 如果是唯一约束错误，忽略它（服务器已存在）
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        await this.logger.info(`服务器已存在，跳过创建: ${server.url}`, { tag: 'SQL' })
        return 0
      }
      throw err
    }
  }

  async getAllServers(): Promise<any[]> {
    const db = this.ensureDB()
    return await db.select('SELECT * FROM servers ORDER BY created_at DESC')
  }

  async updateServer(id: number, updates: any): Promise<void> {
    const db = this.ensureDB()

    await this.logger.debug('updateServer 参数', { tag: 'SQL', context: { id, updates } })
    const fields: string[] = []
    const values: any[] = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.url !== undefined) {
      fields.push('url = ?')
      values.push(updates.url)
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
    const finalParams = [...values, id]
    const sql = `UPDATE servers SET ${fields.join(', ')} WHERE id = ?`
    await this.logger.debug('updateServer SQL', { tag: 'SQL', context: { sql, params: finalParams } })

    const result = await db.execute(sql, finalParams)
    await this.logger.debug('updateServer 执行结果', { tag: 'SQL', context: { result } })
  }

  async deleteServer(id: number): Promise<void> {
    const db = this.ensureDB()
    await this.logger.info('删除服务器', { tag: 'SQL', context: { id } })
    await db.execute('DELETE FROM servers WHERE id = ?', [id])
  }

  // 服务器 Token 操作
  async createServerToken(token: any): Promise<number> {
    const db = this.ensureDB()
    await this.logger.info('创建服务器Token', { tag: 'SQL', context: { token } })

    // 如果传入的是serverId，需要先获取对应的server_url
    let serverUrl = token.serverUrl
    if (token.serverId && !serverUrl) {
      const servers = await db.select('SELECT url FROM servers WHERE id = ?', [token.serverId]) as any[]
      if (servers.length === 0) {
        throw new Error(`服务器ID ${token.serverId} 不存在`)
      }
      serverUrl = servers[0].url
    }

    const result = await db.execute(
      'INSERT INTO server_tokens (server_url, token_name, token_value, description, is_active) VALUES (?, ?, ?, ?, ?)',
      [serverUrl, token.name || token.tokenName, token.value || token.tokenValue, token.description || null, token.isActive ? 1 : 0],
    )
    return result.lastInsertId as number
  }

  async getAllServerTokens(): Promise<any[]> {
    const db = this.ensureDB()
    const tokens = await db.select(`
      SELECT 
        st.*,
        s.id as server_id,
        s.name as server_name
      FROM server_tokens st
      LEFT JOIN servers s ON st.server_url = s.url
      ORDER BY st.created_at DESC
    `) as any[]

    // 转换数据格式
    return tokens.map(token => ({
      ...token,
      id: token.id, // 确保包含id字段
      serverId: token.server_id,
      isActive: Boolean(token.is_active),
      serverName: token.server_name,
      serverUrl: token.server_url,
      tokenName: token.token_name,
      tokenValue: token.token_value,
      name: token.token_name,
      value: token.token_value,
      createdAt: token.created_at,
      updatedAt: token.updated_at,
    }))
  }

  async getServerTokensByUrl(serverUrl: string): Promise<any[]> {
    const db = this.ensureDB()
    const tokens = await db.select(`
      SELECT 
        st.*,
        s.id as server_id,
        s.name as server_name
      FROM server_tokens st
      LEFT JOIN servers s ON st.server_url = s.url
      WHERE st.server_url = ? AND st.is_active = 1 
      ORDER BY st.created_at DESC
    `, [serverUrl]) as any[]

    // 转换数据格式
    return tokens.map(token => ({
      ...token,
      id: token.id, // 确保包含id字段
      serverId: token.server_id,
      isActive: Boolean(token.is_active),
      serverName: token.server_name,
      serverUrl: token.server_url,
      tokenName: token.token_name,
      tokenValue: token.token_value,
      name: token.token_name,
      value: token.token_value,
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
    await this.logger.info('删除服务器Token', { tag: 'SQL', context: { id } })
    await db.execute('DELETE FROM server_tokens WHERE id = ?', [id])
  }

  // 链接实体操作
  async createLinkEntity(entity: any): Promise<number> {
    const db = this.ensureDB()
    await this.logger.info('创建链接实体', { tag: 'SQL', context: { entity } })
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
    await this.logger.info('删除链接实体', { tag: 'SQL', context: { id } })
    await db.execute('DELETE FROM link_entities WHERE id = ?', [id])
  }

  // 链接标签操作
  async createLinkTag(tag: any): Promise<number> {
    const db = this.ensureDB()
    await this.logger.info('创建链接标签', { tag: 'SQL', context: { tag } })
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
    await this.logger.info('删除链接标签', { tag: 'SQL', context: { id } })
    await db.execute('DELETE FROM link_tags WHERE id = ?', [id])
  }

  // 链接任务操作
  async createLinkTask(task: any): Promise<number> {
    const db = this.ensureDB()
    await this.logger.info('创建链接任务', { tag: 'SQL', context: { task } })
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
    await this.logger.info('删除链接任务', { tag: 'SQL', context: { id } })
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

  // API 接口配置操作
  async createApiEndpoint(endpoint: any): Promise<number> {
    const db = this.ensureDB()
    await this.logger.info('创建API接口', { tag: 'SQL', context: { endpoint } })
    const result = await db.execute(
      'INSERT INTO api_endpoints (server_url, name, path, method, description, params, headers, cache_duration, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        endpoint.serverUrl,
        endpoint.name,
        endpoint.path,
        endpoint.method || 'GET',
        endpoint.description || null,
        endpoint.params ? JSON.stringify(endpoint.params) : null,
        endpoint.headers ? JSON.stringify(endpoint.headers) : null,
        endpoint.cacheDuration || 300,
        endpoint.isActive ? 1 : 0,
        endpoint.sortOrder || 0,
      ],
    )
    return result.lastInsertId as number
  }

  async getAllApiEndpoints(): Promise<any[]> {
    const db = this.ensureDB()
    const endpoints = await db.select('SELECT * FROM api_endpoints ORDER BY server_url, sort_order, created_at DESC') as any[]

    return endpoints.map(endpoint => ({
      ...endpoint,
      isActive: Boolean(endpoint.is_active),
      serverUrl: endpoint.server_url,
      cacheDuration: endpoint.cache_duration,
      sortOrder: endpoint.sort_order,
      createdAt: endpoint.created_at,
      updatedAt: endpoint.updated_at,
      params: endpoint.params ? JSON.parse(endpoint.params) : null,
      headers: endpoint.headers ? JSON.parse(endpoint.headers) : null,
    }))
  }

  async getApiEndpointsByServer(serverUrl: string): Promise<any[]> {
    const db = this.ensureDB()
    const endpoints = await db.select(
      'SELECT * FROM api_endpoints WHERE server_url = ? AND is_active = 1 ORDER BY sort_order, created_at DESC',
      [serverUrl],
    ) as any[]

    return endpoints.map(endpoint => ({
      ...endpoint,
      isActive: Boolean(endpoint.is_active),
      serverUrl: endpoint.server_url,
      cacheDuration: endpoint.cache_duration,
      sortOrder: endpoint.sort_order,
      createdAt: endpoint.created_at,
      updatedAt: endpoint.updated_at,
      params: endpoint.params ? JSON.parse(endpoint.params) : null,
      headers: endpoint.headers ? JSON.parse(endpoint.headers) : null,
    }))
  }

  async updateApiEndpoint(id: number, updates: any): Promise<void> {
    const db = this.ensureDB()
    const fields = []
    const values = []

    if (updates.serverUrl !== undefined) {
      fields.push('server_url = ?')
      values.push(updates.serverUrl)
    }
    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.path !== undefined) {
      fields.push('path = ?')
      values.push(updates.path)
    }
    if (updates.method !== undefined) {
      fields.push('method = ?')
      values.push(updates.method)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.params !== undefined) {
      fields.push('params = ?')
      values.push(updates.params ? JSON.stringify(updates.params) : null)
    }
    if (updates.headers !== undefined) {
      fields.push('headers = ?')
      values.push(updates.headers ? JSON.stringify(updates.headers) : null)
    }
    if (updates.cacheDuration !== undefined) {
      fields.push('cache_duration = ?')
      values.push(updates.cacheDuration)
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = ?')
      values.push(updates.isActive ? 1 : 0)
    }
    if (updates.sortOrder !== undefined) {
      fields.push('sort_order = ?')
      values.push(updates.sortOrder)
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)
      await db.execute(
        `UPDATE api_endpoints SET ${fields.join(', ')} WHERE id = ?`,
        values,
      )
    }
  }

  async deleteApiEndpoint(id: number): Promise<void> {
    const db = this.ensureDB()
    await this.logger.info('删除API接口', { tag: 'SQL', context: { id } })
    await db.execute('DELETE FROM api_endpoints WHERE id = ?', [id])
  }

  // API 缓存操作
  async setApiCache(endpointId: number, cacheKey: string, data: any, expiresAt: Date): Promise<void> {
    const db = this.ensureDB()
    await db.execute(
      'INSERT OR REPLACE INTO api_cache (endpoint_id, cache_key, data, expires_at) VALUES (?, ?, ?, ?)',
      [endpointId, cacheKey, JSON.stringify(data), expiresAt.toISOString()],
    )
  }

  async getApiCache(cacheKey: string): Promise<any | null> {
    const db = this.ensureDB()
    const result = await db.select(
      'SELECT * FROM api_cache WHERE cache_key = ? AND expires_at > datetime("now")',
      [cacheKey],
    ) as any[]

    if (result.length > 0) {
      return {
        ...result[0],
        data: JSON.parse(result[0].data),
        endpointId: result[0].endpoint_id,
        cacheKey: result[0].cache_key,
        expiresAt: result[0].expires_at,
        createdAt: result[0].created_at,
      }
    }
    return null
  }

  async clearExpiredCache(): Promise<void> {
    const db = this.ensureDB()
    await db.execute('DELETE FROM api_cache WHERE expires_at <= datetime("now")')
  }

  async clearApiCache(endpointId?: number): Promise<void> {
    const db = this.ensureDB()
    if (endpointId) {
      await db.execute('DELETE FROM api_cache WHERE endpoint_id = ?', [endpointId])
    }
    else {
      await db.execute('DELETE FROM api_cache')
    }
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
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '数据库初始化失败'
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

  // Server related methods
  const createServer = async (server: any) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await sqlService.createServer(server)
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建服务器失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllServers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const servers = await sqlService.getAllServers()
      return servers
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteServer = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteServer(id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除服务器失败'
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

  const updateServer = async (id: number, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateServer(id, updates)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新服务器失败'
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

  // API 接口配置相关方法
  const createApiEndpoint = async (endpoint: any) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await sqlService.createApiEndpoint(endpoint)
      return result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '创建 API 接口失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getAllApiEndpoints = async () => {
    isLoading.value = true
    error.value = null

    try {
      const endpoints = await sqlService.getAllApiEndpoints()
      return endpoints
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取 API 接口列表失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getApiEndpointsByServer = async (serverUrl: string) => {
    isLoading.value = true
    error.value = null

    try {
      const endpoints = await sqlService.getApiEndpointsByServer(serverUrl)
      return endpoints
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取服务器 API 接口失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const updateApiEndpoint = async (id: number, updates: any) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.updateApiEndpoint(id, updates)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '更新 API 接口失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const deleteApiEndpoint = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.deleteApiEndpoint(id)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '删除 API 接口失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  // API 缓存相关方法
  const setApiCache = async (endpointId: number, cacheKey: string, data: any, expiresAt: Date) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.setApiCache(endpointId, cacheKey, data, expiresAt)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '设置 API 缓存失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const getApiCache = async (cacheKey: string) => {
    isLoading.value = true
    error.value = null

    try {
      const cache = await sqlService.getApiCache(cacheKey)
      return cache
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取 API 缓存失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const clearExpiredCache = async () => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.clearExpiredCache()
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '清理过期缓存失败'
      throw err
    }
    finally {
      isLoading.value = false
    }
  }

  const clearApiCache = async (endpointId?: number) => {
    isLoading.value = true
    error.value = null

    try {
      await sqlService.clearApiCache(endpointId)
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '清理 API 缓存失败'
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

    // 服务器相关方法
    createServer,
    getAllServers,
    updateServer,
    deleteServer,

    // 服务器 Token 相关方法
    createServerToken,
    getAllServerTokens,
    getServerTokensByUrl,
    updateServerToken,
    deleteServerToken,

    // API 接口配置相关方法
    createApiEndpoint,
    getAllApiEndpoints,
    getApiEndpointsByServer,
    updateApiEndpoint,
    deleteApiEndpoint,

    // API 缓存相关方法
    setApiCache,
    getApiCache,
    clearExpiredCache,
    clearApiCache,

    autoInit,
  }
}
