import app from './app.js'
import initDatabase from './config/db_init.js'

const PORT = process.env.PORT || 3000

// 初始化数据库
initDatabase().then(() => {
  // 数据库初始化完成后启动服务器
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}).catch(error => {
  console.error('Failed to initialize database:', error)
  process.exit(1)
})
