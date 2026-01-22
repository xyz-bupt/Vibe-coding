# 内存泄漏预防指南

## 快速开始

### 1. 创建新组件

所有需要生命周期管理的组件都应继承 `Component` 基类:

```typescript
import { Component } from '../core/Component';

export class MyComponent extends Component {
  constructor() {
    super();

    // 初始化代码
    this.initialize();
  }

  private initialize(): void {
    // 使用追踪的方法
    this.subscribeEvent('event:name', this.handleEvent.bind(this));
    this.addEventListener(element, 'click', this.handleClick.bind(this));
  }

  private handleEvent(data: any): void {
    // 事件处理
  }

  private handleClick(): void {
    // 点击处理
  }

  // destroy()方法自动继承,会清理所有资源
}
```

### 2. 组件销毁

当不再需要组件时,调用 `destroy()`:

```typescript
const component = new MyComponent();
// ... 使用组件
component.destroy(); // 自动清理所有资源
```

## API 参考

### Component 基类方法

#### 定时器管理

```typescript
// 创建自动清理的setTimeout
this.setTimeout(() => {
  console.log('Executed after 1 second');
}, 1000);

// 创建自动清理的setInterval
const intervalId = this.setInterval(() => {
  console.log('Executed every second');
}, 1000);

// 手动清除定时器
this.clearTimeout(timerId);
this.clearInterval(intervalId);
```

#### 事件监听器管理

```typescript
// DOM事件监听器
this.addEventListener(element, 'click', handler);
this.addEventListener(document, 'keydown', handler);
this.addEventListener(window, 'resize', handler);

// EventEmitter订阅
this.subscribeEvent('task:add', this.handleTaskAdd);
this.subscribeEvent('timer:start', this.handleTimerStart);
```

#### Fetch请求管理

```typescript
// 创建可取消的fetch
const controller = this.createAbortController();

fetch('/api/data', {
  signal: controller.signal
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
    }
  });

// 取消请求
controller.abort();
// destroy()时自动取消
```

#### 自定义清理

```typescript
// 注册自定义清理函数
this.addAutoCleanup(() => {
  // 清理自定义资源
  this.customResource.release();
});

// 或使用registerCleanup别名
this.registerCleanup(() => {
  console.log('Cleanup executed');
});
```

### EventEmitter 调试

```typescript
import { eventEmitter } from '../utils/EventEmitter';

// 获取所有事件的监听器统计
const stats = eventEmitter.getStats();
console.log(stats);
// 输出: { 'task:add': 2, 'timer:start': 1, ... }

// 查看详细的活动监听器
eventEmitter.logActiveListeners();
// 输出:
// [EventEmitter] Active Listeners
//   task:add: 2 listener(s)
//     - Created 5000ms ago by TaskList
//     - Created 3000ms ago by TaskForm
//   timer:start: 1 listener(s)
//     - Created 10000ms ago by TimerDisplay

// 获取特定事件的监听器数量
const count = eventEmitter.listenerCount('task:add');
console.log(count); // 2
```

## 常见模式

### 模式 1: 表单组件

```typescript
export class FormComponent extends Component {
  private form: HTMLFormElement;
  private input: HTMLInputElement;

  constructor() {
    super();
    this.form = document.getElementById('my-form')!;
    this.input = document.getElementById('my-input')!;

    // 追踪事件监听器
    this.addEventListener(this.form, 'submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.addEventListener(this.input, 'input', (e) => {
      this.handleInput(e);
    });

    // 注册DOM引用清理
    this.addAutoCleanup(() => {
      this.form = null!;
      this.input = null!;
    });
  }

  private handleSubmit(): void {
    // 处理表单提交
  }

  private handleInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    // 处理输入
  }
}
```

### 模式 2: 数据监听组件

```typescript
export class DataComponent extends Component {
  private data: any[] = [];

  constructor() {
    super();

    // 订阅多个事件
    this.subscribeEvent('data:add', (item) => this.data.push(item));
    this.subscribeEvent('data:remove', (id) => {
      this.data = this.data.filter(item => item.id !== id);
    });
    this.subscribeEvent('data:clear', () => {
      this.data = [];
    });

    // 定期刷新数据
    this.setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  private refreshData(): void {
    // 刷新数据逻辑
  }
}
```

### 模式 3: 带Fetch的组件

```typescript
export class ApiComponent extends Component {
  private controller: AbortController | null = null;

  constructor() {
    super();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    // 取消之前的请求
    if (this.controller) {
      this.controller.abort();
    }

    // 创建新的可取消请求
    this.controller = this.createAbortController();

    try {
      const response = await fetch('/api/data', {
        signal: this.controller.signal
      });
      const data = await response.json();
      // 处理数据
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load data:', error);
      }
    }
  }

  public destroy(): void {
    // 自定义清理
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    super.destroy();
  }
}
```

## 迁移现有组件

### 步骤 1: 继承Component

```typescript
// 修改前
export class OldComponent {
  constructor() {
    this.initialize();
  }
}

// 修改后
export class OldComponent extends Component {
  constructor() {
    super();
    this.initialize();
  }
}
```

### 步骤 2: 更新事件监听器

