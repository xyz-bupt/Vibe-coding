# Flask RESTful API 开发

## 本章学习目标

完成本章后，你将能够：
- 理解 REST 架构风格的核心概念
- 设计符合 REST 规范的 API
- 使用 Flask 处理 JSON 数据
- 实现完整的 CRUD API
- 处理 API 错误和验证
- 实现 API 版本控制
- 编写 API 文档

## 什么是 REST？

REST（Representational State Transfer，表现层状态转移）是一种软件架构风格，用于设计网络应用的 API。

### REST 核心概念

#### 1. 资源（Resources）

一切皆资源，每个资源都有唯一的标识符（URI）。

```
/users        - 用户列表资源
/users/1      - ID 为 1 的用户资源
/posts/42/comments  - 文章 42 的评论资源
```

#### 2. HTTP 方法

| 方法 | 操作 | 示例 | 幂等性 |
|------|------|------|--------|
| GET | 获取资源 | GET /users | 是 |
| POST | 创建资源 | POST /users | 否 |
| PUT | 完整更新资源 | PUT /users/1 | 是 |
| PATCH | 部分更新资源 | PATCH /users/1 | 否 |
| DELETE | 删除资源 | DELETE /users/1 | 是 |

#### 3. 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 500 | Internal Server Error | 服务器错误 |

## API 设计原则

### URL 设计

**好的设计**：
```
GET    /users          # 获取用户列表
GET    /users/1        # 获取单个用户
POST   /users          # 创建用户
PUT    /users/1        # 更新用户
DELETE /users/1        # 删除用户

GET    /users/1/posts  # 获取用户的文章
```

**不好的设计**：
```
GET    /getUsers       # 不要在 URL 中包含动词
GET    /user           # 使用复数形式
POST   /createUser     # 不要在 URL 中描述操作
GET    /users?action=create  # 不要用参数描述操作
```

### 请求与响应格式

**请求体（POST /users）**：
```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应体（成功）**：
```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**响应体（错误）**：
```json
{
  "error": "Validation Error",
  "message": "Email is required",
  "status_code": 400
}
```

## 基本 RESTful API 实现

### 项目结构

```
api_project/
├── app.py
├── models.py
├── requirements.txt
└── schemas.py  # 数据验证模式
```

### 基础 API

**app.py**：
```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///api.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 模型定义
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    def to_dict(self):
        """将模型转换为字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

# 创建数据库
with app.app_context():
    db.create_all()

# 路由

# 获取所有用户
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# 获取单个用户
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict())

# 创建用户
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()

    # 验证数据
    if not data or not data.get('username') or not data.get('email'):
        return jsonify({'error': 'Username and email are required'}), 400

    # 检查用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    # 创建用户
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201

# 更新用户
@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # 更新字段
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']

    db.session.commit()
    return jsonify(user.to_dict())

# 删除用户
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return '', 204

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'status_code': 404}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'status_code': 500}), 500

if __name__ == '__main__':
    app.run(debug=True)
```

## 使用 Flask-RESTful

Flask-RESTful 是一个扩展，简化了 RESTful API 的开发。

### 安装

```bash
pip install flask-restful
```

### 使用示例

```python
from flask import Flask, request
from flask_restful import Api, Resource, reqparse, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///api.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
api = Api(app)

# 模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

# 定义输出字段
resource_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String
}

# 用户资源
class UserResource(Resource):
    @marshal_with(resource_fields)
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return user, 200

    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str)
        parser.add_argument('email', type=str)
        args = parser.parse_args()

        if args['username']:
            user.username = args['username']
        if args['email']:
            user.email = args['email']

        db.session.commit()
        return {'message': 'User updated'}, 200

    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204

# 用户列表资源
class UserListResource(Resource):
    @marshal_with(resource_fields)
    def get(self):
        users = User.query.all()
        return users, 200

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, help='Username is required')
        parser.add_argument('email', type=str, required=True, help='Email is required')
        args = parser.parse_args()

        user = User(username=args['username'], email=args['email'])
        db.session.add(user)
        db.session.commit()

        return {'message': 'User created', 'id': user.id}, 201

# 添加路由
api.add_resource(UserListResource, '/api/users')
api.add_resource(UserResource, '/api/users/<int:user_id>')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
```

## 数据验证

### 使用 Marshmallow

**安装**：
```bash
pip install marshmallow
```

