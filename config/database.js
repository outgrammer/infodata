import { Sequelize } from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/infodata.db'),
  logging: console.log, // 启用日志记录
  define: {
    timestamps: true, // 自动添加createdAt和updatedAt字段
    underscored: true, // 使用下划线命名（例如：created_at而不是createdAt）
    freezeTableName: true // 表名与模型名一致，不自动复数化
  }
})

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

export { sequelize, testConnection }
