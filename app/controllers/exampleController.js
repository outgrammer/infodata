// 示例控制器，实现基本的CRUD操作

// 模拟数据
let items = [
  { id: 1, name: 'Item 1', description: 'First item' },
  { id: 2, name: 'Item 2', description: 'Second item' },
  { id: 3, name: 'Item 3', description: 'Third item' }
]

// 获取所有项目
export const getAllItems = (req, res) => {
  res.json({ success: true, data: items })
}

// 获取单个项目
export const getItemById = (req, res) => {
  const id = parseInt(req.params.id)
  const item = items.find(item => item.id === id)
  
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' })
  }
  
  res.json({ success: true, data: item })
}

// 创建新项目
export const createItem = (req, res) => {
  const newItem = {
    id: items.length + 1,
    ...req.body
  }
  
  items.push(newItem)
  res.status(201).json({ success: true, data: newItem, message: 'Item created successfully' })
}

// 更新项目
export const updateItem = (req, res) => {
  const id = parseInt(req.params.id)
  const index = items.findIndex(item => item.id === id)
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' })
  }
  
  items[index] = {
    ...items[index],
    ...req.body
  }
  
  res.json({ success: true, data: items[index], message: 'Item updated successfully' })
}

// 删除项目
export const deleteItem = (req, res) => {
  const id = parseInt(req.params.id)
  const index = items.findIndex(item => item.id === id)
  
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' })
  }
  
  items.splice(index, 1)
  res.json({ success: true, message: 'Item deleted successfully' })
}