**定义 Schema**：
```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, validate, ValidationError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///api.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    age = db.Column(db.Integer)

# Schema
class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    age = fields.Int(validate=validate.Range(min=0, max=150))

# 创建和更新 Schema
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# 路由
@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        # 验证数据
        data = user_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    # 创建用户
    user = User(**data)
    db.session.add(user)
    db.session.commit()

    return jsonify(user_schema.dump(user)), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
```

## API 版本控制

### URL 版本控制

```python
# v1 API
@app.route('/api/v1/users')
def get_users_v1():
    return jsonify({'version': 'v1', 'users': []})

# v2 API
@app.route('/api/v2/users')
def get_users_v2():
    return jsonify({'version': 'v2', 'users': [], 'total': 0})
```

### 蓝图版本控制

```python
from flask import Blueprint

# v1 蓝图
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

@api_v1.route('/users')
def get_users():
    return jsonify({'version': 'v1', 'users': []})

# v2 蓝图
api_v2 = Blueprint('api_v2', __name__, url_prefix='/api/v2')

@api_v2.route('/users')
def get_users():
    return jsonify({'version': 'v2', 'users': [], 'total': 0})

# 注册蓝图
app.register_blueprint(api_v1)
app.register_blueprint(api_v2)
```

## 分页、过滤和排序

### 分页

```python
@app.route('/api/users')
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # 限制每页最大数量
    per_page = min(per_page, 100)

    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    })
```

### 过滤

```python
@app.route('/api/users')
def get_users():
    query = User.query

    # 按用户名过滤
    username = request.args.get('username')
    if username:
        query = query.filter(User.username.like(f'%{username}%'))

    # 按邮箱过滤
    email = request.args.get('email')
    if email:
        query = query.filter(User.email.like(f'%{email}%'))

    # 按年龄范围过滤
    min_age = request.args.get('min_age', type=int)
    max_age = request.args.get('max_age', type=int)
    if min_age:
        query = query.filter(User.age >= min_age)
    if max_age:
        query = query.filter(User.age <= max_age)

    users = query.all()
    return jsonify([user.to_dict() for user in users])
```

### 排序

```python
@app.route('/api/users')
def get_users():
    # 获取排序参数
    sort_by = request.args.get('sort_by', 'id')
    order = request.args.get('order', 'asc')

    # 验证排序字段
    valid_sort_fields = ['id', 'username', 'created_at']
    if sort_by not in valid_sort_fields:
        return jsonify({'error': 'Invalid sort field'}), 400

    # 构建排序
    order_func = db.asc if order == 'asc' else db.desc
    query = User.query.order_by(order_func(getattr(User, sort_by)))

    users = query.all()
    return jsonify([user.to_dict() for user in users])
```

## 完整示例：TODO API

```python
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from marshmallow import Schema, fields, validate, ValidationError

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 模型
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Schema
class TodoSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(validate=validate.Length(max=1000))
    completed = fields.Bool(missing=False)
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high']), missing='medium')
    due_date = fields.Date(allow_none=True)

todo_schema = TodoSchema()
todos_schema = TodoSchema(many=True)

# 创建数据库
with app.app_context():
    db.create_all()

# 路由
@app.route('/api/todos', methods=['GET'])
def get_todos():
    """获取所有待办事项"""
    query = Todo.query

    # 过滤
    completed = request.args.get('completed')
    if completed is not None:
        query = query.filter(Todo.completed == (completed.lower() == 'true'))

    priority = request.args.get('priority')
    if priority:
        query = query.filter(Todo.priority == priority)

    # 排序
    sort_by = request.args.get('sort_by', 'created_at')
    if sort_by == 'due_date':
        query = query.order_by(Todo.due_date.asc().nulls_last())
    elif sort_by == 'priority':
        priority_order = db.case(
            (Todo.priority == 'high', 1),
            (Todo.priority == 'medium', 2),
            (Todo.priority == 'low', 3),
        )
        query = query.order_by(priority_order)
    else:
        query = query.order_by(Todo.created_at.desc())

    todos = query.all()
    return jsonify(todos_schema.dump(todos))

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """获取单个待办事项"""
    todo = Todo.query.get_or_404(todo_id)
    return jsonify(todo.to_dict())

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """创建待办事项"""
    try:
        data = todo_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    todo = Todo(**data)
    db.session.add(todo)
    db.session.commit()

    return jsonify(todo.to_dict()), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """更新待办事项"""
    todo = Todo.query.get_or_404(todo_id)

    try:
        data = todo_schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    for key, value in data.items():
        setattr(todo, key, value)

    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>', methods=['PATCH'])
def patch_todo(todo_id):
    """部分更新待办事项（切换完成状态）"""
    todo = Todo.query.get_or_404(todo_id)
    todo.completed = not todo.completed
    db.session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """删除待办事项"""
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return '', 204

@app.route('/api/todos/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    total = Todo.query.count()
    completed = Todo.query.filter_by(completed=True).count()
    pending = total - completed

    return jsonify({
        'total': total,
        'completed': completed,
        'pending': pending,
        'completion_rate': round(completed / total * 100, 2) if total > 0 else 0
    })

if __name__ == '__main__':
    app.run(debug=True)
```

