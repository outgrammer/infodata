<template>
  <div class="source-list-container">
    <!-- 标题和搜索区域 -->
    <div class="title-search-container">
      <!-- 左侧欢迎信息 -->
      <div class="welcome-section">
        <div class="welcome-icon">
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </div>
        <span class="welcome-text">Hi, Infodata</span>
      </div>
      
      <!-- 中间搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="按名称、描述或标签搜索"
          clearable
          class="search-input"
          @input="handleSearch"
          :prefix-icon="Search"
        >
        </el-input>
      </div>
      
      <!-- 右侧添加按钮 -->
      <div class="right-actions">
        <el-button
          type="primary"
          class="add-button"
          @click="handleAddSource"
        >
          添加信息源
        </el-button>
      </div>
    </div>
    
    <!-- 分类标签栏 -->
    <div class="category-tags-section" v-if="categories.length > 0">
      <div 
        v-for="category in categories" 
        :key="category"
        class="category-tag"
        :class="{ 'active': selectedCategories.includes(category) }"
        @click="toggleCategory(category)"
      >
        {{ category }}
      </div>
      <div 
        class="category-tag all" 
        :class="{ 'active': selectedCategories.length === 0 }"
        @click="clearCategories"
      >
        全部
      </div>
    </div>
    
    <!-- 搜索结果统计 -->
    <div class="search-result-count" v-if="searchQuery || selectedCategories.length > 0">
      找到 {{ filteredSources.length }} 个结果
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
    
    <!-- 信息源列表 -->
    <div class="source-cards">
      <el-card
        v-for="source in filteredSources"
        :key="source.id"
        class="source-card"
        :body-style="{ padding: '20px' }"
        @click="openSource(source.url)"
      >
        <!-- 卡片内容 -->
        <div class="card-content">
          <!-- 图标和名称 -->
        <div class="source-header">
          <div class="source-icon" v-if="source.icon">
            <el-image
              :src="source.icon"
              :alt="source.name"
              fit="cover"
              :width="48"
              :height="48"
            />
          </div>
          <div class="source-icon default-icon" v-else>
            <el-icon class="el-icon--large"><Document /></el-icon>
          </div>
          <h3 class="source-name" v-html="highlightText(source.name, searchQuery)"></h3>
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            size="small"
            icon="Edit"
            @click.stop="handleEditSource(source)"
            class="edit-button"
          >
            编辑
          </el-button>
        </div>
          
          <!-- 描述 -->
          <p class="source-description" v-if="source.description" v-html="highlightText(source.description, searchQuery)">
          </p>
          <p class="source-description empty" v-else>
            暂无描述
          </p>
          
          <!-- 分类和标签 -->
          <div class="source-footer">
            <el-tag v-if="source.category" type="primary" class="category-tag">
              {{ source.category }}
            </el-tag>
            <div class="tags-container" v-if="source.tags && source.tags.length > 0">
              <el-tag
                v-for="tag in source.tags"
                :key="tag"
                size="small"
                effect="plain"
                class="source-tag"
                v-html="highlightText(tag, searchQuery)"
              >
              </el-tag>
            </div>
          </div>
          
          <!-- 链接提示 -->
          <div class="source-link-hint">
            <el-icon><Link /></el-icon>
            <span>点击打开链接</span>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-if="filteredSources.length === 0">
      <el-empty>
        <template #description>
          <span class="empty-text">暂无匹配的信息源</span>
        </template>
        <el-button type="primary" @click="resetFilters">重置筛选</el-button>
      </el-empty>
    </div>
    
    <!-- 底部管理链接 -->
    <div class="admin-link-container">
      <router-link to="/admin" class="admin-link">信息源管理</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Document, Link, InfoFilled } from '@element-plus/icons-vue'
import { getAllSources } from '../api/sourceApi.js'
import SourceForm from './SourceForm.vue'

// 状态管理
const searchQuery = ref('')
const selectedCategories = ref([]) // 多分类筛选
const sources = ref([])
const categories = ref([])
const isLoading = ref(false)
const showSourceForm = ref(false)
const editingSource = ref(null)
const allTags = ref([])

// 高亮匹配的文本
const highlightText = (text, query) => {
  if (!query || !text) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 计算属性：过滤后的信息源列表
const filteredSources = computed(() => {
  let result = [...sources.value]
  
  // 按多分类筛选
  if (selectedCategories.value.length > 0) {
    result = result.filter(source => 
      selectedCategories.value.includes(source.category)
    )
  }
  
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

// 切换分类
const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    // 已选中，移除
    selectedCategories.value.splice(index, 1)
  } else {
    // 未选中，添加
    selectedCategories.value.push(category)
  }
}

// 清除所有分类
const clearCategories = () => {
  selectedCategories.value = []
}

// 打开信息源链接
const openSource = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategories.value = []
}

// 添加信息源
const handleAddSource = () => {
  editingSource.value = null
  showSourceForm.value = true
}

// 编辑信息源
const handleEditSource = (source) => {
  editingSource.value = source
  showSourceForm.value = true
}

// 信息源操作成功
const handleSourceSuccess = () => {
  // 重新获取数据
  fetchSources()
}

// 取消信息源操作
const handleSourceCancel = () => {
  editingSource.value = null
  showSourceForm.value = false
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSources()
})
</script>

<style scoped>
/* 全局容器 */
.source-list-container {
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: transparent;
  min-height: auto;
}

