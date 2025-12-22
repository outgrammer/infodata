import fs from 'fs'
import path from 'path'
import { sequelize } from './database.js'

// 导入所有模型工厂函数
import SourceModel from '../app/models/sourceModel.js'

// 初始化模型
const Source = SourceModel(sequelize)

// 创建数据目录
const createDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
    console.log('Data directory created successfully.')
  }
}

// 初始化数据库
const initDatabase = async () => {
  try {
    // 创建数据目录
    createDataDir()
    
    // 同步所有模型到数据库
    await sequelize.sync({
      alter: true // 自动更新表结构，如果表已存在
    })
    
    console.log('Database synchronization completed successfully.')
    
    // 测试数据（可选）
    await Source.findOrCreate({
      where: { name: '示例信息源' },
      defaults: {
        url: 'https://example.com',
        description: '这是一个示例信息源',
        category: '示例分类',
        tags: ['示例', '测试'],
        icon: 'https://example.com/icon.png'
      }
    })
    
    console.log('Test data inserted successfully.')
  } catch (error) {
    console.error('Database initialization failed:', error)
  }
}

// 如果直接运行此脚本，则执行初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
}

export default initDatabase
