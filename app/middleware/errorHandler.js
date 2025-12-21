// 错误处理中间件

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // 处理Sequelize验证错误
  if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
    const errors = err.errors.map(e => e.message)
    return res.status(400).json({
      success: false,
      message: '验证失败',
      errors
    })
  }
  
  // 处理Sequelize唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: '该记录已存在'
    })
  }
  
  // 处理404错误
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || '资源未找到'
    })
  }
  
  // 其他错误
  return res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
}

// 404处理中间件
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`请求的路由 ${req.originalUrl} 不存在`)
  error.status = 404
  next(error)
}
