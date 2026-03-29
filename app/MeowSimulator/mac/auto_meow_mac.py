"""
猫娘模拟器 macOS 版
参考 AutoMeow (https://github.com/afoim/AutoMeow)

原理：拦截回车键 → 模拟键盘输入"喵～" → 再按回车发送
支持自定义白名单 APP、前缀后缀、快捷开关
"""

import time
import json
import os
import subprocess
import threading

try:
    from pynput import keyboard
    from pynput.keyboard import Controller, Key, KeyCode
except ImportError:
    print("请先安装依赖：pip3 install pynput")
    exit(1)

# ============ 配置 ============

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

DEFAULT_CONFIG = {
    "prefix": "喵～",
    "suffix": "喵～",
    "enabled": True,
    "whitelist": ["微信", "WeChat", "QQ", "Telegram", "discord"],
    "hotkey_toggle": "cmd+shift+m"
}


def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                # 补全缺失字段
                for k, v in DEFAULT_CONFIG.items():
                    if k not in cfg:
                        cfg[k] = v
                return cfg
        except:
            pass
    return DEFAULT_CONFIG.copy()


def save_config(cfg):
    try:
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except:
        pass


def get_frontmost_app():
    """获取当前最前面的应用名称"""
    try:
        result = subprocess.run(
            ["osascript", "-e",
             'tell application "System Events" to get name of first process whose frontmost is true'],
            capture_output=True, text=True, timeout=2
        )
        return result.stdout.strip()
    except:
        return ""


def is_in_whitelist(app_name, whitelist):
    """检查应用是否在白名单中"""
    for w in whitelist:
        if w.lower() in app_name.lower():
            return True
    return False


