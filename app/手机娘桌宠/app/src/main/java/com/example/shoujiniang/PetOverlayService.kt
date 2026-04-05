package com.example.shoujiniang

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
 * 使用 FLAG_NOT_TOUCHABLE 确保不干扰用户正常操作。
 * 好感度等级联动角色外观（大小、透明度、动画）。
 */
class PetOverlayService : AccessibilityService() {

    private var overlayView: PetOverlayView? = null
    private var windowManager: WindowManager? = null
    private val handler = Handler(Looper.getMainLooper())
    private lateinit var favorManager: FavorabilityManager

    private var lastInteractionTime = 0L
    private val idleThreshold = 5000L
    private val idleTextInterval = 3000L
    private val idleCheckInterval = 500L
    private val glowFadeSpeed = 0.04f

    private var isIdle = false
    private var glowAlpha = 0f
    private var lastLevel = -1

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
                val oldScore = favorManager.score
                favorManager.onIdleTick()
                checkLevelChange(oldScore)
                overlayView?.spawnIdleText()
                handler.postDelayed(this, idleTextInterval)
            }
        }
    }

    // ========== 生命周期 ==========

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "onServiceConnected: 服务已连接")

        favorManager = FavorabilityManager(this)
        lastLevel = favorManager.level

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        setupOverlay()
        lastInteractionTime = System.currentTimeMillis()
        handler.post(idleCheckRunnable)

        updatePetLevel()

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

            val oldScore = favorManager.score
            val added = favorManager.onUserInteract()
            if (added) {
                checkLevelChange(oldScore)
            }

            overlayView?.onUserInteracted()
        }
    }

    // ========== 状态切换 ==========

    private fun transitionToIdle() {
        isIdle = true
        overlayView?.spawnIdleText()

        val oldScore = favorManager.score
        favorManager.onIdleTick()
        checkLevelChange(oldScore)

        handler.removeCallbacks(idleTextRunnable)
        handler.postDelayed(idleTextRunnable, idleTextInterval)
    }

    private fun transitionToActive() {
        isIdle = false
        handler.removeCallbacks(idleTextRunnable)
    }

    // ========== 等级联动 ==========

    private fun checkLevelChange(oldScore: Int) {
        val oldLevel = favorManager.getLevelBeforeChange(oldScore)
        val newLevel = favorManager.level
        if (oldLevel != newLevel) {
            lastLevel = newLevel
            updatePetLevel()
            Log.d(TAG, "等级变化: Lv.$oldLevel -> Lv.$newLevel (${favorManager.score})")
        }
    }

    private fun updatePetLevel() {
        overlayView?.updateLevel(
            favorManager.level,
            favorManager.levelName,
            favorManager.scaleForLevel,
            favorManager.alphaForLevel
        )
    }

    // ========== 悬浮窗管理 ==========

    private fun setupOverlay() {
        overlayView = PetOverlayView(this)

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
            try { windowManager?.removeView(overlayView) } catch (_: Exception) { }
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
        private const val TAG = "PetOverlay"

        fun isRunning(context: Context): Boolean {
            val expected = ComponentName(context, PetOverlayService::class.java)
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
