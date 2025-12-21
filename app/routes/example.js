import express from 'express'
import { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem 
} from '../controllers/exampleController.js'

const router = express.Router()

// 定义示例路由
router.get('/items', getAllItems)
router.get('/items/:id', getItemById)
router.post('/items', createItem)
router.put('/items/:id', updateItem)
router.delete('/items/:id', deleteItem)

export default router
