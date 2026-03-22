# User Authentication - 用户认证系统示例

这是一个完整的用户认证系统，演示了 Flask 中用户注册、登录、权限控制等功能。

## 功能特性

### 基础功能
- ✅ 用户注册
- ✅ 用户登录/登出
- ✅ 密码哈希存储
- ✅ Session 管理
- ✅ 记住我功能

### 安全功能
- ✅ 密码强度验证
- ✅ 登录日志记录
- ✅ 账号激活/禁用
- ✅ 权限控制

### 管理功能
- ✅ 用户管理
- ✅ 权限管理
- ✅ 登录日志查看

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
- `/` - 首页
- `/register` - 用户注册
- `/login` - 用户登录

### 用户功能（需要登录）
- `/dashboard` - 用户仪表板
- `/profile` - 个人资料
- `/change-password` - 修改密码
- `/logout` - 退出登录

### 管理员功能（需要管理员权限）
- `/admin/users` - 用户管理
- `/admin/logs` - 登录日志

## 数据库模型

### User（用户表）
- `id` - 主键
- `username` - 用户名（唯一）
- `email` - 邮箱（唯一）
- `password_hash` - 密码哈希（不存储明文密码）
- `is_active` - 账号是否激活
- `is_admin` - 是否管理员
- `created_at` - 创建时间
- `last_login` - 最后登录时间

### LoginLog（登录日志表）
- `id` - 主键
- `user_id` - 用户ID（外键）
- `ip_address` - IP地址
- `user_agent` - 用户代理
- `login_time` - 登录时间
- `success` - 是否成功

## 安全特性

### 1. 密码哈希
使用 Werkzeug 的密码哈希功能，不存储明文密码：
```python
from werkzeug.security import generate_password_hash, check_password_hash

# 设置密码
user.set_password('password123')

# 验证密码
if user.check_password('password123'):
    # 密码正确
```

### 2. Session 管理
- Session 超时设置（7天）
- 记住我功能
- 安全的 Session 配置

### 3. 权限装饰器
```python
@login_required  # 需要登录
def profile():
    pass

@admin_required  # 需要管理员
def admin_page():
    pass
```

### 4. 登录日志
记录所有登录尝试，包括失败的尝试：
- IP 地址
- 用户代理
- 登录时间
- 是否成功

## 使用示例

### 1. 注册新用户

访问 `/register`：
1. 输入用户名（至少3个字符）
2. 输入邮箱（有效格式）
3. 输入密码（至少6个字符）
4. 确认密码
5. 点击"注册"

### 2. 登录

访问 `/login`：
1. 输入用户名或邮箱
2. 输入密码
3. 可选：勾选"记住我"
4. 点击"登录"

### 3. 修改密码

登录后访问 `/change-password`：
1. 输入当前密码
2. 输入新密码
3. 确认新密码
4. 点击"修改密码"

### 4. 管理员操作

使用管理员账号登录后：
- 访问 `/admin/users` 查看所有用户
- 启用/禁用用户账号
- 授予/取消管理员权限
- 查看登录日志

## 学习要点

### 1. 用户模型
```python
class User(db.Model):
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
```

### 2. 登录流程
```python
@app.route('/login', methods=['POST'])
def login():
    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        session['username'] = user.username
        # 登录成功
```

### 3. 权限装饰器
```python
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
```

## 扩展建议

- [ ] 邮箱验证
- [ ] 密码重置功能
- [ ] 第三方登录（OAuth）
- [ ] 双因素认证（2FA）
- [ ] 账号锁定机制
- [ ] 密码强度要求
- [ ] JWT Token 认证

## 安全建议

### 生产环境必须：

1. **修改 SECRET_KEY**
```python
app.config['SECRET_KEY'] = 'your-very-secret-random-key-here'
```

2. **使用 HTTPS**
```python
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
```

3. **使用环境变量**
```python
import os
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
```

4. **实施速率限制**
防止暴力破解攻击

5. **使用 CSRF 保护**
保护表单免受跨站请求伪造攻击

## 常见问题

**Q: 如何重置密码？**
A: 当前版本不提供密码重置功能，可以手动清空数据库重新注册

**Q: 如何添加更多用户字段？**
A: 在 User 模型中添加新字段，删除数据库文件重新运行

**Q: Session 过期时间？**
A: 默认7天，可通过 `app.config['PERMANENT_SESSION_LIFETIME']` 修改

**Q: 如何实现"记住我"？**
A: 设置 `session.permanent = True` 并配置超时时间

祝你学习愉快！🚀
