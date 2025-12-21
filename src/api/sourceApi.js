import request from '../utils/request.js'

/**
 * 获取所有信息源（支持分页、搜索、分类过滤）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.search - 搜索关键词
 * @param {string} params.category - 分类筛选
 * @param {boolean} params.showLoading - 是否显示加载状态（默认true）
 * @returns {Promise} - 返回Promise对象
 */
export const getAllSources = (params = {}, showLoading = true) => {
  return request.get('/sources', {
    params,
    showLoading
  })
}

/**
 * 获取单个信息源详情
 * @param {number|string} id - 信息源ID
 * @param {boolean} showLoading - 是否显示加载状态（默认true）
 * @returns {Promise} - 返回Promise对象
 */
export const getSourceById = (id, showLoading = true) => {
  return request.get(`/sources/${id}`, {
    showLoading
  })
}

/**
 * 创建新信息源
 * @param {Object} data - 信息源数据
 * @param {string} data.name - 信息源名称
 * @param {string} data.url - 信息源链接
 * @param {string} data.description - 描述信息
 * @param {string} data.category - 分类标签
 * @param {Array} data.tags - 标签数组
 * @param {string} data.icon - 图标链接
 * @param {boolean} showLoading - 是否显示加载状态（默认true）
 * @returns {Promise} - 返回Promise对象
 */
export const createSource = (data, showLoading = true) => {
  return request.post('/sources', data, {
    showLoading
  })
}

/**
 * 更新信息源
 * @param {number|string} id - 信息源ID
 * @param {Object} data - 信息源数据
 * @param {boolean} showLoading - 是否显示加载状态（默认true）
 * @returns {Promise} - 返回Promise对象
 */
export const updateSource = (id, data, showLoading = true) => {
  return request.put(`/sources/${id}`, data, {
    showLoading
  })
}

/**
 * 删除信息源
 * @param {number|string} id - 信息源ID
 * @param {boolean} showLoading - 是否显示加载状态（默认true）
 * @returns {Promise} - 返回Promise对象
 */
export const deleteSource = (id, showLoading = true) => {
  return request.delete(`/sources/${id}`, {
    showLoading
  })
}

// 统一导出所有API
export default {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource
}
