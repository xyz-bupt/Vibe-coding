# Hello World - Flask 入门示例

这是最简单的 Flask 应用示例，适合初学者学习。

## 运行步骤

### 1. 创建虚拟环境（推荐）

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 运行应用

```bash
python app.py
```

### 4. 访问应用

打开浏览器访问：`http://localhost:5000`

## 页面说明

- **首页** `http://localhost:5000/` - 欢迎页面
- **关于** `http://localhost:5000/about` - 项目介绍
- **用户** `http://localhost:5000/user/你的名字` - 动态路由示例
- **API** `http://localhost:5000/api/data` - JSON API 示例

## 代码结构

```
hello_world/
├── app.py              # 主应用文件
├── requirements.txt    # 依赖列表
└── README.md          # 说明文件
```

## 学习要点

1. **Flask 实例**：`app = Flask(__name__)`
2. **路由装饰器**：`@app.route('/')`
3. **视图函数**：返回 HTML 或 JSON
4. **动态路由**：`@app.route('/user/<username>')`
5. **调试模式**：`app.run(debug=True)`

## 下一步

完成这个示例后，继续学习：
- 模板系统（Jinja2）
- 数据库操作（SQLAlchemy）
- 表单处理
- 用户认证

祝你学习愉快！🚀
