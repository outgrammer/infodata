import axios from 'axios'

// 阿里Qwen API配置
const QWEN_API_CONFIG = {
  apiKey: 'sk-622369d71e2b4c0f87a221c01178dd4c',
  // 使用OpenAI兼容端点，支持更广泛的模型和更稳定的接口
  endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
}

/**
 * 调用阿里Qwen大模型API生成信息源详细信息
 * @param {string} input - 用户输入的基本信息
 * @returns {Promise} - 返回Promise对象
 */
export const generateSourceInfo = async (input) => {
  try {
    // 调用阿里Qwen大模型API - 使用OpenAI兼容格式
    console.log('开始调用Qwen API，输入:', input)
    const response = await axios.post(
      QWEN_API_CONFIG.endpoint,
      {
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个信息源分类专家，负责根据基本信息生成详细的信息源描述、分类和标签。要求详细描述简短精炼，分类限制最多5个字，标签最多3个。检查识别信息源链接是否正常，若链接无效则提示用户输入正确链接。'
          },
          {
            role: 'user',
            content: `请根据以下信息源的基本信息，生成详细的描述、分类和标签。\n\n基本信息：${input}\n\n请按照以下格式输出，只返回JSON格式，不要添加任何解释：\n{\n  "name": "信息源名称",\n  "url": "信息源链接",\n  "description": "详细描述",\n  "category": "分类",\n  "tags": ["标签1", "标签2"]\n}`
          }
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 1024,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_CONFIG.apiKey}`
        }
      }
    )
    
    // 打印完整响应，用于调试
    console.log('Qwen API完整响应:', response)
    console.log('Qwen API响应状态:', response.status)
    console.log('Qwen API响应数据:', response.data)
    
    // 解析API响应 - 兼容不同的响应格式
    let result = ''
    if (response.data.output?.text) {
      // 原始格式
      result = response.data.output.text
      console.log('使用原始格式解析结果:', result)
    } else if (response.data.choices?.[0]?.message?.content) {
      // OpenAI兼容格式
      result = response.data.choices[0].message.content
      console.log('使用OpenAI兼容格式解析结果:', result)
    } else if (response.data.result) {
      // 其他可能的格式
      result = response.data.result
      console.log('使用其他格式解析结果:', result)
    } else {
      // 无法解析格式
      console.error('无法识别的Qwen API响应格式:', response.data)
    }
    
    // 尝试解析JSON格式的结果
    let parsedResult
    try {
      parsedResult = JSON.parse(result)
      console.log('解析后的AI结果:', parsedResult)
    } catch (error) {
      console.error('解析AI生成结果失败:', error)
      console.error('原始AI输出:', result)
      // 如果解析失败，使用默认结果
      parsedResult = {
        name: input.split(' ')[0] || '未知名称',
        url: input.match(/https?:\/\/[^\s]+/)?.[0] || '',
        description: `这是一个关于${input.split(' ')[0]}的信息源，提供相关的资源和服务。`,
        category: 'AI生成分类',
        tags: ['AI生成', input.split(' ')[0] || '未知']
      }
    }
    
    return { data: parsedResult }
  } catch (error) {
    console.error('调用Qwen API失败:', error)
    console.error('错误详情:', error.response?.data || error.message || error)
    if (error.response) {
      console.error('错误响应状态:', error.response.status)
      console.error('错误响应头:', error.response.headers)
      console.error('错误响应数据:', error.response.data)
    }
    // 出错时返回模拟数据
    return {
      data: {
        name: input.split(' ')[0] || '未知名称',
        url: input.match(/https?:\/\/[^\s]+/)?.[0] || '',
        description: `这是一个关于${input.split(' ')[0]}的信息源，提供相关的资源和服务。`,
        category: 'AI生成分类',
        tags: ['AI生成', input.split(' ')[0] || '未知']
      }
    }
  }
}

/**
 * 配置阿里Qwen大模型API
 * @param {Object} config - API配置信息
 * @param {string} config.apiKey - API密钥
 * @param {string} config.apiSecret - API密钥
 * @param {string} config.endpoint - API端点
 */
export const configureQwenApi = (config) => {
  // 更新API配置
  if (config.apiKey) {
    QWEN_API_CONFIG.apiKey = config.apiKey
  }
  if (config.endpoint) {
    QWEN_API_CONFIG.endpoint = config.endpoint
  }
  console.log('阿里Qwen API配置已更新:', QWEN_API_CONFIG)
}
