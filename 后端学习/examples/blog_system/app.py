"""
完整的博客系统示例
包含用户认证、文章管理、评论功能
演示 Flask Web 应用的完整开发流程
"""

from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps

# 创建应用
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库
db = SQLAlchemy(app)

# ============== 数据库模型 ==============
class User(db.Model):
    """用户模型"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    avatar = db.Column(db.String(200), default='default.jpg')
    bio = db.Column(db.Text)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    # 关系：一个用户有多篇文章
    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """设置密码哈希"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)

class Post(db.Model):
    """文章模型"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    summary = db.Column(db.String(300))
    published = db.Column(db.Boolean, default=False)
    views = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # 外键：每篇文章属于一个用户
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 关系：一篇文章有多个评论
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')

class Comment(db.Model):
    """评论模型"""
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    # 外键
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)

# ============== 辅助函数 ==============
def login_required(f):
    """登录验证装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('请先登录', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """管理员权限装饰器"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('请先登录', 'warning')
            return redirect(url_for('login'))
        if not session.get('is_admin'):
            flash('需要管理员权限', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# ============== 路由：认证 ==============
@app.route('/')
def index():
    """首页：显示已发布的文章"""
    page = request.args.get('page', 1, type=int)
    per_page = 5

    pagination = Post.query.filter_by(
        published=True
    ).order_by(
        Post.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    return render_template('index.html', posts=pagination)

@app.route('/register', methods=['GET', 'POST'])
def register():
    """用户注册"""
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # 验证
        if not all([username, email, password, confirm_password]):
            flash('请填写所有字段', 'warning')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('两次密码不一致', 'danger')
            return redirect(url_for('register'))

        if len(password) < 6:
            flash('密码长度至少6位', 'danger')
            return redirect(url_for('register'))

        # 检查用户名和邮箱是否存在
        if User.query.filter_by(username=username).first():
            flash('用户名已存在', 'danger')
            return redirect(url_for('register'))

        if User.query.filter_by(email=email).first():
            flash('邮箱已被注册', 'danger')
            return redirect(url_for('register'))

        # 创建用户
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash('注册成功！请登录', 'success')
        return redirect(url_for('login'))

    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """用户登录"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['is_admin'] = user.is_admin
            flash(f'欢迎回来，{user.username}！', 'success')
            return redirect(url_for('index'))
        else:
            flash('用户名或密码错误', 'danger')

    return render_template('auth/login.html')

@app.route('/logout')
def logout():
    """退出登录"""
    session.clear()
    flash('已退出登录', 'info')
    return redirect(url_for('index'))

# ============== 路由：文章 ==============
@app.route('/post/<int:post_id>')
def post_detail(post_id):
    """文章详情"""
    post = Post.query.get_or_404(post_id)

    # 增加阅读量
    post.views += 1
    db.session.commit()

    # 获取评论
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()

    return render_template('post/detail.html', post=post, comments=comments)

@app.route('/post/create', methods=['GET', 'POST'])
@login_required
def create_post():
    """创建文章"""
    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        summary = request.form.get('summary')
        published = request.form.get('published') == 'on'

        if not title or not content:
            flash('标题和内容不能为空', 'warning')
            return redirect(url_for('create_post'))

        post = Post(
            title=title,
            content=content,
            summary=summary,
            published=published,
            user_id=session['user_id']
        )

        db.session.add(post)
        db.session.commit()

        flash('文章创建成功', 'success')
        return redirect(url_for('post_detail', post_id=post.id))

    return render_template('post/create.html')

@app.route('/post/<int:post_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    """编辑文章"""
    post = Post.query.get_or_404(post_id)

    # 检查权限
    if post.user_id != session['user_id'] and not session.get('is_admin'):
        flash('你没有权限编辑这篇文章', 'danger')
        return redirect(url_for('post_detail', post_id=post_id))

    if request.method == 'POST':
        post.title = request.form.get('title')
        post.content = request.form.get('content')
        post.summary = request.form.get('summary')
        post.published = request.form.get('published') == 'on'

        db.session.commit()
        flash('文章更新成功', 'success')
        return redirect(url_for('post_detail', post_id=post.id))

    return render_template('post/edit.html', post=post)

@app.route('/post/<int:post_id>/delete', methods=['POST'])
@login_required
def delete_post(post_id):
    """删除文章"""
    post = Post.query.get_or_404(post_id)

    # 检查权限
    if post.user_id != session['user_id'] and not session.get('is_admin'):
        flash('你没有权限删除这篇文章', 'danger')
        return redirect(url_for('post_detail', post_id=post_id))

    db.session.delete(post)
    db.session.commit()
    flash('文章已删除', 'success')
    return redirect(url_for('index'))

# ============== 路由：评论 ==============
@app.route('/post/<int:post_id>/comment', methods=['POST'])
@login_required
def add_comment(post_id):
    """添加评论"""
    post = Post.query.get_or_404(post_id)
    content = request.form.get('content')

    if not content:
        flash('评论内容不能为空', 'warning')
        return redirect(url_for('post_detail', post_id=post_id))

    comment = Comment(
        content=content,
        user_id=session['user_id'],
        post_id=post_id
    )

    db.session.add(comment)
    db.session.commit()

    flash('评论发表成功', 'success')
    return redirect(url_for('post_detail', post_id=post_id))

# ============== 路由：用户 ==============
@app.route('/user/<username>')
def user_profile(username):
    """用户资料"""
    user = User.query.filter_by(username=username).first_or_404()
    posts = Post.query.filter_by(user_id=user.id, published=True).order_by(Post.created_at.desc()).all()

    return render_template('user/profile.html', user=user, posts=posts)

@app.route('/profile')
@login_required
def my_profile():
    """我的资料"""
    user = User.query.get_or_404(session['user_id'])
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()

    return render_template('user/profile.html', user=user, posts=posts)

# ============== 路由：管理后台 ==============
@app.route('/admin')
@admin_required
def admin_dashboard():
    """管理后台"""
    total_users = User.query.count()
    total_posts = Post.query.count()
    total_comments = Comment.query.count()
    published_posts = Post.query.filter_by(published=True).count()

    recent_posts = Post.query.order_by(Post.created_at.desc()).limit(5).all()
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()

    return render_template('admin/dashboard.html',
                         total_users=total_users,
                         total_posts=total_posts,
                         total_comments=total_comments,
                         published_posts=published_posts,
                         recent_posts=recent_posts,
                         recent_users=recent_users)

@app.route('/admin/posts')
@admin_required
def admin_posts():
    """文章管理"""
    page = request.args.get('page', 1, type=int)
    pagination = Post.query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=10, error_out=False
    )
    return render_template('admin/posts.html', pagination=pagination)

@app.route('/admin/users')
@admin_required
def admin_users():
    """用户管理"""
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html', users=users)

# ============== 初始化 ==============
def init_db():
    """初始化数据库"""
    with app.app_context():
        db.create_all()

        # 创建管理员账号
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                is_admin=True,
                bio='系统管理员'
            )
            admin.set_password('admin123')
            db.session.add(admin)

            # 创建示例文章
            post1 = Post(
                title='欢迎来到博客系统',
                content='这是第一篇文章。你可以注册账号后发布自己的文章。',
                summary='博客系统欢迎你',
                published=True,
                user_id=admin.id
            )
            post2 = Post(
                title='如何使用这个博客',
                content='这个博客系统使用 Flask 开发，包含用户认证、文章发布、评论等功能。',
                summary='使用指南',
                published=True,
                user_id=admin.id
            )
            db.session.add_all([post1, post2])
            db.session.commit()

            print("✓ 数据库初始化完成")
            print("✓ 管理员账号：admin / admin123")

# ============== 启动应用 ==============
if __name__ == '__main__':
    init_db()
    print("\n" + "="*50)
    print("博客系统启动成功！")
    print("访问地址：http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
