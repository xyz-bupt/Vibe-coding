# Code City 3D

将你的本地代码仓库可视化为一座赛博朋克风格的 3D 城市。

纯浏览器端运行，无需后端服务器——所有代码分析、3D 渲染和交互都在浏览器中完成。

---

## 效果预览

- 入口文件（index.js / main.js）→ 圆柱塔楼 + 顶部天线
- 组件文件（components 目录）→ 多个方块错落堆叠
- 普通文件 → 标准方块建筑
- 文件依赖 → 发光光束连接，光子穿梭动画
- 最近修改的文件 → 高频呼吸发光
- 核心依赖文件（被 5+ 文件引用）→ 旋转数据星环
- 全息悬浮文件名招牌

---

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 + Vite 8 | 前端框架与构建工具 |
| Three.js + @react-three/fiber | 3D 渲染 |
| @react-three/drei | Text 标签、OrbitControls 等辅助组件 |
| @react-three/postprocessing | Bloom / Vignette / ChromaticAberration 后期特效 |
| Tailwind CSS v4 | UI 样式 |

---

## 项目结构

```
code-city-3d/
├── src/
│   ├── components/
│   │   ├── UI/
│   │   │   ├── DropZone.jsx          # 赛博朋克风格入口页（说明 + 图例 + 按钮）
│   │   │   ├── Inspector.jsx         # 右侧代码详情面板
│   │   │   └── LinkInspector.jsx     # 依赖连线详情面板
│   │   └── City3D/
│   │       ├── Scene.jsx             # 3D 场景（Canvas + 光源 + 雾 + 后期特效 + 摄像机飞行）
│   │       ├── Building.jsx          # 建筑渲染（程序化窗户纹理 + 三种建筑形态 + 呼吸光效 + 全息招牌 + 数据环）
│   │       ├── Ground.jsx            # 赛博朋克网格地面
│   │       └── DataLinks.jsx         # 依赖关系光束 + 光子动画
│   ├── core/
│   │   ├── fileSystem.js             # showDirectoryPicker 递归读取本地文件
│   │   ├── astParser.js              # 正则提取代码特征（行数/函数/类/依赖）
│   │   └── colorMap.js               # 文件类型 → 颜色映射
│   ├── hooks/
│   │   └── useCityLayout.js          # AST 数据 → 3D 坐标（螺旋布局 + 网格布局）
│   ├── App.jsx                       # 主应用入口
│   ├── main.jsx                      # React 挂载
│   └── index.css                     # Tailwind v4
├── vite.config.js
└── index.html
```

---

## 数据流

```
用户点击 SELECT FOLDER → 选择本地文件夹
  ↓
fileSystem.js: showDirectoryPicker() 递归读取源码文件
  ↓
astParser.js: 正则提取特征（行数 / 函数数 / 类数 / import 语句 / lastModified）
  ↓
useCityLayout.js: 生成 3D 坐标
  ├── 按目录分簇为 Block
  ├── Block 中心使用螺旋布局
  ├── Block 内部使用网格布局
  └── 解析依赖关系 → targets / targetedBy
  ↓
CityScene → Building 组件渲染每栋建筑
  ↓
用户交互（悬停 / 点击 / 旋转 / 缩放）
```

---

## 核心特性

### 1. 程序化窗户纹理

每栋建筑使用离屏 Canvas 生成 256x256 程序化纹理：
- 深灰背景 + 8×16 网格窗户
- 30% 窗户随机亮起（颜色取自文件类型色 + 青色 + 黄色）
- 纹理同时应用到 `map` 和 `emissiveMap`，产生自发光窗户效果
- 材质使用 `MeshPhysicalMaterial`（metalness: 0.8, roughness: 0.2）

### 2. 建筑形态映射

| 文件类型 | 建筑形态 |
|----------|----------|
| 入口文件（index.*/main.*/App.jsx） | 圆柱塔楼 + 顶部光环 + 天线杆 + 发光顶球 |
| 组件文件（路径含 component） | 3-5 个大小不一的方块错落堆叠 |
| 其他普通文件 | 标准方块建筑 |

### 3. 文件类型颜色

| 扩展名 | 颜色 |
|--------|------|
| `.ts` / `.tsx` | TypeScript 蓝 `#3178c6` |
| `.js` / `.jsx` | JavaScript 黄 `#f7df1e` |
| `.css` | 粉紫 `#ff00ff` |

颜色应用到材质的 `emissive` 和建筑边缘线条。

### 4. 呼吸光效

基于文件的 `lastModified` 时间戳计算「新鲜度」：

| 新鲜度 | 条件 | 效果 |
|--------|------|------|
| fresh | 24 小时内 | `emissiveIntensity` 在 0.5 ~ 2.0 之间高频呼吸 |
| normal | 1 个月内 | 中等发光（0.4） |
| old | 超过 1 个月 | 暗淡（0.1） |

### 5. 全息招牌

每栋建筑上方悬浮显示文件名：
- 使用 `@react-three/drei` 的 `<Text>` 组件，始终面向摄像机
- 亮青色 `#00ffff`，半透明
- 轻微上下浮动动画（0.2 单位）

### 6. 枢纽文件数据环

被 5 个以上文件引用的核心依赖：
- 建筑中下部套一个水平的 `TorusGeometry`（圆环）
- 透明发光材质
- 绕 Y 轴缓慢旋转

### 7. 依赖光束

- 文件间的 import 关系渲染为抛物线光束（`QuadraticBezierCurve3`）
- 光子（小球）沿曲线飞行，带随机起始偏移
- 点击光束可查看具体的 import 语句

### 8. 后期特效

- **Bloom** — 泛光，让发光元素产生光晕
- **Vignette** — 暗角效果，复古监视器质感
- **ChromaticAberration** — RGB 色差分离，CRT 效果

---

## 快速开始

```bash
npm install
npm run dev
```

1. 浏览器打开 `http://localhost:5173`（端口可能递增）
2. 点击 **SELECT FOLDER** 按钮，选择一个本地代码仓库
3. 等待文件读取和分析完成
4. 页面自动切换为 3D 城市场景
5. 鼠标拖拽旋转、滚轮缩放
6. 点击建筑查看代码详情（Inspector 面板）
7. 点击依赖光束查看 import 语句
8. 点击空白区域取消选中

---

## 浏览器兼容性

需要支持 File System Access API 的现代浏览器：

- Chrome 86+（推荐）
- Edge 86+

---

## 注意事项

- 所有文件读取均在浏览器端完成，不会上传任何数据到服务器
- 代码分析使用正则表达式，对注释中的代码可能存在误判
- 大型仓库（1000+ 文件）可能加载较慢
- `node_modules`、`.git`、`dist` 等目录会被自动忽略
