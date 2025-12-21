import express from 'express'
import exampleRouter from './example.js'
import sourceRouter from './source.js'  // 引入信息源路由

const router = express.Router()

// 引入所有子路由
router.use(exampleRouter)
router.use(sourceRouter)  // 使用信息源路由

// 根路由
router.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running', version: '1.0.0' })
})

export default router
