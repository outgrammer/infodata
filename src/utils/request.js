import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 使用环境变量配置API基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 加载状态管理
let loadingInstance = null
let loadingCount = 0

// 显示加载状态
const showLoading = () => {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.5)'
    })
  }
  loadingCount++
}

// 隐藏加载状态
const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    loadingCount = 0
  }
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    
    // 如果配置了showLoading，则显示加载状态
    if (config.showLoading !== false) {
      showLoading()
    }
    
    return config
  },
  error => {
    hideLoading()
    console.error('请求错误:', error)
    ElMessage.error('请求发送失败，请检查网络连接')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    hideLoading()
    return response.data
  },
  error => {
    hideLoading()
    console.error('响应错误:', error)
    
    // 统一错误处理
    let errorMessage = '服务器异常，请稍后重试'
    
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 可以在这里处理登录过期逻辑
          break
        case 403:
          errorMessage = '没有权限访问该资源'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = data.message || '服务器内部错误'
          break
        default:
          errorMessage = data.message || `请求失败（${status}）`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '网络异常，请检查网络连接'
    }
    
    // 显示错误消息
    ElMessage.error(errorMessage)
    
    return Promise.reject(error)
  }
)

export default request
