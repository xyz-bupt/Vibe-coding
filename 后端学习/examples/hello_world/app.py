"""
最简单的 Flask 应用示例
这是学习 Flask 的第一个程序
"""

from flask import Flask

# 创建 Flask 应用实例
app = Flask(__name__)

# 定义路由和视图函数
@app.route('/')
def hello_world():
    """首页：返回欢迎消息"""
    return '''
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>我的第一个 Flask 应用</title>
        <style>
            body {
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }
            h1 {
                font-size: 2.5em;
                margin-bottom: 20px;
            }
            p {
                font-size: 1.2em;
                line-height: 1.6;
            }
            .links {
                margin-top: 30px;
            }
            .links a {
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                background: white;
                color: #667eea;
                text-decoration: none;
                border-radius: 5px;
                transition: transform 0.3s;
            }
            .links a:hover {
                transform: scale(1.05);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 恭喜你！</h1>
            <p>你已经成功运行了第一个 Flask 应用！</p>
            <p>这是一个用 Python 构建的 Web 应用，使用了 Flask 框架。</p>
            <div class="links">
                <a href="/about">关于我们</a>
                <a href="/user/张三">用户示例</a>
                <a href="/api/data">API 示例</a>
            </div>
        </div>
    </body>
    </html>
    '''

@app.route('/about')
def about():
    """关于页面"""
    return '''
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <title>关于我们</title>
        <style>
            body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
            a { color: #667eea; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>关于这个项目</h1>
        <p>这是一个 Flask 学习项目，帮助你掌握 Web 开发基础。</p>
        <h2>技术栈</h2>
        <ul>
            <li>Python 3.x</li>
            <li>Flask 3.x</li>
            <li>HTML/CSS</li>
        </ul>
        <a href="/">返回首页</a>
    </body>
    </html>
    '''

@app.route('/user/<username>')
def user_profile(username):
    """用户资料页面 - 动态路由示例"""
    return f'''
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <title>用户资料</title>
        <style>
            body {{ font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }}
            .profile {{ background: #f0f0f0; padding: 20px; border-radius: 10px; }}
            a {{ color: #667eea; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="profile">
            <h1>用户资料</h1>
            <p><strong>用户名：</strong>{username}</p>
            <p><strong>状态：</strong>在线</p>
            <p><strong>加入时间：</strong>2024年</p>
        </div>
        <a href="/">返回首页</a>
    </body>
    </html>
    '''

@app.route('/api/data')
def api_data():
    """API 示例 - 返回 JSON 数据"""
    from flask import jsonify
    data = {
        'message': '这是一个 API 响应',
        'status': 'success',
        'data': {
            'id': 1,
            'name': 'Flask 教程',
            'category': 'Web 开发',
            'tags': ['Python', 'Flask', 'Web']
        }
    }
    return jsonify(data)

# 启动应用
if __name__ == '__main__':
    # debug=True 启用调试模式
    # 代码修改后自动重载
    # 出错时显示调试信息
    app.run(debug=True, port=5000)
