"""
猫娘模拟器 Windows 版
参考 AutoMeow (https://github.com/afoim/AutoMeow)

原理：拦截回车键 → 模拟键盘输入"喵～" → 再按回车发送
支持自定义白名单 APP、前缀后缀、快捷开关、系统托盘

需要管理员权限运行（用于键盘拦截）
"""

import time
import json
import os
import sys
import threading

try:
    import keyboard
except ImportError:
    print("请先安装依赖：pip install keyboard pystray Pillow")
    exit(1)

try:
    import pystray
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    pystray = None

import ctypes
import ctypes.wintypes

# ============ 配置 ============

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

DEFAULT_CONFIG = {
    "prefix": "喵～",
    "suffix": "喵～",
    "enabled": False,
    "whitelist": ["微信", "WeChat", "QQ", "Telegram", "discord"],
    "hotkey_toggle": "ctrl+shift+m"
}


def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
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


def check_admin():
    """检查是否管理员权限"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False


def get_foreground_window_title():
    """获取当前前台窗口标题"""
    try:
        hwnd = ctypes.windll.user32.GetForegroundWindow()
        length = ctypes.windll.user32.GetWindowTextLengthW(hwnd) + 1
        buf = ctypes.create_unicode_buffer(length)
        ctypes.windll.user32.GetWindowTextW(hwnd, buf, length)
        return buf.value
    except:
        return ""


def is_in_whitelist(whitelist):
    """检查当前窗口是否在白名单中"""
    title = get_foreground_window_title()
    for w in whitelist:
        if w.lower() in title.lower():
            return True
    return False


class AutoMeowWin:
    def __init__(self):
        self.config = load_config()
        self.last_time = 0
        self.icon = None

    def create_tray_icon(self, color):
        """创建托盘图标"""
        image = Image.new('RGB', (32, 32), color)
        draw = ImageDraw.Draw(image)
        try:
            font = ImageFont.truetype("msyh.ttc", 24)
        except:
            try:
                font = ImageFont.truetype("simhei.ttf", 24)
            except:
                font = ImageFont.load_default()
        text = "喵"
        bbox = draw.textbbox((0, 0), text, font=font)
        x = (32 - (bbox[2] - bbox[0])) // 2
        y = (32 - (bbox[3] - bbox[1])) // 2
        draw.text((x, y), text, font=font, fill='white')
        return image

    def on_enter(self, event):
        """回车键拦截回调"""
        if not self.config["enabled"]:
            return True

        current_time = time.time()
        if current_time - self.last_time < 0.3:
            return True

        # 不拦截修饰键组合
        if keyboard.is_pressed('shift') or keyboard.is_pressed('ctrl') or keyboard.is_pressed('alt'):
            return True

        # 检查白名单
        if not is_in_whitelist(self.config.get("whitelist", [])):
            return True

        self.last_time = current_time

        # 拦截回车
        keyboard.block_key(event.scan_code)

        # 在新线程中注入喵
        threading.Thread(target=self._inject_meow, daemon=True).start()

        return False

    def _inject_meow(self):
        """注入喵～文字"""
        try:
            # 移动光标到末尾
            keyboard.press('end')
            time.sleep(0.03)
            keyboard.release('end')
            time.sleep(0.02)

            # 输入后缀喵
            suffix = self.config.get("suffix", "喵～")
            keyboard.write(suffix)
            time.sleep(0.08)

            # 按回车发送
            keyboard.press_and_release("enter")

        except Exception as e:
            print(f"注入失败: {e}")

    def toggle(self, icon=None, item=None):
        """切换开关"""
        self.config["enabled"] = not self.config["enabled"]
        status = "已开启" if self.config["enabled"] else "已关闭"
        print(f"[猫娘] {status}")

        if self.icon:
            color = 'green' if self.config["enabled"] else 'red'
            self.icon.icon = self.create_tray_icon(color)
            self.icon.title = f"猫娘模拟器 ({status})"

        save_config(self.config)

        # 动态绑定/解绑回车键
        if self.config["enabled"]:
            keyboard.unhook_all()
            keyboard.on_press_key("enter", self.on_enter, suppress=True)
        else:
            keyboard.unhook_all()

    def quit_app(self, icon=None, item=None):
        """退出"""
        keyboard.unhook_all()
        save_config(self.config)
        if self.icon:
            self.icon.stop()
        sys.exit(0)

    def run_with_tray(self):
        """带托盘图标运行"""
        if not pystray:
            print("缺少 pystray/Pillow，使用命令行模式")
            self.run_cli()
            return

        menu = pystray.Menu(
            pystray.MenuItem("启用/禁用 (Ctrl+Shift+M)", self.toggle),
            pystray.MenuItem(
                f"状态：{'已开启' if self.config['enabled'] else '已关闭'}",
                lambda: None, enabled=False
            ),
            pystray.MenuItem("退出", self.quit_app),
        )

        color = 'green' if self.config["enabled"] else 'red'
        self.icon = pystray.Icon(
            "MeowSimulator",
            self.create_tray_icon(color),
            f"猫娘模拟器 ({'已开启' if self.config['enabled'] else '已关闭'})",
            menu
        )

        # 注册热键
        hotkey = self.config.get("hotkey_toggle", "ctrl+shift+m")
        keyboard.add_hotkey(hotkey, self.toggle)

        # 启用状态下绑定回车拦截
        if self.config["enabled"]:
            keyboard.on_press_key("enter", self.on_enter, suppress=True)

        print("[猫娘] 系统托盘已启动，右键图标可操作")
        self.icon.run()

    def run_cli(self):
        """命令行模式运行"""
        print("=" * 40)
        print("  猫娘模拟器 Windows 版 (命令行)")
        print("=" * 40)
        print()
        print(f"前缀：{self.config['prefix']}")
        print(f"后缀：{self.config['suffix']}")
        print(f"白名单：{', '.join(self.config['whitelist'])}")
        print(f"快捷键：{self.config.get('hotkey_toggle', 'ctrl+shift+m')}")
        print()
        print("  Ctrl+C 退出")
        print()

        # 注册热键
        hotkey = self.config.get("hotkey_toggle", "ctrl+shift+m")
        keyboard.add_hotkey(hotkey, self.toggle)

        if self.config["enabled"]:
            keyboard.on_press_key("enter", self.on_enter, suppress=True)
            print("[猫娘] 已开启，监听回车键中...")
        else:
            print("[猫娘] 未开启，按 Ctrl+Shift+M 开启")

        try:
            keyboard.wait()
        except KeyboardInterrupt:
            print("\n[猫娘] 再见喵～")
            keyboard.unhook_all()
            save_config(self.config)


if __name__ == "__main__":
    if not check_admin():
        print("[警告] 需要管理员权限！")
        print("请右键 → 以管理员身份运行")
        # 尝试提权重启
        try:
            if not getattr(sys, 'frozen', False):
                ctypes.windll.shell32.ShellExecuteW(
                    None, "runas", sys.executable,
                    " ".join(sys.argv), None, 1
                )
        except:
            pass
        sys.exit(0)

    app = AutoMeowWin()
    app.run_with_tray()
