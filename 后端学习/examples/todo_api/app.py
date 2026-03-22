"""
完整的 RESTful TODO API 示例
演示如何使用 Flask 构建标准的 API 接口
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from marshmallow import Schema, fields, validate, ValidationError

# 创建 Flask 应用
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库
db = SQLAlchemy(app)

# ============== 数据库模型 ==============
class Todo(db.Model):
    """TODO 任务模型"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        """将模型转换为字典"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'priority': self.priority,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# ============== 数据验证 Schema ==============
class TodoSchema(Schema):
    """TODO 数据验证模式"""
    title = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=200, error='标题长度必须在1-200字符之间')
    )
    description = fields.Str(
        validate=validate.Length(max=1000, error='描述不能超过1000字符'),
        missing=None
    )
    completed = fields.Bool(missing=False)
    priority = fields.Str(
        validate=validate.OneOf(
            ['low', 'medium', 'high'],
            error='优先级必须是 low、medium 或 high'
        ),
        missing='medium'
    )
    category = fields.Str(missing=None)

# 创建 Schema 实例
todo_schema = TodoSchema()
todos_schema = TodoSchema(many=True)

# ============== 辅助函数 ==============
def make_response(data=None, status=200, message=None):
    """统一的响应格式"""
    response = {'status': 'success' if status < 400 else 'error'}
    if data is not None:
        response['data'] = data
    if message:
        response['message'] = message
    return jsonify(response), status

# ============== 路由定义 ==============

@app.route('/', methods=['GET'])
def index():
    """API 信息"""
    return make_response({
        'name': 'TODO API',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/todos': '获取所有待办事项',
            'GET /api/todos/<id>': '获取单个待办事项',
            'POST /api/todos': '创建待办事项',
            'PUT /api/todos/<id>': '更新待办事项',
            'DELETE /api/todos/<id>': '删除待办事项',
            'PATCH /api/todos/<id>/toggle': '切换完成状态',
            'GET /api/todos/stats': '获取统计信息'
        }
    })

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """
    获取所有待办事项
    支持过滤和排序
    """
    try:
        # 获取查询参数
        query = Todo.query

        # 过滤：按完成状态
        completed = request.args.get('completed')
        if completed is not None:
            query = query.filter(Todo.completed == (completed.lower() == 'true'))

        # 过滤：按优先级
        priority = request.args.get('priority')
        if priority:
            query = query.filter(Todo.priority == priority)

        # 过滤：按分类
        category = request.args.get('category')
        if category:
            query = query.filter(Todo.category == category)

        # 过滤：搜索标题和描述
        search = request.args.get('search')
        if search:
            query = query.filter(
                db.or_(
                    Todo.title.like(f'%{search}%'),
                    Todo.description.like(f'%{search}%')
                )
            )

        # 排序
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')

        # 验证排序字段
        valid_sort_fields = ['created_at', 'updated_at', 'priority', 'title']
        if sort_by not in valid_sort_fields:
            return make_response(message=f'无效的排序字段: {sort_by}', status=400)

        # 构建排序
        if sort_by == 'priority':
            # 优先级特殊排序
            from sqlalchemy import case
            priority_order = case(
                (Todo.priority == 'high', 1),
                (Todo.priority == 'medium', 2),
                (Todo.priority == 'low', 3),
            )
            order_func = db.asc if sort_order == 'asc' else db.desc
            query = query.order_by(order_func(priority_order))
        else:
            # 普通排序
            order_func = db.asc if sort_order == 'asc' else db.desc
            query = query.order_by(order_func(getattr(Todo, sort_by)))

        # 分页
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        per_page = min(per_page, 100)  # 限制每页最大数量

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # 返回结果
        return make_response({
            'todos': [todo.to_dict() for todo in pagination.items],
            'pagination': {
                'total': pagination.total,
                'pages': pagination.pages,
                'current_page': page,
                'per_page': per_page,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev,
                'next_page': page + 1 if pagination.has_next else None,
                'prev_page': page - 1 if pagination.has_prev else None
            }
        })

    except Exception as e:
        return make_response(message=f'服务器错误: {str(e)}', status=500)

