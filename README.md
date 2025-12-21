# 信息源门户系统

一个基于前后端分离架构的信息源管理系统，支持信息源的添加、编辑、搜索和分类管理，并提供AI辅助添加功能。

## 技术栈

### 前端
- Vue 3 + Composition API
- Vite 构建工具
- Element Plus UI 组件库
- Vue Router 路由管理
- Axios HTTP 请求处理

### 后端
- Node.js + Express 框架
- SQLite 数据库
- RESTful API 设计

## 项目结构

### 前端结构
```
src/
├── api/           # API 接口封装
│   ├── index.js
│   ├── qwenApi.js  # AI 辅助生成接口
│   └── sourceApi.js # 信息源管理接口
├── components/    # Vue 组件
│   ├── AdminSourceList.vue  # 信息源管理列表组件
│   ├── SourceForm.vue  # 信息源表单组件
│   └── SourceList.vue  # 信息源列表组件
├── router/        # 路由配置
│   └── index.js
├── utils/         # 工具函数
│   └── request.js  # Axios 配置
├── views/         # 页面视图
│   └── HomeView.vue  # 信息源展示首页
├── App.vue        # 根组件
├── main.js        # 入口文件
└── style.css      # 全局样式
```

### 后端结构
```
app/
├── controllers/   # 控制器
│   └── sourceController.js
├── middleware/    # 中间件
│   ├── errorHandler.js
│   └── validate.js
├── models/        # 数据模型
│   └── sourceModel.js
├── routes/        # 路由
│   ├── index.js
│   └── source.js
└── app.js         # 应用入口

config/
├── database.js    # 数据库配置
└── db_init.js     # 数据库初始化
```

## 功能特性

1. **信息源管理**
   - 信息源列表展示，支持一行显示4个卡片
   - 添加、编辑、删除信息源
   - 支持分类和标签管理
   - 信息源链接跳转功能
   - 信息源管理页面，提供批量管理功能
   - 底部极简风格管理入口链接

2. **高级搜索与过滤**
   - 多字段搜索（名称、描述、标签）
   - 多分类筛选
   - 搜索结果高亮显示
   - 搜索结果计数
   - 响应式设计，适配不同屏幕尺寸

3. **AI 辅助添加**
   - 输入信息源名称，AI 自动生成详细信息
   - 自动生成标签、分类、描述等

4. **响应式设计**
   - 适配 PC 和移动端
   - 简洁美观的 UI 设计
   - 一行显示4个信息源卡片
   - 响应式断点优化

5. **极简风格设计**
   - 去除冗余装饰
   - 聚焦核心功能
   - 良好的交互体验
   - 底部管理链接极简设计
   - 浅灰色字体，适应页面布局
   - 悬停效果优化

## 安装与运行

### 前端

1. 安装依赖
```bash
npm install
```

2. 开发模式运行
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

4. 重启服务
```bash
# 停止服务：按 Ctrl+C 终止当前运行的进程
# 重新启动服务
npm run dev
```

### 后端

1. 安装依赖
```bash
npm install
```

2. 开发模式运行
```bash
npm run server:dev
```

3. 生产模式运行
```bash
npm run server:start
```

4. 重启服务
```bash
# 停止服务：按 Ctrl+C 终止当前运行的进程
# 重新启动开发模式
npm run server:dev

# 或重新启动生产模式
npm run server:start
```

## API 接口说明

### 信息源管理

| 方法 | 路径 | 描述 |
| ---- | ---- | ---- |
| GET | /api/sources | 获取信息源列表（支持分页、搜索、分类过滤） |
| GET | /api/sources/:id | 获取单个信息源详情 |
| POST | /api/sources | 创建新信息源 |
| PUT | /api/sources/:id | 更新信息源 |
| DELETE | /api/sources/:id | 删除信息源 |

### AI 辅助生成

| 方法 | 路径 | 描述 |
| ---- | ---- | ---- |
| POST | /api/ai/generate | AI 生成信息源详细信息 |

## 配置说明

### 环境变量

创建 `.env.development` 和 `.env.production` 文件，配置以下环境变量：

```
# 前端 API 基础 URL
VITE_API_BASE_URL=http://localhost:3000/api

# AI 服务配置（可选）
VITE_AI_API_KEY=your_ai_api_key
```

### 数据库配置

数据库配置位于 `config/database.js`，默认使用 SQLite 数据库，数据文件位于 `data/infodata.db`。

## 路由配置

### 路由列表

| 路径 | 名称 | 组件 | 描述 |
| ---- | ---- | ---- | ---- |
| `/` | home | HomeView.vue | 信息源展示首页，显示所有信息源卡片 |
| `/admin` | admin | AdminSourceList.vue | 信息源管理页面，提供编辑和删除功能 |

## 开发指南

### 代码风格
- 使用 Vue 3 Composition API
- 组件命名采用 PascalCase
- 变量命名采用 camelCase
- 函数命名采用 camelCase

### 提交规范
- 使用语义化提交信息
- 提交前运行代码检查

## 许可证

MIT
