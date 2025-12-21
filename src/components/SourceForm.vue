<template>
  <div class="source-form-container">
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑信息源' : '添加信息源'"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @update:model-value="handleDialogClose"
    >
      <!-- AI辅助添加 -->
      <div v-if="!isEdit" class="ai-assistant-section">
        <el-input
          v-model="aiInput"
          placeholder="请输入信息源的名称，例如：'GitHub' 或 'GitHub https://github.com'"
          type="textarea"
          :rows="1"
          clearable
        />
        <div class="ai-button-group">
          <el-button
            type="primary"
            @click="generateInfoByAI"
            :loading="isGenerating"
            icon="MagicStick"
            size="small"
          >
            {{ isGenerating ? '生成中...' : 'AI生成详细信息' }}
          </el-button>
          <div class="ai-hint">AI将自动生成标签、分类、描述等信息</div>
        </div>
        <el-divider />
      </div>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        label-width="120px"
      >
        <!-- 名称 -->
        <el-form-item label="信息源名称" prop="name" size="small">
          <el-input
            v-model="formData.name"
            placeholder="请输入信息源名称"
            clearable
            size="small"
          />
        </el-form-item>

        <!-- URL -->
        <el-form-item label="信息源链接" prop="url" size="small">
          <el-input
            v-model="formData.url"
            placeholder="请输入信息源链接"
            clearable
            prefix-icon="Link"
            size="small"
          />
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="描述信息" size="small">
          <el-input
            v-model="formData.description"
            placeholder="请输入描述信息"
            type="textarea"
            :rows="2"
            size="small"
          />
        </el-form-item>

        <!-- 分类 -->
        <el-form-item label="分类标签" prop="category" size="small">
          <el-select
            v-model="formData.category"
            placeholder="请选择分类"
            clearable
            @change="handleCategoryChange"
            size="small"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
            <el-option
              label="+ 新建分类"
              value="__new__"
            />
          </el-select>
          
          <!-- 新建分类输入框 -->
          <el-input
            v-if="showNewCategoryInput"
            v-model="newCategory"
            placeholder="请输入新分类名称"
            class="new-category-input"
            @keyup.enter="handleAddNewCategory"
            @blur="handleAddNewCategory"
            ref="newCategoryRef"
            size="small"
          />
        </el-form-item>

        <!-- 标签 -->
        <el-form-item label="标签" size="small">
          <el-select
            v-model="formData.tags"
            multiple
            placeholder="请输入标签"
            filterable
            allow-create
            default-first-option
            size="small"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          <div class="tags-hint">提示：输入标签后按Enter键添加</div>
        </el-form-item>


      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
            {{ isEdit ? '保存' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick } from '@element-plus/icons-vue'
import { createSource, updateSource } from '../api/sourceApi.js'
import { generateSourceInfo } from '../api/qwenApi.js'

// Props
const props = defineProps({
  // 控制对话框显示
  visible: {
    type: Boolean,
    default: false
  },
  // 编辑模式下的信息源数据
  source: {
    type: Object,
    default: null
  },
  // 可选分类列表
  categories: {
    type: Array,
    default: () => []
  },
  // 所有已有的标签
  allTags: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:visible', 'success', 'cancel'])

// 表单引用
const formRef = ref(null)
const newCategoryRef = ref(null)

// 状态管理
const dialogVisible = ref(props.visible)
const isEdit = ref(!!props.source)
const isSubmitting = ref(false)
const showNewCategoryInput = ref(false)
const newCategory = ref('')
// AI辅助添加相关状态
const aiInput = ref('')
const isGenerating = ref(false)

// 表单数据
const formData = ref({
  name: '',
  url: '',
  description: '',
  category: '',
  tags: [],
  icon: ''
})

// 表单验证规则（简化版，仅验证必填项）
const formRules = ref({
  name: [
    { required: true, message: '请输入信息源名称', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入信息源链接', trigger: 'blur' }
  ]
})

// 监听对话框显示状态
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
      resetForm()
    }
  }
)

// 监听编辑数据变化
watch(
  () => props.source,
  (newVal) => {
    isEdit.value = !!newVal
    if (newVal) {
      resetForm(newVal)
    }
  },
  { deep: true }
)

// 重置表单
const resetForm = (source = null) => {
  if (source) {
    // 编辑模式，填充现有数据
    formData.value = {
      name: source.name || '',
      url: source.url || '',
      description: source.description || '',
      category: source.category || '',
      tags: [...(source.tags || [])],
      icon: source.icon || ''
    }
  } else {
    // 添加模式，清空表单
    formData.value = {
      name: '',
      url: '',
      description: '',
      category: '',
      tags: [],
      icon: ''
    }
  }
  showNewCategoryInput.value = false
  newCategory.value = ''
}

// 处理分类变化
const handleCategoryChange = (value) => {
  if (value === '__new__') {
    showNewCategoryInput.value = true
    setTimeout(() => {
      newCategoryRef.value?.focus()
    }, 100)
  } else {
    showNewCategoryInput.value = false
  }
}

// 添加新分类
const handleAddNewCategory = () => {
  if (newCategory.value.trim()) {
    const category = newCategory.value.trim()
    // 检查分类是否已存在
    if (!props.categories.includes(category)) {
      formData.value.category = category
    }
    showNewCategoryInput.value = false
    newCategory.value = ''
  } else {
    formData.value.category = ''
    showNewCategoryInput.value = false
  }
}

// 处理对话框关闭事件
const handleDialogClose = (newVisible) => {
  console.log('对话框关闭事件触发，新状态:', newVisible)
  dialogVisible.value = newVisible
  emit('update:visible', newVisible)
}

// AI生成信息源详细信息
const generateInfoByAI = async () => {
  if (!aiInput.value.trim()) {
    ElMessage.warning('请输入信息源的名称')
    return
  }
  
  isGenerating.value = true
  
  try {
    // 调用阿里Qwen大模型API生成详细信息
    const response = await generateSourceInfo(aiInput.value)
    
    // 填充表单数据
    formData.value = {
      ...formData.value,
      ...response.data
    }
    
    ElMessage.success('AI生成信息成功，请确认后提交')
  } catch (error) {
    console.error('AI生成信息失败:', error)
    ElMessage.error('AI生成信息失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    isSubmitting.value = true
    
    let response
    
    if (isEdit.value && props.source) {
      // 编辑模式
      response = await updateSource(props.source.id, formData.value)
    } else {
      // 添加模式
      response = await createSource(formData.value)
    }
    
    // 提交成功
    emit('success', response.data)
    handleCancel()
    
    ElMessage.success(isEdit.value ? '保存成功' : '添加成功')
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '保存失败' : '添加失败')
  } finally {
    isSubmitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.source-form-container {
  width: 100%;
}

/* 表单容器 */
.el-dialog__body {
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
}

/* AI辅助添加样式 */
.ai-assistant-section {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.ai-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-button-group {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-hint {
  font-size: 11px;
  color: #909399;
  font-style: italic;
}

/* 表单样式 */
.el-form {
  background: white;
  border-radius: 6px;
}

.el-form-item {
  margin-bottom: 12px;
}

.el-form-item__label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
}

/* 输入框样式 */
.el-input__wrapper {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s ease;
  box-shadow: none;
}

.el-input__wrapper:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 多行文本框 */
:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s ease;
  box-shadow: none;
}

:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 选择器样式 */
:deep(.el-select__wrapper) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s ease;
  box-shadow: none;
}

:deep(.el-select__wrapper:focus-within) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 新建分类输入框 */
.new-category-input {
  margin-top: 6px;
  width: 100%;
  max-width: 180px;
}

/* 标签提示 */
.tags-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #909399;
  font-style: italic;
}

/* 对话框底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
  border-radius: 0 0 8px 8px;
}

/* 按钮样式 */
:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.2s ease;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

:deep(.el-button--primary) {
  background: white;
  border: 1px solid #409eff;
  color: #409eff;
}

:deep(.el-button--primary:hover) {
  background: #ecf5ff;
  border-color: #66b1ff;
  color: #409eff;
  transform: none;
  box-shadow: none;
}

:deep(.el-button--default:hover) {
  background: #f5f7fa;
  border-color: #c6e2ff;
  color: #409eff;
}

/* AI生成按钮 */
:deep(.el-button--primary:disabled) {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  transform: none;
  box-shadow: none;
}

/* 分割线样式 */
:deep(.el-divider) {
  margin: 12px 0;
  background: #e4e7ed;
  height: 1px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-dialog {
    width: 95% !important;
    margin: 0 auto;
    top: 10%;
  }
  
  .el-dialog__body {
    padding: 16px;
  }
  
  .ai-button-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }
  
  .new-category-input {
    max-width: 100%;
  }
}
</style>