@app.route('/api/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """获取单个待办事项"""
    todo = Todo.query.get(todo_id)
    if not todo:
        return make_response(message='待办事项不存在', status=404)
    return make_response(todo.to_dict())

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """创建新的待办事项"""
    try:
        # 验证请求数据
        data = todo_schema.load(request.get_json())

        # 创建 TODO 对象
        todo = Todo(**data)
        db.session.add(todo)
        db.session.commit()

        return make_response(todo.to_dict(), status=201, message='创建成功')

    except ValidationError as err:
        return make_response(message='数据验证失败', data=err.messages, status=400)
    except Exception as e:
        db.session.rollback()
        return make_response(message=f'创建失败: {str(e)}', status=500)

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """更新待办事项"""
    try:
        # 查找 TODO
        todo = Todo.query.get(todo_id)
        if not todo:
            return make_response(message='待办事项不存在', status=404)

        # 验证数据（partial=True 允许部分更新）
        data = todo_schema.load(request.get_json(), partial=True)

        # 更新字段
        for key, value in data.items():
            setattr(todo, key, value)

        db.session.commit()
        return make_response(todo.to_dict(), message='更新成功')

    except ValidationError as err:
        return make_response(message='数据验证失败', data=err.messages, status=400)
    except Exception as e:
        db.session.rollback()
        return make_response(message=f'更新失败: {str(e)}', status=500)

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """删除待办事项"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return make_response(message='待办事项不存在', status=404)

        db.session.delete(todo)
        db.session.commit()
        return make_response(message='删除成功', status=204)

    except Exception as e:
        db.session.rollback()
        return make_response(message=f'删除失败: {str(e)}', status=500)

@app.route('/api/todos/<int:todo_id>/toggle', methods=['PATCH'])
def toggle_todo(todo_id):
    """切换待办事项的完成状态"""
    try:
        todo = Todo.query.get(todo_id)
        if not todo:
            return make_response(message='待办事项不存在', status=404)

        todo.completed = not todo.completed
        db.session.commit()

        return make_response(
            todo.to_dict(),
            message=f'已标记为{"完成" if todo.completed else "未完成"}'
        )

    except Exception as e:
        db.session.rollback()
        return make_response(message=f'操作失败: {str(e)}', status=500)

@app.route('/api/todos/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    try:
        total = Todo.query.count()
        completed = Todo.query.filter_by(completed=True).count()
        pending = total - completed

        # 按优先级统计
        high_priority = Todo.query.filter_by(priority='high', completed=False).count()
        medium_priority = Todo.query.filter_by(priority='medium', completed=False).count()
        low_priority = Todo.query.filter_by(priority='low', completed=False).count()

        # 完成率
        completion_rate = round(completed / total * 100, 2) if total > 0 else 0

        return make_response({
            'total': total,
            'completed': completed,
            'pending': pending,
            'completion_rate': completion_rate,
            'by_priority': {
                'high': high_priority,
                'medium': medium_priority,
                'low': low_priority
            }
        })

    except Exception as e:
        return make_response(message=f'统计失败: {str(e)}', status=500)

# ============== 错误处理 ==============
@app.errorhandler(404)
def not_found(error):
    return make_response(message='资源不存在', status=404)

@app.errorhandler(405)
def method_not_allowed(error):
    return make_response(message='不支持的请求方法', status=405)

@app.errorhandler(500)
def internal_error(error):
    return make_response(message='服务器内部错误', status=500)

# ============== 初始化数据库 ==============
def init_db():
    """初始化数据库，创建示例数据"""
    with app.app_context():
        db.create_all()

        # 如果数据库为空，添加示例数据
        if Todo.query.count() == 0:
            sample_todos = [
                Todo(
                    title='学习 Flask',
                    description='完成 Flask 框架的学习教程',
                    priority='high',
                    category='学习'
                ),
                Todo(
                    title='编写 RESTful API',
                    description='使用 Flask 构建一个完整的 API',
                    priority='medium',
                    category='开发'
                ),
                Todo(
                    title='阅读文档',
                    description='阅读 Flask 官方文档',
                    priority='low',
                    category='学习'
                )
            ]
            db.session.add_all(sample_todos)
            db.session.commit()
            print("✓ 数据库初始化完成，已添加示例数据")

# ============== 启动应用 ==============
if __name__ == '__main__':
    # 初始化数据库
    init_db()

    # 启动开发服务器
    print("========================================")
    print("TODO API 服务器启动成功！")
    print("访问地址：http://localhost:5000")
    print("========================================")
    app.run(debug=True, port=5000)