```typescript
// 修改前
eventEmitter.on('event:name', handler);
element.addEventListener('click', handler);
document.addEventListener('keydown', handler);

// 修改后
this.subscribeEvent('event:name', handler);
this.addEventListener(element, 'click', handler);
this.addEventListener(document, 'keydown', handler);
```

### 步骤 3: 更新定时器

```typescript
// 修改前
this.timeoutId = window.setTimeout(callback, 1000);
this.intervalId = window.setInterval(callback, 1000);

// 修改后
this.timeoutId = this.setTimeout(callback, 1000);
this.intervalId = this.setInterval(callback, 1000);
```

### 步骤 4: 清理定时器调用

```typescript
// 修改前
clearTimeout(this.timeoutId);
clearInterval(this.intervalId);

// 修改后 (可选,destroy会自动清理)
this.clearTimeout(this.timeoutId);
this.clearInterval(this.intervalId);
```

## 最佳实践

### ✅ DO

1. **总是继承Component基类** - 适用于有资源需要清理的组件
2. **使用追踪方法** - `subscribeEvent()`, `addEventListener()`, `setTimeout()`, `setInterval()`
3. **在适当时机销毁** - 组件不再使用时立即调用 `destroy()`
4. **清理DOM引用** - 在构造函数中使用 `addAutoCleanup()` 清理引用
5. **检查destroyed状态** - 在长时间操作前检查 `isDestroyed()`

```typescript
public async performLongOperation(): Promise<void> {
  if (this.isDestroyed()) {
    return; // 组件已销毁,不执行
  }

  // 执行操作
}
```

### ❌ DON'T

1. **不要混用追踪和非追踪方法** - 会导致部分泄漏
2. **不要在destroy后操作组件** - 会导致错误或泄漏
3. **不要忘记清理异步操作** - fetch, Promise等需要特殊处理
4. **不要在循环中创建监听器** - 会导致大量泄漏
5. **不要依赖全局变量** - 阻止垃圾回收

```typescript
// ❌ 错误示例
export class BadComponent extends Component {
  constructor() {
    super();
    for (let i = 0; i < 100; i++) {
      // 在循环中创建监听器!
      eventEmitter.on('event', handler);
    }
  }
}

// ✅ 正确示例
export class GoodComponent extends Component {
  constructor() {
    super();
    // 只订阅一次
    this.subscribeEvent('event', this.handleEvent);
  }

  private handleEvent = (data: any) => {
    // 处理事件
  }
}
```

## 调试技巧

### 1. 检查监听器泄漏

```typescript
// 在控制台运行
eventEmitter.logActiveListeners();

// 查找意外的监听器
const stats = eventEmitter.getStats();
Object.entries(stats).forEach(([event, count]) => {
  if (count > 5) {
    console.warn(`Event "${event}" has ${count} listeners`);
  }
});
```

### 2. 使用Chrome DevTools

1. 打开DevTools > Memory
2. 录制堆快照
3. 执行操作
4. 触发组件清理
5. 录制第二个快照
6. 比较快照,查找detached DOM elements

### 3. 监控组件实例

```typescript
// 开发环境监控
if (process.env.NODE_ENV === 'development') {
  const components = new Set<Component>();

  export function trackComponent(component: Component) {
    components.add(component);
    console.log(`Active components: ${components.size}`);
  }

  export function untrackComponent(component: Component) {
    components.delete(component);
    console.log(`Active components: ${components.size}`);
  }
}
```

## 常见问题

### Q: 如果组件已经在destroy中,如何避免错误?

A: 使用 `safeExecute()` 或检查 `isDestroyed()`:

```typescript
this.safeExecute(() => {
  // 只有在组件未销毁时才执行
});

// 或
if (!this.isDestroyed()) {
  // 执行操作
}
```

### Q: 如何处理Promise?

A: 使用AbortController或检查destroyed状态:

```typescript
private async loadData(): Promise<void> {
  const controller = this.createAbortController();

  try {
    const data = await fetch('/api/data', {
      signal: controller.signal
    });

    if (!this.isDestroyed()) {
      // 只在组件存活时处理数据
      this.processData(await data.json());
    }
  } catch (error) {
    if (error.name !== 'AbortError' && !this.isDestroyed()) {
      this.handleError(error);
    }
  }
}
```

### Q: 是否所有组件都需要继承Component?

A: 不需要。只有满足以下条件的组件才需要:
- 有DOM事件监听器
- 订阅EventEmitter事件
- 使用定时器(setTimeout/setInterval)
- 有fetch请求
- 持有DOM引用

纯数据类或工具类不需要继承。

### Q: destroy()可以调用多次吗?

A: 可以,多次调用是安全的。第一次调用会执行清理,后续调用会被忽略:

```typescript
component.destroy();
component.destroy(); // 安全,不会报错
```

## 资源链接

- [完整修复报告](./MEMORY_LEAK_FIX_REPORT.md)
- [测试文件](../tests/memory-leak.test.ts)
- [Component基类源码](../src/core/Component.ts)
- [EventEmitter源码](../src/utils/EventEmitter.ts)

## 获取帮助

如果遇到问题:
1. 查看测试文件中的示例
2. 使用Chrome DevTools内存分析
3. 运行 `eventEmitter.logActiveListeners()` 调试
4. 检查组件是否正确继承Component基类

---

**最后更新**: 2026-01-22
**版本**: 1.0.0
