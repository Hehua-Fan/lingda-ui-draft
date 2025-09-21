# Lingda UI Backend

基于Python + FastAPI + Playwright的浏览器自动化工作流执行引擎。

## 功能特性

### 🌐 支持的浏览器操作节点

1. **Visit Page** - 访问页面
   - 导航到指定URL
   - 等待页面加载完成
   - 支持超时设置

2. **Click Element** - 点击元素
   - 支持CSS选择器和XPath
   - 单击、双击、右键点击
   - 自动滚动到可视区域

3. **Input Text** - 输入文本
   - 在输入框中输入文本
   - 支持变量替换
   - 可选择是否清空原内容

4. **Scroll Page** - 滚动页面
   - 上下左右滚动
   - 滚动到指定元素
   - 平滑滚动支持

5. **Pagination** - 分页处理
   - 自动点击下一页
   - 设置最大页数限制
   - 停止条件检测

6. **Wait** - 等待
   - 时间等待
   - 元素等待
   - 条件等待

7. **Loop** - 循环
   - 计数循环
   - 条件循环
   - 防无限循环保护

8. **Extract Data** - 数据提取
   - 提取文本内容
   - 提取HTML内容
   - 提取元素属性
   - 批量数据提取

### 🎯 核心特性

- **可视化工作流**: 前端拖拽式节点编辑
- **异步执行**: 高效的异步任务处理
- **实时监控**: 执行状态和结果实时查询
- **错误处理**: 完善的错误处理和日志记录
- **截图功能**: 自动截图记录执行过程
- **数据存储**: 提取的数据自动保存

## 快速开始

### 1. 安装依赖

```bash
cd backend
python -m pip install -r requirements.txt
python -m playwright install
```

### 2. 启动服务器

```bash
# 方式1: 使用启动脚本（推荐）
python start.py

# 方式2: 直接使用uvicorn
uvicorn API.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 访问API文档

启动成功后，打开浏览器访问：
- API文档: http://localhost:8000/docs
- 服务状态: http://localhost:8000

## API 接口

### 获取可用节点类型
```http
GET /nodes
```

### 执行工作流
```http
POST /workflow/execute
Content-Type: application/json

{
  "workflow_id": "workflow_1",
  "name": "示例工作流",
  "nodes": [...],
  "edges": [...]
}
```

### 查询执行状态
```http
GET /workflow/status/{execution_id}
```

### 停止工作流执行
```http
POST /workflow/stop/{execution_id}
```

## 工作流定义示例

```json
{
  "workflow_id": "example_workflow",
  "name": "网页数据抓取示例",
  "description": "访问网站并提取数据",
  "nodes": [
    {
      "id": "start_1",
      "type": "default",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "开始",
        "nodeType": "start",
        "params": {}
      }
    },
    {
      "id": "visit_1", 
      "type": "default",
      "position": {"x": 300, "y": 100},
      "data": {
        "label": "访问页面",
        "nodeType": "visit_page",
        "params": {
          "url": "https://example.com",
          "wait_for_load": true,
          "timeout": 30000
        }
      }
    },
    {
      "id": "extract_1",
      "type": "default", 
      "position": {"x": 500, "y": 100},
      "data": {
        "label": "提取数据",
        "nodeType": "extract_data",
        "params": {
          "selectors": {
            "title": "h1",
            "content": ".content",
            "links": "a[href]"
          },
          "extract_type": "text",
          "multiple": false
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "start_1", 
      "target": "visit_1"
    },
    {
      "id": "edge_2",
      "source": "visit_1",
      "target": "extract_1"
    }
  ]
}
```

## 节点参数说明

### Visit Page 节点
```json
{
  "url": "https://example.com",        // 必需：目标URL
  "wait_for_load": true,               // 可选：是否等待页面加载
  "timeout": 30000                     // 可选：超时时间（毫秒）
}
```

### Click Element 节点
```json
{
  "selector": ".button",               // 必需：元素选择器
  "selector_type": "css",              // 可选：选择器类型（css/xpath）
  "wait_timeout": 10000,               // 可选：等待超时时间
  "click_type": "single"               // 可选：点击类型（single/double/right）
}
```

### Input Text 节点
```json
{
  "selector": "#input-field",          // 必需：输入框选择器
  "text": "Hello World",               // 必需：输入文本
  "clear_first": true,                 // 可选：是否先清空
  "press_enter": false                 // 可选：是否按回车键
}
```

### Extract Data 节点
```json
{
  "selectors": {                       // 必需：字段选择器映射
    "title": "h1",
    "price": ".price",
    "description": ".desc"
  },
  "extract_type": "text",              // 可选：提取类型（text/html/attribute）
  "attribute_name": "href",            // 可选：属性名（extract_type为attribute时）
  "multiple": false                    // 可选：是否提取多个元素
}
```

## 开发说明

### 项目结构
```
backend/
├── API/                 # API模块
│   ├── __init__.py
│   └── main.py          # FastAPI应用入口
├── models/              # 数据模型
│   ├── __init__.py
│   └── workflow.py      # 工作流相关模型
├── nodes/               # 节点实现
│   ├── __init__.py
│   ├── base.py          # 节点基类
│   ├── browser_nodes.py # 浏览器操作节点
│   └── control_nodes.py # 控制流节点
├── workflow/            # 工作流引擎
│   ├── __init__.py
│   └── engine.py        # 执行引擎
├── screenshots/         # 截图存储目录
├── requirements.txt     # Python依赖
├── start.py            # 启动脚本
└── README.md           # 本文件
```

### 添加新节点类型

1. 在 `models/workflow.py` 中添加节点类型枚举
2. 在 `nodes/browser_nodes.py` 中实现节点类
3. 在 `nodes/__init__.py` 中注册节点类型
4. 在前端添加对应的节点定义

### 浏览器配置

默认使用Chromium浏览器，可在 `workflow/engine.py` 中修改配置：

```python
self.browser = await self.playwright.chromium.launch(
    headless=False,  # 设为True可隐藏浏览器界面
    args=[
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
    ]
)
```

## 注意事项

1. **内存管理**: 长时间运行的工作流可能消耗较多内存
2. **反爬机制**: 某些网站可能有反爬虫机制，需要调整策略
3. **并发限制**: 避免同时执行过多工作流，可能导致系统不稳定
4. **数据安全**: 提取的数据仅存储在内存中，重启服务会丢失

## 故障排除

### 常见问题

1. **Playwright浏览器安装失败**
   ```bash
   python -m playwright install --force
   ```

2. **端口占用**
   ```bash
   # 更改端口
   uvicorn API.main:app --port 8001
   ```

3. **内存不足**
   - 减少并发工作流数量
   - 增加系统虚拟内存
   - 使用headless模式

## 许可证

MIT License