/* 标题和搜索容器 - Polymarket风格 */
.title-search-container {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
  background: transparent;
  padding: 5px 0;
  border-radius: 0;
  box-shadow: none;
  justify-content: flex-start;
  flex-wrap: wrap;
}

/* 欢迎信息样式 */
.welcome-section {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.info-icon) {
  font-size: 20px;
  color: #1a1a1a;
  font-weight: bold;
}

.welcome-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0;
}

.search-container {
  flex: 1;
  max-width: 550px;
  min-width: 180px;
}

:deep(.search-input) {
  width: 100%;
  border-radius: 30px !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 14px !important;
  transition: all 0.2s ease !important;
  box-sizing: border-box !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.search-input:hover) {
  border: none !important;
  background: transparent !important;
}

:deep(.search-input:focus-within) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper) {
  border-radius: 30px !important;
  border: 1px solid #e5e5e5 !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: #d0d0d0 !important;
  background: #fafafa !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #000000 !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-input__inner) {
  border-radius: 30px !important;
  border: none !important;
  background: transparent !important;
  padding: 10px 15px !important;
  font-size: 14px !important;
  color: #1a1a1a !important;
  line-height: 1.5 !important;
}

:deep(.el-input__prefix),
:deep(.el-input__suffix) {
  padding: 0 8px !important;
}

:deep(.el-input__suffix-inner) {
  padding-right: 5px !important;
}

:deep(.el-icon) {
  color: #666666 !important;
  font-size: 16px !important;
}

.right-actions {
  flex-shrink: 0;
}

/* 分类标签栏 - Polymarket风格 */
.category-tags-section {
  display: flex;
  gap: 18px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.category-tag {
  padding: 8px 0;
  border-radius: 0;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: none;
  position: relative;
}

.category-tag:hover {
  background: transparent;
  color: #1a1a1a;
}

.category-tag.active {
  background: transparent;
  color: #1a1a1a;
  font-weight: 600;
}

.category-tag.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1a1a1a;
  border-radius: 2px;
}

.category-tag.all {
  background: transparent;
  color: #666;
  border: none;
}

.category-tag.all:hover {
  background: transparent;
  color: #1a1a1a;
}

.category-tag.all.active {
  background: transparent;
  color: #1a1a1a;
  border: none;
}

.category-tag.all.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1a1a1a;
  border-radius: 2px;
}

:deep(.add-button) {
  white-space: nowrap;
  border-radius: 0;
  font-weight: 500;
  padding: 4px 12px;
  font-size: 13px;
  line-height: 1.5;
  min-width: auto;
  background: transparent;
  border: none;
  color: #909399;
  transition: all 0.2s ease;
  box-shadow: none;
  text-transform: none;
  letter-spacing: 0;
}

:deep(.add-button:hover) {
  background: transparent;
  border: none;
  color: #409eff;
  box-shadow: none;
  transform: none;
}

:deep(.refresh-button) {
  display: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.5;
  min-width: auto;
}

/* 搜索结果统计 */
.search-result-count {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

/* 信息源卡片列表 */
.source-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* 信息源卡片 */
.source-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  background: white;
  overflow: hidden;
  height: fit-content;
}

.source-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

/* 信息源头部 */
.source-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

/* 隐藏图标显示 */
.source-icon,
.default-icon {
  display: none;
}

/* 编辑按钮 - 极简风格 - 目前隐藏 */
:deep(.edit-button) {
  display: none;
  margin-left: auto;
  border-radius: 6px;
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  line-height: 1.5;
  background-color: #f5f7fa;
  color: #606266;
  transition: all 0.2s ease;
  min-width: auto;
  white-space: nowrap;
}

:deep(.edit-button:hover) {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.source-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 信息源描述 */
.source-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.source-description.empty {
  color: #c0c4cc;
  font-style: italic;
}

/* 信息源底部 */
.source-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  flex-wrap: wrap;
}

/* 分类标签 - 极简风格 */
.category-tag {
  background-color: #f0f2f5;
  color: #606266;
  border: 1px solid #dcdfe6;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  line-height: 1.3;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-tag:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  flex: 1;
}

.source-tag {
  margin: 0;
  font-size: 10px;
  border-radius: 8px;
  background: #f0f2f5;
  border: none;
  color: #606266;
  padding: 1px 6px;
  line-height: 1.4;
}

/* 链接提示 */
.source-link-hint {
  display: none;
}

/* 描述下方横虚线 */
.source-description {
  position: relative;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.source-description::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: #f0f2f5;
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

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .source-list-container {
    padding: 0;
  }
  
  .title-search-container {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .source-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (min-width: 768px) {
    .source-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1200px) {
    .source-cards {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .source-header {
    flex-direction: row;
    align-items: center;
  }
  
  .edit-button {
    margin-left: auto;
    align-self: center;
  }
  
  .page-title {
    font-size: 24px;
  }
}

/* 底部管理链接样式 */
.admin-link-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 16px 0;
  border-top: 1px solid #f0f2f5;
}

.admin-link {
  font-size: 13px;
  color: #909399;
  text-decoration: none;
  transition: color 0.2s ease;
}

.admin-link:hover {
  color: #409eff;
  text-decoration: underline;
}

/* 响应式调整管理链接 */
@media (max-width: 768px) {
  .admin-link-container {
    margin-top: 24px;
    padding: 12px 0;
  }
}
</style>
