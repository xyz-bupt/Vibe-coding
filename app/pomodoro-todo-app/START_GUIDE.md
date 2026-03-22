# 🚀 启动指南

## 快速启动（3步）

### 1️⃣ 安装依赖
```bash
cd /Users/abc/Vibe-coding/app/pomodoro-todo-app
npm install
```

### 2️⃣ 启动开发服务器
```bash
npm run dev
```

### 3️⃣ 打开浏览器
访问: **http://localhost:5173**

---

## 📋 详细说明

### 可用的命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装所有依赖包 |
| `npm run dev` | 启动开发服务器（带热更新） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run type-check` | TypeScript类型检查 |

### 开发模式特性
✅ **热更新** - 代码修改自动刷新
✅ **快速构建** - Vite提供极快的启动速度
✅ **TypeScript** - 实时类型检查
✅ **本地服务** - http://localhost:5173

---

## ⚠️ 可能遇到的问题

### 问题1: npm install 失败
**解决方案**:
```bash
# 清理缓存后重试
rm -rf node_modules package-lock.json
npm install
```

### 问题2: 端口被占用
**解决方案**:
```bash
# 使用其他端口
npm run dev -- --port 3000
```

### 问题3: TypeScript错误
**解决方案**:
```bash
# 先运行类型检查
npm run type-check
```

---

## 🎯 首次使用建议

1. **安装依赖** - 只需运行一次
2. **启动开发服务器** - `npm run dev`
3. **浏览器访问** - http://localhost:5173
4. **开始使用** - 尝试添加任务，启动番茄钟

---

## 📱 功能测试清单

启动后可以测试：

- ✅ 创建新任务
- ✅ 设置番茄钟（25分钟）
- ✅ 启动/暂停计时器
- ✅ 完成一个番茄钟
- ✅ 查看统计数据
- ✅ 修改设置
- ✅ 切换深色/浅色主题

---

**准备好了吗？运行 `npm run dev` 开始使用吧！** 🚀
