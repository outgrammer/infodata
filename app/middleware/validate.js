// 数据验证中间件

// 验证规则定义（简化版，仅验证必填项）
export const sourceValidationRules = {
  name: {
    required: true,
    type: 'string',
    message: '请输入信息源名称'
  },
  url: {
    required: true,
    type: 'string',
    message: '请输入信息源链接'
  }
}

// 数据验证中间件
export const validate = (rules) => {
  return (req, res, next) => {
    const errors = []
    const data = req.body
    
    // 验证每个字段
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]
      
      // 检查必填字段
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${field}是必填字段`)
        continue
      }
      
      // 如果值为空且不是必填字段，则跳过后续验证
      if ((value === undefined || value === null || value === '') && !rule.required) {
        continue
      }
      
      // 检查数组类型（特殊处理）
      if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(rule.message || `${field}必须是数组类型`)
          continue
        }
      } else {
        // 检查其他类型
        if (rule.type && typeof value !== rule.type) {
          errors.push(rule.message || `${field}必须是${rule.type}类型`)
          continue
        }
      }
      
      // 检查最小长度
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(rule.message || `${field}长度不能小于${rule.minLength}个字符`)
        continue
      }
      
      // 检查最大长度
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(rule.message || `${field}长度不能超过${rule.maxLength}个字符`)
        continue
      }
      
      // 自定义验证函数
      if (rule.validate && !rule.validate(value)) {
        errors.push(rule.message || `${field}验证失败`)
        continue
      }
    }
    
    // 如果有错误，返回400响应
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors
      })
    }
    
    // 验证通过，继续处理请求
    next()
  }
}