## API 文档

### 基本文档格式

```python
@app.route('/api/users', methods=['GET'])
def get_users():
    """
    获取用户列表

    ---
    tags:
      - users
    parameters:
      - name: page
        in: query
        type: integer
        required: false
        default: 1
        description: 页码
      - name: per_page
        in: query
        type: integer
        required: false
        default: 10
        description: 每页数量
    responses:
      200:
        description: 成功获取用户列表
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              username:
                type: string
              email:
                type: string
    """
    # 实现代码
    pass
```

### 使用 Swagger UI（Flasgger）

**安装**：
```bash
pip install flasgger
```

**使用**：
```python
from flask import Flask
from flasgger import Swagger

app = Flask(__name__)
swagger = Swagger(app)

@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    """
    获取用户信息
    ---
    tags:
      - users
    parameters:
      - name: user_id
        in: path
        type: integer
        required: true
        description: 用户 ID
    responses:
      200:
        description: 成功
      404:
        description: 用户不存在
    """
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())
```

访问 `http://localhost:5000/apidocs` 查看 API 文档。

## 测试 API

### 使用 curl

```bash
# 获取用户列表
curl http://localhost:5000/api/users

# 创建用户
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com"}'

# 更新用户
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"newname"}'

# 删除用户
curl -X DELETE http://localhost:5000/api/users/1
```

### 使用 Postman

Postman 是一个流行的 API 测试工具，提供图形化界面。

## 常见问题

### Q1: 如何处理文件上传？

```python
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file:
        filename = secure_filename(file.filename)
        file.save(f'/path/to/upload/{filename}')
        return jsonify({'message': 'File uploaded', 'filename': filename}), 201
```

### Q2: 如何实现 API 认证？

将在第6章《用户认证与授权》中详细讲解。

## 最佳实践

### 1. 使用适当的 HTTP 状态码

```python
# 成功
return jsonify(data), 200
return jsonify(data), 201  # 创建

# 客户端错误
return jsonify({'error': 'Bad request'}), 400
return jsonify({'error': 'Unauthorized'}), 401
return jsonify({'error': 'Not found'}), 404

# 服务器错误
return jsonify({'error': 'Internal error'}), 500
```

### 2. 统一错误响应格式

```python
def make_error_response(error, status_code):
    return jsonify({
        'error': error,
        'status_code': status_code
    }), status_code

# 使用
return make_error_response('User not found', 404)
```

### 3. 使用 HATEOAS（超媒体）

```python
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "links": {
    "self": "/api/users/1",
    "posts": "/api/users/1/posts",
    "update": "/api/users/1",
    "delete": "/api/users/1"
  }
}
```

### 4. 实现速率限制

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@app.route('/api/users', methods=['GET'])
@limiter.limit("100 per hour")
def get_users():
    pass
```

## 练习

### 练习 1：构建博客 API

实现以下端点：
- GET /api/posts - 获取文章列表（支持分页、过滤、排序）
- GET /api/posts/<id> - 获取单篇文章
- POST /api/posts - 创建文章
- PUT /api/posts/<id> - 更新文章
- DELETE /api/posts/<id> - 删除文章

## 总结

在本章中，你学习了：

✅ REST 架构风格
✅ API 设计原则
✅ Flask 实现 RESTful API
✅ 使用 Flask-RESTful
✅ 数据验证（Marshmallow）
✅ API 版本控制
✅ 分页、过滤和排序
✅ 完整的 TODO API 示例

## 下一步

在下一章《用户认证与授权》中，我们将学习：
- Flask-Login 用户认证
- 密码哈希
- JWT Token 认证
- 权限控制

继续学习，保护你的 API！🚀
