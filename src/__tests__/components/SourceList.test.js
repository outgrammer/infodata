import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceList from '@/components/SourceList.vue'
import { getAllSources } from '@/api/sourceApi.js'
import { ElMessage } from 'element-plus'

// 模拟API调用
vi.mock('@/api/sourceApi.js', () => ({
  getAllSources: vi.fn()
}))

// 模拟ElMessage
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

describe('SourceList组件', () => {
  const mockSources = [
    {
      id: 1,
      name: 'GitHub',
      url: 'https://github.com',
      description: '开源代码托管平台',
      category: '开发工具',
      tags: ['开源', '代码', '开发'],
      icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      createdAt: '2025-12-01T10:00:00Z',
      updatedAt: '2025-12-01T10:00:00Z'
    },
    {
      id: 2,
      name: 'Vue.js',
      url: 'https://vuejs.org',
      description: '渐进式JavaScript框架',
      category: '开发框架',
      tags: ['Vue', 'JavaScript', '框架'],
      icon: 'https://vuejs.org/images/logo.png',
      createdAt: '2025-12-02T10:00:00Z',
      updatedAt: '2025-12-02T10:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确初始化组件', () => {
    const wrapper = mount(SourceList)
    expect(wrapper.exists()).toBe(true)
  })

  it('应该在组件挂载时调用getAllSources', async () => {
    // 模拟API返回数据
    getAllSources.mockResolvedValue({
      data: {
        sources: mockSources,
        total: 2,
        page: 1,
        pageSize: 10
      }
    })

    const wrapper = mount(SourceList)
    
    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    
    // 检查是否调用了API
    expect(getAllSources).toHaveBeenCalled()
  })

  it('应该在API调用失败时设置空状态', async () => {
    // 模拟API调用失败
    getAllSources.mockRejectedValue(new Error('获取信息源失败'))

    const wrapper = mount(SourceList)

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // 检查是否显示了空状态
    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
  })

  it('应该正确过滤信息源', async () => {
    // 模拟API返回数据
    getAllSources.mockResolvedValue({
      data: {
        sources: mockSources,
        total: 2,
        page: 1,
        pageSize: 10
      }
    })

    const wrapper = mount(SourceList)

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // 直接测试过滤逻辑
    wrapper.vm.searchQuery = 'GitHub'
    await wrapper.vm.$nextTick()
    
    // 检查过滤结果
    expect(wrapper.vm.filteredSources.length).toBe(1)
    expect(wrapper.vm.filteredSources[0].name).toBe('GitHub')
  })
})
