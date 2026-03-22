# Flask 简介与安装

## 本章学习目标

完成本章后，你将能够：
- 理解什么是 Flask 以及它的设计理念
- 了解 Flask 与其他 Web 框架的区别
- 搭建完整的 Flask 开发环境
- 编写并运行第一个 Flask 应用程序
- 理解 Flask 项目的基本目录结构

## 什么是 Flask？

### Flask 的定义

Flask 是一个用 Python 编写的轻量级 Web 应用框架。它被称为"微框架"（microframework），因为它：

- **核心简单**：保持核心功能精简，只包含最基本的功能
- **灵活扩展**：可以根据需求选择各种扩展
- **易于上手**：简单的 API 设计，学习曲线平缓
- **高度自由**：不强制特定的项目结构或数据库选择

### Flask 的特点

#### 1. 轻量级
```python
# 最小的 Flask 应用只需要 5 行代码！
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run()
```

#### 2. 灵活性强
- 你可以选择任何数据库（SQLite、MySQL、PostgreSQL 等）
- 你可以选择任何模板引擎（默认使用 Jinja2）
- 你可以自由组织项目结构

#### 3. 开发效率高
- 内置开发服务器和调试器
- 支持 RESTful 请求分发
- 模板系统（Jinja2）强大且易用
- 丰富的第三方扩展

#### 4. 生产就绪
虽然 Flask 是"微框架"，但它完全适合生产环境：
- LinkedIn、Pinterest、Netflix 等大公司都在使用
- 活跃的社区支持
- 成熟的安全机制

## Flask vs 其他框架

### Flask vs Django

| 特性 | Flask | Django |
|------|-------|--------|
| **类型** | 微框架 | 全栈框架 |
| **学习曲线** | 平缓 | 陡峭 |
| **灵活性** | 高 | 中等 |
| **内置功能** | 基础功能 | 功能齐全（ORM、Admin、认证等） |
| **项目结构** | 自由组织 | 强制结构 |
| **适用场景** | 中小型项目、微服务、API | 快速开发内容驱动的网站 |
| **性能** | 轻量快速 | 相对较重 |
| **最佳选择** | 需要灵活性和定制化 | 需要快速开发标准应用 |

**选择 Flask 的场景**：
- 想要完全控制项目的每个组件
- 构建微服务或 API
- 学习 Web 开发的底层原理
- 需要灵活的技术栈选择

**选择 Django 的场景**：
- 需要快速开发标准 CRUD 应用
- 团队已经熟悉 Django
- 需要内置的管理后台
- 不想花时间选择技术栈

### Flask vs FastAPI

| 特性 | Flask | FastAPI |
|------|-------|---------|
| **异步支持** | 需要额外配置 | 原生支持异步 |
| **类型提示** | 可选 | 强制使用（利用 Python 类型提示）|
| **自动文档** | 需要手动实现 | 自动生成 API 文档 |
| **性能** | 同步，较慢 | 异步，更快 |
| **成熟度** | 非常成熟 | 相对较新 |
| **学习曲线** | 平缓 | 需要理解异步编程 |

**何时选择 FastAPI**：
- 构建高性能 API
- 需要异步处理（如大量 I/O 操作）
- 团队熟悉现代 Python 特性

**何时选择 Flask**：
- 构建传统 Web 应用（需要模板渲染）
- 团队更熟悉同步编程
- 需要更多成熟的扩展和社区资源

### Flask vs Express.js (Node.js)

| 特性 | Flask | Express.js |
|------|-------|------------|
| **语言** | Python | JavaScript/TypeScript |
| **异步模型** | 同步为主 | 原生异步 |
| **生态系统** | PyPI | npm |
| **性能** | 较好 | 更好（非阻塞 I/O）|
| **学习曲线** | 平缓 | 中等 |

## 环境搭建

### 第一步：安装 Python

Flask 需要 Python 3.8 或更高版本。

**检查 Python 版本**：
```bash
python --version
# 或
python3 --version
```

**如果未安装 Python**：

**macOS**：
```bash
# 使用 Homebrew 安装
brew install python
```

