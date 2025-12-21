import { Op } from 'sequelize'
import Source from '../models/sourceModel.js'

// 获取所有信息源（支持分页、搜索、分类过滤）
export const getAllSources = async (req, res) => {
  try {
    // 解析查询参数
    const {
      page = 1,
      pageSize = 10,
      search = '',
      category = ''
    } = req.query
    
    // 计算偏移量
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    
    // 构建查询条件
    const where = {}
    
    // 搜索条件
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } } // 标签搜索
      ]
    }
    
    // 分类过滤（支持多分类）
    if (category) {
      const categories = Array.isArray(category) ? category : [category]
      where.category = { [Op.in]: categories }
    }
    
    // 执行查询
    const [sources, total] = await Promise.all([
      Source.findAll({
        where,
        limit: parseInt(pageSize),
        offset,
        order: [['created_at', 'DESC']] // 按创建时间降序排序
      }),
      Source.count({ where })
    ])
    
    // 计算总页数
    const totalPages = Math.ceil(total / parseInt(pageSize))
    
    // 返回结果
    res.json({
      success: true,
      data: {
        sources,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages
        }
      }
    })
  } catch (error) {
    console.error('获取信息源失败:', error)
    res.status(500).json({ success: false, message: '获取信息源失败', error: error.message })
  }
}

// 获取单个信息源
export const getSourceById = async (req, res) => {
  try {
    const id = req.params.id
    const source = await Source.findByPk(id)
    
    if (!source) {
      return res.status(404).json({ success: false, message: '信息源未找到' })
    }
    
    res.json({ success: true, data: source })
  } catch (error) {
    console.error('获取信息源失败:', error)
    res.status(500).json({ success: false, message: '获取信息源失败', error: error.message })
  }
}

// 创建信息源
export const createSource = async (req, res) => {
  try {
    const newSource = await Source.create(req.body)
    res.status(201).json({ success: true, data: newSource, message: '信息源创建成功' })
  } catch (error) {
    console.error('创建信息源失败:', error)
    res.status(500).json({ success: false, message: '创建信息源失败', error: error.message })
  }
}

// 更新信息源
export const updateSource = async (req, res) => {
  try {
    const id = req.params.id
    const [updated] = await Source.update(req.body, {
      where: { id: id },
      returning: true // 返回更新后的记录
    })
    
    if (updated === 0) {
      return res.status(404).json({ success: false, message: '信息源未找到' })
    }
    
    const updatedSource = await Source.findByPk(id)
    res.json({ success: true, data: updatedSource, message: '信息源更新成功' })
  } catch (error) {
    console.error('更新信息源失败:', error)
    res.status(500).json({ success: false, message: '更新信息源失败', error: error.message })
  }
}

// 删除信息源
export const deleteSource = async (req, res) => {
  try {
    const id = req.params.id
    const deleted = await Source.destroy({
      where: { id: id }
    })
    
    if (deleted === 0) {
      return res.status(404).json({ success: false, message: '信息源未找到' })
    }
    
    res.json({ success: true, message: '信息源删除成功' })
  } catch (error) {
    console.error('删除信息源失败:', error)
    res.status(500).json({ success: false, message: '删除信息源失败', error: error.message })
  }
}
