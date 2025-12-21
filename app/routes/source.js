import express from 'express'
import { 
  getAllSources, 
  getSourceById, 
  createSource, 
  updateSource, 
  deleteSource 
} from '../controllers/sourceController.js'
import { validate, sourceValidationRules } from '../middleware/validate.js'

const router = express.Router()

router.get('/sources', getAllSources)
router.get('/sources/:id', getSourceById)
router.post('/sources', validate(sourceValidationRules), createSource)
router.put('/sources/:id', validate(sourceValidationRules), updateSource)
router.delete('/sources/:id', deleteSource)

export default router
