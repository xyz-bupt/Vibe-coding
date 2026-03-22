# TODO API - RESTful API 示例

这是一个完整的 RESTful TODO API 实现，演示了 Flask API 开发的最佳实践。

## 功能特性

- ✅ 完整的 CRUD 操作
- ✅ 数据验证（Marshmallow）
- ✅ 分页、过滤、排序
- ✅ 统一的错误处理
- ✅ 统计功能
- ✅ RESTful 设计

## 快速开始

### 1. 创建虚拟环境

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 运行应用

```bash
python app.py
```

### 4. 测试 API

访问 `http://localhost:5000` 查看 API 文档

## API 端点

### 获取所有 TODO
```bash
GET /api/todos
```

**查询参数：**
- `page` - 页码（默认：1）
- `per_page` - 每页数量（默认：10，最大：100）
- `completed` - 按完成状态过滤（true/false）
- `priority` - 按优先级过滤（low/medium/high）
- `category` - 按分类过滤
- `search` - 搜索标题和描述
- `sort_by` - 排序字段（created_at/updated_at/priority/title）
- `sort_order` - 排序方向（asc/desc）

**示例：**
```bash
# 获取所有未完成的高优先级任务
curl "http://localhost:5000/api/todos?completed=false&priority=high"

# 搜索包含"Flask"的任务
curl "http://localhost:5000/api/todos?search=Flask"

# 按优先级排序
curl "http://localhost:5000/api/todos?sort_by=priority&sort_order=asc"
```

### 获取单个 TODO
```bash
GET /api/todos/<id>
```

**示例：**
```bash
curl http://localhost:5000/api/todos/1
```

### 创建 TODO
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "任务标题",
  "description": "任务描述",
  "priority": "high",
  "category": "工作"
}
```

**示例：**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"学习Flask","priority":"high","category":"学习"}'
```

### 更新 TODO
```bash
PUT /api/todos/<id>
Content-Type: application/json

{
  "title": "更新后的标题",
  "completed": true
}
```

**示例：**
```bash
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### 删除 TODO
```bash
DELETE /api/todos/<id>
```

**示例：**
```bash
curl -X DELETE http://localhost:5000/api/todos/1
```

### 切换完成状态
```bash
PATCH /api/todos/<id>/toggle
```

**示例：**
```bash
curl -X PATCH http://localhost:5000/api/todos/1/toggle
```

### 获取统计信息
```bash
GET /api/todos/stats
```

**响应：**
```json
{
  "status": "success",
  "data": {
    "total": 10,
    "completed": 5,
    "pending": 5,
    "completion_rate": 50.0,
    "by_priority": {
      "high": 2,
      "medium": 2,
      "low": 1
    }
  }
}
```

## 响应格式

### 成功响应
```json
{
  "status": "success",
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "status": "error",
  "message": "错误信息",
  "data": { ... }  // 可选的详细错误信息
}
```

## 测试工具推荐

1. **curl** - 命令行工具
2. **Postman** - 图形化 API 测试工具
3. **HTTPie** - 友好的命令行工具
4. **Insomnia** - 轻量级 API 测试工具

## 项目结构

```
todo_api/
├── app.py              # 主应用文件
├── requirements.txt    # Python 依赖
├── README.md          # 说明文档
└── todo.db            # SQLite 数据库（运行后生成）
```

## 学习要点

1. **RESTful 设计** - 合理的 URL 设计和 HTTP 方法使用
2. **数据验证** - 使用 Marshmallow 验证输入数据
3. **错误处理** - 统一的错误响应格式
4. **数据库操作** - SQLAlchemy ORM 的使用
5. **查询优化** - 过滤、排序、分页的实现

## 扩展建议

- [ ] 添加用户认证（JWT）
- [ ] 添加标签系统
- [ ] 实现任务截止日期提醒
- [ ] 添加任务评论功能
- [ ] 实现任务拖拽排序
- [ ] 添加 WebSocket 实时更新

## 常见问题

**Q: 如何修改数据库？**
A: 修改 `app.config['SQLALCHEMY_DATABASE_URI']`

**Q: 如何添加更多字段？**
A: 在 Todo 模型中添加新字段，然后删除 todo.db 重新运行

**Q: 如何部署到生产环境？**
A: 使用 Gunicorn + Nginx，详见教程第 8 章

祝你学习愉快！🚀
