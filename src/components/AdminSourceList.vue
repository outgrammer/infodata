<template>
  <div class="source-list-container">
    <!-- 页面标题 -->
    <h1 class="page-title">信息源管理</h1>
    <p class="page-subtitle">管理所有信息源，支持修改和删除操作</p>
    
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <!-- 搜索框 -->
      <el-input
        v-model="searchQuery"
        placeholder="按名称、描述或标签搜索"
        clearable
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <!-- 搜索结果统计 -->
      <div class="search-result-count" v-if="searchQuery">
        找到 {{ filteredSources.length }} 个结果
      </div>
    </div>
    
    <!-- 信息源列表 -->
    <div class="admin-source-list">
      <el-table
        :data="filteredSources"
        style="width: 100%"
        border
        :header-cell-style="{ background: '#fafafa', fontWeight: '600' }"
        :row-style="{ cursor: 'pointer' }"
      >
        <el-table-column prop="name" label="信息源名称" min-width="120">
          <template #default="scope">
            <div class="source-name" v-html="highlightText(scope.row.name, searchQuery)"></div>
          </template>
        </el-table-column>
        
        <el-table-column prop="url" label="链接" min-width="200">
          <template #default="scope">
            <a :href="scope.row.url" target="_blank" rel="noopener noreferrer" class="source-url">
              {{ scope.row.url }}
            </a>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" min-width="250">
          <template #default="scope">
            <div class="source-description" v-html="highlightText(scope.row.description, searchQuery)"></div>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.category" class="category-tag">
              {{ scope.row.category }}
            </el-tag>
            <span v-else class="empty-text">无</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="tags" label="标签" min-width="180">
          <template #default="scope">
            <div class="tags-container">
              <el-tag
                  v-for="tag in scope.row.tags"
                  :key="tag"
                  size="small"
                  effect="plain"
                  class="source-tag"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="!scope.row.tags || scope.row.tags.length === 0" class="empty-text">无</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="105">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="handleEditSource(scope.row)"
              style="margin-right: 8px;"
            >
              修改
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDeleteSource(scope.row)"
              :loading="deletingIds.has(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-if="filteredSources.length === 0">
      <el-empty
        description="
          <span class='empty-text'>
            暂无信息源
          </span>
        "
      >
        <el-button type="primary" @click="fetchSources">刷新数据</el-button>
      </el-empty>
    </div>
    
    <!-- 信息源表单组件 -->
    <SourceForm
      v-model:visible="showSourceForm"
      :source="editingSource"
      :categories="categories"
      :all-tags="allTags"
      @success="handleSourceSuccess"
      @cancel="handleSourceCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Delete, Edit } from '@element-plus/icons-vue'
import { getAllSources, deleteSource } from '../api/sourceApi.js'
import { ElMessage } from 'element-plus'
import SourceForm from './SourceForm.vue'

// 状态管理
const searchQuery = ref('')
const sources = ref([])
const isLoading = ref(false)
const deletingIds = ref(new Set()) // 用于跟踪正在删除的项目
const showSourceForm = ref(false)
const editingSource = ref(null)
const categories = ref([])
const allTags = ref([])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 高亮匹配的文本
const highlightText = (text, query) => {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 计算属性：过滤后的信息源列表
const filteredSources = computed(() => {
  let result = [...sources.value]
  
  // 按名称、描述或标签搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(source => {
      // 名称匹配
      const nameMatch = source.name.toLowerCase().includes(query)
      
      // 描述匹配
      const descriptionMatch = source.description && source.description.toLowerCase().includes(query)
      
      // 标签匹配
      const tagMatch = source.tags && Array.isArray(source.tags) && 
        source.tags.some(tag => tag.toLowerCase().includes(query))
      
      return nameMatch || descriptionMatch || tagMatch
    })
  }
  
  return result
})

// 获取所有信息源
const fetchSources = async () => {
  isLoading.value = true
  try {
    // 调用真实API获取信息源数据，传递大pageSize获取所有数据
    const response = await getAllSources({ pageSize: 9999 })
    sources.value = response.data?.sources || []
    
    // 提取所有分类和标签
    extractCategoriesAndTags()
  } catch (error) {
    console.error('获取信息源失败:', error)
    ElMessage.error('获取信息源失败')
  } finally {
    isLoading.value = false
  }
}

// 提取所有分类和标签
const extractCategoriesAndTags = () => {
  // 提取分类
  const categorySet = new Set()
  // 提取标签
  const tagSet = new Set()
  
  sources.value.forEach(source => {
    // 处理分类
    if (source.category) {
      categorySet.add(source.category)
    }
    
    // 处理标签
    if (source.tags && Array.isArray(source.tags)) {
      source.tags.forEach(tag => {
        tagSet.add(tag)
      })
    }
  })
  
  categories.value = Array.from(categorySet)
  allTags.value = Array.from(tagSet)
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

// 删除信息源
const handleDeleteSource = async (source) => {
  // 确认删除
  if (!confirm(`确定要删除信息源 "${source.name}" 吗？`)) {
    return
  }
  
  deletingIds.value.add(source.id)
  try {
    await deleteSource(source.id)
    ElMessage.success('信息源删除成功')
    // 从列表中移除
    sources.value = sources.value.filter(item => item.id !== source.id)
  } catch (error) {
    console.error('删除信息源失败:', error)
    ElMessage.error('删除信息源失败')
  } finally {
    deletingIds.value.delete(source.id)
  }
}

// 处理编辑信息源
const handleEditSource = (source) => {
  editingSource.value = source
  showSourceForm.value = true
}

// 信息源操作成功
const handleSourceSuccess = () => {
  // 重新获取数据
  fetchSources()
  ElMessage.success('信息源操作成功')
}

// 取消信息源操作
const handleSourceCancel = () => {
  showSourceForm.value = false
  editingSource.value = null
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSources()
})
</script>

<style scoped>
/* 全局容器 */
.source-list-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  background-color: #fafafa;
  min-height: 100vh;
}

/* 页面标题 */
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  text-align: center;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
  text-align: center;
}

/* 搜索和筛选区域 */
.search-filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.search-input {
  width: 400px; /* 固定搜索框大小，主流搜索框样式 */
}

/* 搜索结果统计 */
.search-result-count {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

/* 信息源列表 */
.admin-source-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  overflow: auto;
  max-height: calc(100vh - 200px);
}

/* 调整表格样式 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
  overflow-y: auto;
}

:deep(.el-table__header-wrapper) {
  overflow-x: auto;
}

/* 信息源名称 */
.source-name {
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
  display: inline-block;
}

/* 信息源描述 */
.source-description {
  font-size: 12px;
  line-height: 1.4;
  color: #606266;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 200px;
}

/* 链接样式 */
.source-url {
  font-size: 12px;
  color: #409eff;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 180px;
}

.source-url:hover {
  text-decoration: underline;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.source-tag {
  margin: 0;
  font-size: 11px;
  border-radius: 6px;
  background: #f0f2f5;
  border: none;
  color: #606266;
  padding: 1px 6px;
  line-height: 1.4;
}

/* 分类标签 - 极简风格 */
.category-tag {
  background-color: #f0f2f5;
  color: #606266;
  border: 1px solid #dcdfe6;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  line-height: 1.3;
  white-space: nowrap;
}

/* 高亮样式 */
.highlight {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  color: #2d3436;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(253, 203, 110, 0.3);
}

/* 空文本 */
.empty-text {
  color: #c0c4cc;
  font-style: italic;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .source-list-container {
    padding: 16px;
  }
  
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
