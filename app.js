import express from 'express'
import cors from 'cors'

// 数据库初始化
import initDatabase from './config/db_init.js'

// 错误处理中间件
import { errorHandler, notFoundHandler } from './app/middleware/errorHandler.js'

const app = express()

// 中间件配置
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 引入路由
import indexRouter from './app/routes/index.js'
app.use('/api', indexRouter)

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 404处理中间件
app.use(notFoundHandler)

// 错误处理中间件
app.use(errorHandler)

export default app
