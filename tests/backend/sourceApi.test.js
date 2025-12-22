import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { Sequelize } from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'

// 创建测试专用的数据库连接
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 测试数据库使用不同的文件，避免影响主数据库
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/test_infodata.db'), // 测试数据库文件
  logging: false, // 禁用测试日志
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
})

// 动态导入模型并使用测试数据库
import SourceModel from '../../app/models/sourceModel.js'
const Source = SourceModel(testSequelize)

// 导入应用，但需要替换数据库连接
import app from '../../app.js'

describe('信息源API', () => {
  // 在所有测试前重置测试数据库
  beforeAll(async () => {
    await testSequelize.sync({ force: true })
    
    // 插入测试数据
    await Source.bulkCreate([
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: '开源代码托管平台',
        category: '开发工具',
        tags: ['开源', '代码', '开发'],
        icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
      },
      {
        name: 'Vue.js',
        url: 'https://vuejs.org',
        description: '渐进式JavaScript框架',
        category: '开发框架',
        tags: ['Vue', 'JavaScript', '框架'],
        icon: 'https://vuejs.org/images/logo.png'
      },
      {
        name: 'React',
        url: 'https://react.dev',
        description: '用于构建用户界面的JavaScript库',
        category: '开发框架',
        tags: ['React', 'JavaScript', '库'],
        icon: 'https://react.dev/favicon.ico'
      }
    ])
  })
  
  // 在所有测试后关闭测试数据库连接
  afterAll(async () => {
    await testSequelize.close()
  })
  
  // 移除直接操作数据库的边界测试，改为通过API测试
  // 边界情况测试将通过API操作来验证，确保不直接修改数据库
  
  describe('GET /api/sources', () => {
    it('应该返回分页数据', async () => {
      const response = await request(app)
        .get('/api/sources')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('sources')
      expect(response.body.data).toHaveProperty('pagination')
      expect(response.body.data.pagination).toHaveProperty('total')
      expect(response.body.data.pagination).toHaveProperty('current')
      expect(response.body.data.pagination).toHaveProperty('pageSize')
      expect(Array.isArray(response.body.data.sources)).toBe(true)
      expect(response.body.data.sources.length).toBe(3)
      expect(response.body.data.pagination.total).toBe(3)
    })
    
    it('应该支持搜索功能', async () => {
      const response = await request(app)
        .get('/api/sources?search=GitHub')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.data.sources.length).toBe(1)
      expect(response.body.data.sources[0].name).toBe('GitHub')
    })
    
    it('应该支持分类筛选', async () => {
      const response = await request(app)
        .get('/api/sources?category=开发框架')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.data.sources.length).toBe(2)
      expect(response.body.data.sources.every(source => source.category === '开发框架')).toBe(true)
    })
    
    it('应该支持标签搜索', async () => {
      const response = await request(app)
        .get('/api/sources?search=JavaScript')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      // JavaScript标签应该匹配Vue.js和React
      expect(response.body.data.sources.length).toBe(2)
      const names = response.body.data.sources.map(source => source.name)
      expect(names).toContain('Vue.js')
      expect(names).toContain('React')
    })
    
    it('应该支持多条件组合查询', async () => {
      const response = await request(app)
        .get('/api/sources?search=JavaScript&category=开发框架')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      // JavaScript + 开发框架 应该匹配Vue.js和React
      expect(response.body.data.sources.length).toBe(2)
      response.body.data.sources.forEach(source => {
        expect(source.category).toBe('开发框架')
      })
    })
    
    it('应该支持单页大小为1的分页', async () => {
      const response = await request(app)
        .get('/api/sources?page=1&pageSize=1')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.data.sources.length).toBe(1)
      expect(response.body.data.pagination.pageSize).toBe(1)
      expect(response.body.data.pagination.total).toBe(3)
    })
    
    it('应该在搜索不到结果时返回空数组', async () => {
      const response = await request(app)
        .get('/api/sources?search=不存在的关键词')
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.data.sources.length).toBe(0)
      expect(response.body.data.pagination.total).toBe(0)
    })
  })
  
  describe('GET /api/sources/:id', () => {
    it('应该根据ID返回单个信息源', async () => {
      // 先获取所有信息源，获取第一个ID
      const sourcesResponse = await request(app).get('/api/sources')
      const firstSourceId = sourcesResponse.body.data.sources[0].id
      
      const response = await request(app)
        .get(`/api/sources/${firstSourceId}`)
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.id).toBe(firstSourceId)
      expect(response.body.data).toHaveProperty('name')
    })
    
    it('应该在ID不存在时返回404错误', async () => {
      const invalidId = 999
      const response = await request(app)
        .get(`/api/sources/${invalidId}`)
        .expect(404)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('信息源未找到')
    })
  })
  
  describe('POST /api/sources', () => {
    it('应该成功创建新信息源', async () => {
      const newSource = {
        name: '测试网站',
        url: 'https://test.com',
        description: '测试信息源',
        category: '测试分类',
        tags: ['测试', '演示'],
        icon: 'https://test.com/favicon.ico'
      }
      
      const response = await request(app)
        .post('/api/sources')
        .send(newSource)
        .expect(201)
        
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('信息源创建成功')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.name).toBe(newSource.name)
      expect(response.body.data.url).toBe(newSource.url)
      
      // 验证数据已存入数据库
      const getResponse = await request(app).get('/api/sources')
      expect(getResponse.body.data.pagination.total).toBe(4)
    })
    
    it('应该在缺少必填字段时返回验证错误', async () => {
      const invalidSource = {
        // 缺少name和url
        description: '无效信息源'
      }
      
      const response = await request(app)
        .post('/api/sources')
        .send(invalidSource)
        .expect(400)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('验证失败')
      expect(Array.isArray(response.body.errors)).toBe(true)
      expect(response.body.errors.length).toBe(2)
    })
    
    it('应该在name为空时返回验证错误', async () => {
      const invalidSource = {
        name: '',
        url: 'https://test.com'
      }
      
      const response = await request(app)
        .post('/api/sources')
        .send(invalidSource)
        .expect(400)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('验证失败')
    })
    
    it('应该在url为空时返回验证错误', async () => {
      const invalidSource = {
        name: '测试网站',
        url: ''
      }
      
      const response = await request(app)
        .post('/api/sources')
        .send(invalidSource)
        .expect(400)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('验证失败')
    })
  })
  
  describe('PUT /api/sources/:id', () => {
    it('应该成功更新信息源', async () => {
      // 先获取一个信息源ID
      const sourcesResponse = await request(app).get('/api/sources')
      const sourceId = sourcesResponse.body.data.sources[0].id
      
      const updateData = {
        name: '更新后的名称',
        url: 'https://updated.com',
        description: '更新后的描述',
        category: '更新后的分类'
      }
      
      const response = await request(app)
        .put(`/api/sources/${sourceId}`)
        .send(updateData)
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('信息源更新成功')
      expect(response.body.data.name).toBe(updateData.name)
      expect(response.body.data.url).toBe(updateData.url)
      
      // 验证更新已生效
      const getResponse = await request(app).get(`/api/sources/${sourceId}`)
      expect(getResponse.body.data.name).toBe(updateData.name)
    })
    
    it('应该在ID不存在时返回404错误', async () => {
      const invalidId = 999
      const updateData = {
        name: '无效更新',
        url: 'https://invalid.com'
      }
      
      const response = await request(app)
        .put(`/api/sources/${invalidId}`)
        .send(updateData)
        .expect(404)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('信息源未找到')
    })
    
    it('应该在更新时缺少必填字段返回验证错误', async () => {
      // 先获取一个信息源ID
      const sourcesResponse = await request(app).get('/api/sources')
      const sourceId = sourcesResponse.body.data.sources[0].id
      
      const invalidUpdate = {
        // 缺少name和url
        description: '无效更新数据'
      }
      
      const response = await request(app)
        .put(`/api/sources/${sourceId}`)
        .send(invalidUpdate)
        .expect(400)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('验证失败')
    })
  })
  
  describe('DELETE /api/sources/:id', () => {
    it('应该成功删除信息源', async () => {
      // 先获取一个信息源ID
      const sourcesResponse = await request(app).get('/api/sources')
      const sourceId = sourcesResponse.body.data.sources[0].id
      const initialTotal = sourcesResponse.body.data.pagination.total
      
      const response = await request(app)
        .delete(`/api/sources/${sourceId}`)
        .expect(200)
        
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('信息源删除成功')
      
      // 验证删除后总数减1
      const getResponse = await request(app).get('/api/sources')
      expect(getResponse.body.data.pagination.total).toBe(initialTotal - 1)
      
      // 验证删除的资源已不存在
      await request(app).get(`/api/sources/${sourceId}`).expect(404)
    })
    
    it('应该在ID不存在时返回404错误', async () => {
      const invalidId = 999
      
      const response = await request(app)
        .delete(`/api/sources/${invalidId}`)
        .expect(404)
        
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('信息源未找到')
    })
  })
})
