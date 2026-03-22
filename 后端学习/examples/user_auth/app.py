"""
用户认证系统示例
演示完整的用户认证功能，包括注册、登录、密码重置等
"""

from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auth.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

db = SQLAlchemy(app)

# ============== 数据库模型 ==============
class User(db.Model):
    """用户模型"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    last_login = db.Column(db.DateTime)

    def set_password(self, password):
        """设置密码（使用哈希）"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)

class LoginLog(db.Model):
    """登录日志"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(200))
    login_time = db.Column(db.DateTime, default=datetime.now)
    success = db.Column(db.Boolean, default=True)

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

def log_login(user, success, ip_address, user_agent):
    """记录登录日志"""
    log = LoginLog(
        user_id=user.id,
        success=success,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.session.add(log)
    db.session.commit()

# ============== 路由 ==============
@app.route('/')
def index():
    """首页"""
    if 'user_id' in session:
        return render_template('dashboard.html', username=session.get('username'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """用户注册"""
    if request.method == 'POST':
        # 获取表单数据
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # 验证数据
        error = None

        if not username or len(username) < 3:
            error = '用户名长度至少3个字符'
        elif not email or '@' not in email:
            error = '请输入有效的邮箱地址'
        elif not password or len(password) < 6:
            error = '密码长度至少6个字符'
        elif password != confirm_password:
            error = '两次输入的密码不一致'
        elif User.query.filter_by(username=username).first():
            error = '用户名已存在'
        elif User.query.filter_by(email=email).first():
            error = '邮箱已被注册'

        if error:
            flash(error, 'danger')
            return redirect(url_for('register'))

        # 创建用户
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash('注册成功！请登录', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """用户登录"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember')

        user = User.query.filter_by(username=username).first()

        # 获取客户端信息
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')

        if user and user.check_password(password):
            # 检查账号是否激活
            if not user.is_active:
                flash('账号已被禁用，请联系管理员', 'danger')
                return redirect(url_for('login'))

            # 设置 Session
            session['user_id'] = user.id
            session['username'] = user.username
            session['is_admin'] = user.is_admin

            # 记住我
            if remember:
                session.permanent = True

            # 更新最后登录时间
            user.last_login = datetime.now()
            db.session.commit()

            # 记录登录日志
            log_login(user, True, ip_address, user_agent)

            flash(f'欢迎回来，{user.username}！', 'success')
            return redirect(url_for('dashboard'))
        else:
            # 记录失败的登录尝试
            if user:
                log_login(user, False, ip_address, user_agent)

            flash('用户名或密码错误', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    """退出登录"""
    username = session.get('username')
    session.clear()
    flash(f'{username}，再见！', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """用户仪表板"""
    # 获取用户信息
    user = User.query.get(session['user_id'])

    # 获取登录历史
    login_logs = LoginLog.query.filter_by(user_id=user.id)\
        .order_by(LoginLog.login_time.desc()).limit(10).all()

    return render_template('dashboard.html',
                         user=user,
                         login_logs=login_logs)

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """个人资料"""
    user = User.query.get(session['user_id'])

    if request.method == 'POST':
        # 更新邮箱
        new_email = request.form.get('email')
        if new_email and new_email != user.email:
            if User.query.filter_by(email=new_email).first():
                flash('邮箱已被使用', 'danger')
            else:
                user.email = new_email
                flash('邮箱更新成功', 'success')

        db.session.commit()
        return redirect(url_for('profile'))

    return render_template('profile.html', user=user)

@app.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    """修改密码"""
    if request.method == 'POST':
        old_password = request.form.get('old_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        user = User.query.get(session['user_id'])

        # 验证旧密码
        if not user.check_password(old_password):
            flash('原密码错误', 'danger')
            return redirect(url_for('change_password'))

        # 验证新密码
        if len(new_password) < 6:
            flash('新密码长度至少6个字符', 'danger')
            return redirect(url_for('change_password'))

        if new_password != confirm_password:
            flash('两次输入的新密码不一致', 'danger')
            return redirect(url_for('change_password'))

        # 更新密码
        user.set_password(new_password)
        db.session.commit()

        flash('密码修改成功，请重新登录', 'success')
        return redirect(url_for('logout'))

    return render_template('change_password.html')

# ============== 管理员路由 ==============
@app.route('/admin/users')
@admin_required
def admin_users():
    """用户管理"""
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html', users=users)

@app.route('/admin/user/<int:user_id>/toggle', methods=['POST'])
@admin_required
def toggle_user(user_id):
    """切换用户激活状态"""
    user = User.query.get_or_404(user_id)

    # 不能禁用自己
    if user.id == session['user_id']:
        flash('不能禁用自己的账号', 'warning')
        return redirect(url_for('admin_users'))

    user.is_active = not user.is_active
    db.session.commit()

    status = '激活' if user.is_active else '禁用'
    flash(f'已{status}用户 {user.username}', 'success')
    return redirect(url_for('admin_users'))

@app.route('/admin/user/<int:user_id>/toggle-admin', methods=['POST'])
@admin_required
def toggle_admin(user_id):
    """切换管理员权限"""
    user = User.query.get_or_404(user_id)

    # 不能取消自己的管理员权限
    if user.id == session['user_id']:
        flash('不能取消自己的管理员权限', 'warning')
        return redirect(url_for('admin_users'))

    user.is_admin = not user.is_admin
    db.session.commit()

    status = '授予' if user.is_admin else '取消'
    flash(f'已{status} {user.username} 的管理员权限', 'success')
    return redirect(url_for('admin_users'))

@app.route('/admin/logs')
@admin_required
def admin_logs():
    """登录日志"""
    logs = LoginLog.query.order_by(LoginLog.login_time.desc()).limit(100).all()
    return render_template('admin/logs.html', logs=logs)

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
                is_admin=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

            print("✓ 数据库初始化完成")
            print("✓ 管理员账号：admin / admin123")

# ============== 启动应用 ==============
if __name__ == '__main__':
    init_db()
    print("\n" + "="*50)
    print("用户认证系统启动成功！")
    print("访问地址：http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)
