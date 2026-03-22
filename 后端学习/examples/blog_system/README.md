# Blog System - 完整博客系统示例

这是一个功能完整的博客系统，包含用户认证、文章管理、评论系统和管理后台。

## 功能特性

### 用户功能
- ✅ 用户注册和登录
- ✅ 密码哈希存储
- ✅ Session 管理
- ✅ 个人资料页面
- ✅ 发布和编辑文章
- ✅ 发表评论

### 管理功能
- ✅ 管理员后台
- ✅ 文章管理
- ✅ 用户管理
- ✅ 文章审核

### 技术特性
- ✅ 数据库 ORM
- ✅ 模板渲染
- ✅ 权限控制
- ✅ 闪现消息
- ✅ 分页显示

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行应用

```bash
python app.py
```

### 3. 访问应用

打开浏览器访问：`http://localhost:5000`

### 4. 使用管理员账号登录

```
用户名：admin
密码：admin123
```

## 页面说明

### 公开页面
- `/` - 首页（文章列表）
- `/post/<id>` - 文章详情
- `/user/<username>` - 用户资料

### 认证页面
- `/register` - 用户注册
- `/login` - 用户登录
- `/logout` - 退出登录

### 用户功能（需要登录）
- `/post/create` - 创建文章
- `/post/<id>/edit` - 编辑文章
- `/post/<id>/comment` - 发表评论
- `/profile` - 我的资料

### 管理后台（需要管理员权限）
- `/admin` - 管理后台首页
- `/admin/posts` - 文章管理
- `/admin/users` - 用户管理

## 数据库模型

### User（用户）
- id - 用户ID
- username - 用户名（唯一）
- email - 邮箱（唯一）
- password_hash - 密码哈希
- bio - 个人简介
- is_admin - 是否管理员
- created_at - 创建时间

### Post（文章）
- id - 文章ID
- title - 标题
- content - 内容
- summary - 摘要
- published - 是否发布
- views - 阅读量
- user_id - 作者ID
- created_at - 创建时间
- updated_at - 更新时间

### Comment（评论）
- id - 评论ID
- content - 内容
- user_id - 评论者ID
- post_id - 文章ID
- created_at - 创建时间

## 项目结构

```
blog_system/
├── app.py              # 主应用文件
├── requirements.txt    # 依赖列表
├── README.md          # 说明文档
├── blog.db            # 数据库文件（运行后生成）
└── templates/         # 模板文件
    ├── base.html      # 基础模板
    ├── index.html     # 首页
    ├── auth/          # 认证相关
    │   ├── login.html
    │   └── register.html
    ├── post/          # 文章相关
    │   ├── create.html
    │   ├── detail.html
    │   └── edit.html
    ├── user/          # 用户相关
    │   └── profile.html
    └── admin/         # 管理后台
        ├── dashboard.html
        ├── posts.html
        └── users.html
```

## 使用示例

### 1. 注册新用户

访问 `/register`，填写用户名、邮箱和密码。

### 2. 发布文章

登录后访问 `/post/create`：
- 填写文章标题
- 编写文章内容
- 添加摘要（可选）
- 选择是否立即发布
- 点击"发布文章"

### 3. 评论文章

在文章详情页面底部：
- 填写评论内容
- 点击"发表评论"

### 4. 管理后台

使用管理员账号登录后访问 `/admin`：
- 查看系统统计
- 管理所有文章
- 管理所有用户

## 学习要点

### 1. 路由和视图函数
```python
@app.route('/post/<int:post_id>')
def post_detail(post_id):
    post = Post.query.get_or_404(post_id)
    return render_template('post/detail.html', post=post)
```

### 2. 表单处理
```python
@app.route('/post/create', methods=['GET', 'POST'])
def create_post():
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        # 处理逻辑...
```

### 3. 用户认证
```python
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
```

### 4. 数据库关系
```python
# 一对多关系
class User(db.Model):
    posts = db.relationship('Post', backref='author', lazy='dynamic')

# 使用
user.posts.all()  # 获取用户的所有文章
post.author       # 获取文章的作者
```

## 扩展建议

- [ ] 添加文章标签系统
- [ ] 实现文章搜索
- [ ] 添加富文本编辑器
- [ ] 实现图片上传
- [ ] 添加邮件通知
- [ ] 实现 RSS 订阅
- [ ] 添加文章点赞功能
- [ ] 实现用户关注系统

## 安全提示

在生产环境中：
1. 修改 `SECRET_KEY`
2. 使用 HTTPS
3. 使用环境变量存储敏感配置
4. 定期备份数据库
5. 实现 CSRF 保护
6. 添加速率限制

## 常见问题

**Q: 如何修改密码？**
A: 当前版本不支持修改密码，可以手动清空数据库重新注册

**Q: 如何重置数据库？**
A: 删除 `blog.db` 文件，重新运行应用

**Q: 如何添加更多管理功能？**
A: 在 `/admin` 路由下添加新的管理视图

祝你学习愉快！🚀