class AutoMeowMac:
    def __init__(self):
        self.config = load_config()
        self.kb = Controller()
        self.last_time = 0
        self.running = True
        self.suppressing = False
        self.listener = None

    def type_text(self, text):
        """模拟键盘输入文字"""
        self.kb.type(text)

    def press_key(self, key):
        """模拟按键"""
        self.kb.press(key)
        self.kb.release(key)

    def on_enter(self, key):
        """回车键处理：拦截并插入喵～"""
        if not self.config["enabled"]:
            return True

        current_time = time.time()
        if current_time - self.last_time < 0.3:
            return True

        # 检查是否在白名单应用中
        app = get_frontmost_app()
        if not is_in_whitelist(app, self.config.get("whitelist", [])):
            return True

        self.last_time = current_time

        # 在新线程中执行，避免阻塞监听器
        threading.Thread(target=self._inject_meow, daemon=True).start()

        # 拦截（吞掉）这个回车
        return False

    def _inject_meow(self):
        """注入喵～文字并重新发送回车"""
        try:
            # 移动光标到末尾 (Cmd+Right)
            self.kb.press(Key.cmd)
            self.kb.press(Key.right)
            self.kb.release(Key.right)
            self.kb.release(Key.cmd)
            time.sleep(0.03)

            # 输入后缀喵
            suffix = self.config.get("suffix", "喵～")
            self.type_text(suffix)
            time.sleep(0.06)

            # 按回车发送
            self.press_key(Key.enter)

        except Exception as e:
            print(f"注入失败: {e}")

    def on_press(self, key):
        """键盘按下事件"""
        if not self.config["enabled"]:
            return True

        # 拦截回车键
        if key == Key.enter:
            return self.on_enter(key)

        return True

    def toggle(self):
        """切换开关"""
        self.config["enabled"] = not self.config["enabled"]
        status = "已开启" if self.config["enabled"] else "已关闭"
        print(f"[猫娘] {status}")
        save_config(self.config)

    def start(self):
        """启动监听"""
        print("=" * 40)
        print("  猫娘模拟器 macOS 版")
        print("  参考 AutoMeow by afoim")
        print("=" * 40)
        print()
        print(f"前缀：{self.config['prefix']}")
        print(f"后缀：{self.config['suffix']}")
        print(f"白名单：{', '.join(self.config['whitelist'])}")
        print(f"状态：{'已开启' if self.config['enabled'] else '已关闭'}")
        print()
        print("快捷键：")
        print("  Ctrl+C    退出程序")
        print("  Cmd+Shift+M  开关切换")
        print()
        print("提示：")
        print("  编辑 config.json 可自定义设置")
        print("  首次运行需要在「系统设置→隐私与安全性→辅助功能」中授权")
        print()

        # 启动回车拦截监听
        def listen():
            try:
                with keyboard.Listener(
                    on_press=self.on_press,
                    suppress=False  # macOS 不支持 suppress，改用回调拦截
                ) as listener:
                    self.listener = listener
                    listener.join()
            except Exception as e:
                print(f"监听启动失败: {e}")
                print("请在「系统设置→隐私与安全性→辅助功能」中给终端/Python 授权")

        # macOS pynput 不支持 suppress，需要用另一种方式拦截
        # 使用全局热键 + 回车监听的组合方案
        # 方案：监听回车，如果当前 APP 在白名单中，立刻撤销(Cmd+Z)并重新输入带喵的内容

        self.listen_enter()

    def listen_enter(self):
        """
        macOS 专用监听方案：
        因为 macOS 不能直接拦截按键，所以采用"先发后改"策略：
        1. 用户按回车发送消息
        2. 立刻 Cmd+Z 撤销发送
        3. 把剪贴板里的文字加上喵～
        4. 重新粘贴并发送
        """
        print("[猫娘] 使用 macOS 专用方案（先发后改）")
        print()

        def on_key_press(key):
            try:
                if key != Key.enter:
                    return True
                if not self.config["enabled"]:
                    return True

                current_time = time.time()
                if current_time - self.last_time < 0.5:
                    return True

                app = get_frontmost_app()
                if not is_in_whitelist(app, self.config.get("whitelist", [])):
                    return True

                self.last_time = current_time
                # 在短延迟后执行（等消息发送出去）
                threading.Thread(target=self._mac_meow, daemon=True).start()

            except Exception as e:
                pass
            return True

        # 同时注册 Cmd+Shift+M 热键切换
        HOTKEY = {"cmd", "shift", KeyCode.from_char("m")}

        with keyboard.Listener(on_press=on_key_press) as listener:
            # 热键监听
            hotkey_listener = keyboard.GlobalHotKeys({
                "<cmd>+<shift>+m": self.toggle
            })
            hotkey_listener.start()

            print("[猫娘] 正在监听... (Cmd+Shift+M 切换开关)")
            listener.join()

    def _mac_meow(self):
        """
        macOS 专用：撤销发送 → 加喵 → 重发
        流程：全选复制 → 读取内容 → 加喵 → 清空 → 输入新内容 → 回车
        """
        try:
            time.sleep(0.05)

            # 全选当前输入框内容
            self.kb.press(Key.cmd)
            self.kb.press("a")
            self.kb.release("a")
            time.sleep(0.03)

            # 复制到剪贴板
            self.kb.press("c")
            self.kb.release("c")
            time.sleep(0.05)
            self.kb.release(Key.cmd)
            time.sleep(0.03)

            # 读取剪贴板
            result = subprocess.run(
                ["pbpaste"], capture_output=True, text=True, timeout=1
            )
            original = result.stdout.strip()

            if not original:
                return

            # 加喵
            prefix = self.config.get("prefix", "喵～")
            suffix = self.config.get("suffix", "喵～")
            meowified = original
            if not meowified.startswith(prefix):
                meowified = prefix + meowified
            if not meowified.endswith(suffix):
                meowified = meowified + suffix

            # 写入剪贴板
            subprocess.run(["pbcopy"], input=meowified, text=True, timeout=1)
            time.sleep(0.02)

            # 全选并粘贴替换
            self.kb.press(Key.cmd)
            self.kb.press("a")
            self.kb.release("a")
            time.sleep(0.02)
            self.kb.press("v")
            self.kb.release("v")
            time.sleep(0.05)
            self.kb.release(Key.cmd)
            time.sleep(0.03)

            # 按回车发送
            self.press_key(Key.enter)

            print(f"  喵～ {meowified[:30]}...")

        except Exception as e:
            print(f"  处理失败: {e}")


if __name__ == "__main__":
    app = AutoMeowMac()
    try:
        app.start()
    except KeyboardInterrupt:
        print("\n[猫娘] 再见喵～")
        save_config(app.config)
