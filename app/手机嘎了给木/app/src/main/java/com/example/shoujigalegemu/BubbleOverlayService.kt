package com.example.shoujigalegemu

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.graphics.PixelFormat
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.WindowManager
import android.content.ComponentName
import android.text.TextUtils
import android.provider.Settings

/**
 * 无障碍服务 — 系统级悬浮窗核心。
 *
 * 1. 监听全局用户交互 → 粉红气泡 + "好感度++"
 * 2. 3秒无操作 → 蓝色边框光晕 + 每2.5秒"好感度--"
 * 3. 再操作 → 蓝光消散，粉红气泡再起
 */
class BubbleOverlayService : AccessibilityService() {

    private var overlayView: BubbleOverlayView? = null
    private var windowManager: WindowManager? = null
    private val handler = Handler(Looper.getMainLooper())

    private var lastInteractionTime = 0L
    private val idleThreshold = 3000L
    private val idleTextInterval = 2500L
    private val idleCheckInterval = 500L
    private val glowFadeSpeed = 0.04f

    private var isIdle = false
    private var glowAlpha = 0f

    private val idleCheckRunnable = object : Runnable {
        override fun run() {
            val now = System.currentTimeMillis()
            if (!isIdle && now - lastInteractionTime > idleThreshold) {
                transitionToIdle()
            }
            if (isIdle) {
                glowAlpha = (glowAlpha + glowFadeSpeed).coerceAtMost(0.8f)
            } else {
                glowAlpha = (glowAlpha - glowFadeSpeed * 2).coerceAtLeast(0f)
            }
            overlayView?.setBorderGlowAlpha(glowAlpha)
            handler.postDelayed(this, idleCheckInterval)
        }
    }

    private val idleTextRunnable = object : Runnable {
        override fun run() {
            if (isIdle) {
                overlayView?.spawnIdleText()
                handler.postDelayed(this, idleTextInterval)
            }
        }
    }

    // ========== 生命周期 ==========

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "onServiceConnected: 服务已连接")
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        setupOverlay()
        lastInteractionTime = System.currentTimeMillis()
        handler.post(idleCheckRunnable)

        // 启动后立刻展示欢迎气泡，让用户知道服务已生效
        handler.postDelayed({
            overlayView?.onUserInteracted()
        }, 300)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(idleCheckRunnable)
        handler.removeCallbacks(idleTextRunnable)
        removeOverlay()
    }

    override fun onInterrupt() {}

    // ========== 无障碍事件 ==========

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val eventType = event.eventType
        val isInteraction = eventType and (
            AccessibilityEvent.TYPE_VIEW_CLICKED
                or AccessibilityEvent.TYPE_VIEW_SCROLLED
                or AccessibilityEvent.TYPE_VIEW_FOCUSED
                or AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED
                or AccessibilityEvent.TYPE_VIEW_SELECTED
                or AccessibilityEvent.TYPE_TOUCH_INTERACTION_START
            ) != 0

        if (isInteraction) {
            lastInteractionTime = System.currentTimeMillis()
            if (isIdle) transitionToActive()
            overlayView?.onUserInteracted()
        }
    }

    // ========== 状态切换 ==========

    private fun transitionToIdle() {
        isIdle = true
        overlayView?.spawnIdleText()
        handler.removeCallbacks(idleTextRunnable)
        handler.postDelayed(idleTextRunnable, idleTextInterval)
    }

    private fun transitionToActive() {
        isIdle = false
        handler.removeCallbacks(idleTextRunnable)
    }

    // ========== 悬浮窗管理 ==========

    private fun setupOverlay() {
        overlayView = BubbleOverlayView(this)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                or WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = android.view.Gravity.TOP or android.view.Gravity.START

        try {
            windowManager?.addView(overlayView, params)
            Log.d(TAG, "setupOverlay: TYPE_ACCESSIBILITY_OVERLAY 添加成功")
        } catch (e: Exception) {
            Log.e(TAG, "setupOverlay: 主方案失败，尝试降级: ${e.message}")
            params.type = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            try {
                windowManager?.addView(overlayView, params)
                Log.d(TAG, "setupOverlay: TYPE_APPLICATION_OVERLAY 降级成功")
            } catch (e2: Exception) {
                Log.e(TAG, "setupOverlay: 两种悬浮窗都失败: ${e2.message}")
            }
        }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try { windowManager?.removeView(it) } catch (_: Exception) { }
        }
        overlayView = null
    }

    companion object {
        private const val TAG = "BubbleOverlay"

        /** 检查本无障碍服务是否已启用 */
        fun isRunning(context: Context): Boolean {
            val expected = ComponentName(context, BubbleOverlayService::class.java)
            val enabled = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            val splitter = TextUtils.SimpleStringSplitter(':')
            splitter.setString(enabled)
            while (splitter.hasNext()) {
                val str = splitter.next()
                val comp = ComponentName.unflattenFromString(str)
                if (comp == expected) return true
            }
            return false
        }
    }
}