**Windows**：
1. 访问 [python.org](https://www.python.org/downloads/)
2. 下载并安装 Python 3.x
3. 安装时勾选 "Add Python to PATH"

**Linux**：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# CentOS/RHEL
sudo yum install python3 python3-pip
```

### 第二步：创建项目目录

```bash
# 创建项目文件夹
mkdir ~/flask-tutorial
cd ~/flask-tutorial
```

### 第三步：创建虚拟环境

虚拟环境可以为每个项目创建独立的 Python 环境，避免依赖冲突。

**为什么需要虚拟环境？**
```
项目 A 需要 Flask 2.0
项目 B 需要 Flask 3.0
→ 如果不使用虚拟环境，会产生冲突！
```

**创建虚拟环境**：

```bash
# macOS/Linux
python3 -m venv venv

# Windows
python -m venv venv
```

**激活虚拟环境**：

```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

激活后，你的命令行提示符会显示 `(venv)`，表示虚拟环境已激活。

**退出虚拟环境**：
```bash
deactivate
```

### 第四步：安装 Flask

```bash
# 确保虚拟环境已激活
pip install flask
```

**验证安装**：
```bash
python -c "import flask; print(flask.__version__)"
```

如果输出了版本号（如 `3.0.0`），说明安装成功！

**安装常用扩展（可选）**：
```bash
# 数据库 ORM
pip install flask-sqlalchemy

# 数据库迁移工具
pip install flask-migrate

# 表单验证
pip install flask-wtf

# 用户认证
pip install flask-login

# RESTful API
pip install flask-restful
```

### 第五步：创建 requirements.txt

在实际项目中，我们应该记录所有依赖：

```bash
pip freeze > requirements.txt
```

这会创建一个 `requirements.txt` 文件，内容类似：

```
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Werkzeug==3.0.1
```

**在新的环境中安装依赖**：
```bash
pip install -r requirements.txt
```

## 第一个 Hello World 程序

让我们创建第一个 Flask 应用！

### 步骤 1：创建应用文件

```bash
# 在项目目录中创建 app.py
touch app.py
```

### 步骤 2：编写代码

将以下代码写入 `app.py`：

```python
# 从 flask 模块导入 Flask 类
from flask import Flask

# 创建 Flask 应用实例
# __name__ 是 Python 的特殊变量，代表当前模块的名称
# Flask 使用它来确定应用的根目录
app = Flask(__name__)

# 使用 route() 装饰器告诉 Flask 什么样的 URL 能触发我们的函数
@app.route('/')
def hello_world():
    """
    当访问根路径 / 时，执行这个函数
    函数的返回值将作为响应发送给浏览器
    """
    return '你好，Flask！这是我的第一个 Web 应用。'

# 只有直接运行这个文件时，才启动开发服务器
# if __name__ == '__main__' 确保在被导入时不会启动服务器
if __name__ == '__main__':
    # run() 方法启动 Flask 内置的开发服务器
    # debug=True 启用调试模式（代码修改后自动重载，出错时显示调试信息）
    app.run(debug=True, port=5000)
```

### 步骤 3：运行应用

```bash
python app.py
```

你应该看到类似这样的输出：

```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
```

### 步骤 4：访问应用

打开浏览器，访问：`http://127.0.0.1:5000` 或 `http://localhost:5000`

你应该看到：
```
你好，Flask！这是我的第一个 Web 应用。
```

**恭喜！你已经成功运行了第一个 Flask 应用！** 🎉

## 代码详解

让我们逐行理解这个程序：

### 1. 导入 Flask
```python
from flask import Flask
```
从 flask 包中导入 Flask 类。Flask 类是我们的应用的核心。

### 2. 创建应用实例
```python
app = Flask(__name__)
```
- `Flask` 类实例化创建我们的应用
- `__name__` 参数帮助 Flask 确定：
  - 应用的根目录（用于查找模板和静态文件）
  - 应用的位置（用于调试）

### 3. 定义路由
```python
@app.route('/')
def hello_world():
    return '你好，Flask！'
```

- `@app.route('/')` 是一个装饰器
- 它告诉 Flask：当用户访问 URL `/` 时，调用下面的函数
- 这个函数称为**视图函数**（View Function）
- 视图函数的返回值会作为 HTTP 响应发送给浏览器

### 4. 运行应用
```python
if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

- `if __name__ == '__main__'`：确保只有直接运行文件时才启动服务器
- `app.run()`：启动开发服务器
- `debug=True`：启用调试模式
  - 代码修改后自动重载
  - 出错时显示详细的调试信息
  - **注意：生产环境中不要使用 debug=True**
- `port=5000`：指定端口号（默认 5000）

## 路由进阶：多个页面

让我们添加更多页面：

```python
from flask import Flask

app = Flask(__name__)

# 首页
@app.route('/')
def home():
    return '<h1>欢迎来到首页</h1><p>这是我的 Flask 应用</p>'

# 关于页面
@app.route('/about')
def about():
    return '<h1>关于我们</h1><p>这是一个学习 Flask 的示例项目</p>'

# 用户页面
@app.route('/user/<username>')
def user_profile(username):
    return f'<h1>用户资料</h1><p>欢迎，{username}！</p>'

if __name__ == '__main__':
    app.run(debug=True)
```

现在你可以访问：
- `http://localhost:5000/` - 首页
- `http://localhost:5000/about` - 关于页面
- `http://localhost:5000/user/zhangsan` - 用户页面（zhangsan 可以是任何用户名）

## 目录结构说明

### 最简单的项目结构

```
flask-tutorial/
├── app.py              # 主应用文件
└── venv/               # 虚拟环境（不要修改）
```

### 推荐的小型项目结构

```
flask-project/
├── app.py              # 应用入口
├── config.py           # 配置文件
├── requirements.txt    # 依赖列表
├── venv/              # 虚拟环境
├── static/            # 静态文件（CSS、JS、图片）
│   ├── css/
│   ├── js/
│   └── images/
└── templates/         # HTML 模板
    ├── base.html
    ├── index.html
    └── about.html
```

### 大型项目结构（使用蓝图）

```
large-flask-project/
├── app.py                    # 应用入口
├── config.py                 # 配置
├── requirements.txt          # 依赖
├── .env                      # 环境变量
├── instance/                 # 实例配置
│   └── config.py
├── app/
│   ├── __init__.py          # 应用工厂
│   ├── models.py            # 数据库模型
│   ├── auth/                # 认证蓝图
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   └── forms.py
│   ├── blog/                # 博客蓝图
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   └── forms.py
│   ├── templates/           # 模板
│   │   ├── base.html
│   │   ├── auth/
│   │   └── blog/
│   └── static/              # 静态文件
│       ├── css/
│       ├── js/
│       └── images/
├── migrations/              # 数据库迁移
└── tests/                   # 测试
    ├── __init__.py
    ├── test_auth.py
    └── test_blog.py
```

## 常见问题

### Q1: 端口 5000 已被占用怎么办？

**方法 1**：使用其他端口
```python
app.run(debug=True, port=8000)
```

**方法 2**：找到并关闭占用端口的进程
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Q2: 如何停止 Flask 应用？

在命令行中按 `Ctrl + C`

### Q3: 虚拟环境激活失败？

**Windows 问题**：
```powershell
# 如果出现无法运行脚本的问题，执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**macOS/Linux 问题**：
```bash
# 确保有执行权限
chmod +x venv/bin/activate
```

### Q4: ImportError: No module named 'flask'

确保：
1. 虚拟环境已激活
2. 在虚拟环境中安装了 Flask
```bash
# 检查是否在虚拟环境中（应该看到 (venv)）
which python

# 重新安装 Flask
pip install flask
```

### Q5: 修改代码后页面没有变化？

1. 确保启用了调试模式 `debug=True`
2. 检查浏览器缓存（尝试强制刷新：Ctrl+F5）
3. 确认重启了服务器（debug 模式下应该自动重启）

## 最佳实践

### 1. 始终使用虚拟环境
```bash
# 每个项目都创建独立的虚拟环境
python -m venv venv
source venv/bin/activate  # 激活
```

### 2. 使用 requirements.txt 管理依赖
```bash
pip install flask
pip freeze > requirements.txt
```

### 3. 永远不要在生产环境使用 debug=True
```python
if __name__ == '__main__':
    # 开发环境
    app.run(debug=True)

# 生产环境使用 Gunicorn 等
# gunicorn -w 4 app:app
```

### 4. 使用 .gitignore 排除不必要的文件

创建 `.gitignore` 文件：
```
venv/
__pycache__/
*.pyc
instance/
.pytest_cache/
.coverage
htmlcov/
.env
```

### 5. 为项目编写 README.md

包括：
- 项目介绍
- 安装步骤
- 运行方法
- 依赖说明

### 6. 使用有意义的变量和函数名
```python
# 好的命名
def get_user_by_id(user_id):
    pass

# 不好的命名
def get_user(uid):
    pass
```

## 练习

### 练习 1：创建个人介绍页面

创建一个 Flask 应用，包含以下路由：
- `/` - 首页，显示你的名字
- `/about` - 关于页面，显示你的爱好
- `/contact` - 联系页面，显示你的邮箱

**提示**：使用 HTML 标签让页面更美观

<details>
<summary>查看答案</summary>

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <h1>欢迎来到我的网站</h1>
    <p>我是张三，一名 Python 开发者</p>
    <a href="/about">关于我</a> | <a href="/contact">联系方式</a>
    '''

@app.route('/about')
def about():
    return '''
    <h1>关于我</h1>
    <p>我的爱好：</p>
    <ul>
        <li>编程</li>
        <li>阅读</li>
        <li>旅行</li>
    </ul>
    <a href="/">返回首页</a>
    '''

@app.route('/contact')
def contact():
    return '''
    <h1>联系方式</h1>
    <p>邮箱：zhangsan@example.com</p>
    <p>微信：zhangsan123</p>
    <a href="/">返回首页</a>
    '''

if __name__ == '__main__':
    app.run(debug=True)
```
</details>

### 练习 2：动态路由

创建一个路由 `/square/<number>`，返回该数字的平方。

<details>
<summary>查看答案</summary>

```python
from flask import Flask

app = Flask(__name__)

@app.route('/square/<int:number>')
def square(number):
    return f'<h1>{number} 的平方是 {number ** 2}</h1>'

if __name__ == '__main__':
    app.run(debug=True)
```
</details>

### 练习 3：添加 CSS 样式

为练习 1 的页面添加简单的内联 CSS 样式（如颜色、字体、居中等）。

## 总结

在本章中，你学习了：

✅ Flask 是什么以及它的特点
✅ Flask 与其他框架的比较
✅ 如何搭建 Flask 开发环境
✅ 如何创建和运行第一个 Flask 应用
✅ Flask 的基本代码结构
✅ 常见问题的解决方法
✅ 最佳实践建议

## 下一步

在下一章《基础概念》中，我们将深入学习：
- 路由的详细使用
- HTTP 方法（GET、POST 等）
- URL 变量和规则
- 请求和响应对象
- 模板渲染

准备好了吗？让我们继续学习！🚀
