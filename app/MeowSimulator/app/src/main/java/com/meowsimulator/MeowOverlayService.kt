package com.meowsimulator

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

/**
 * 悬浮输入框服务：
 * 在微信上方显示一个输入框，用户在这里输入文字，
 * 自动加上喵～后复制到剪贴板，用户粘贴到微信即可。
 */
class MeowOverlayService : Service() {

    companion object {
        private const val CHANNEL_ID = "meow_overlay_channel"
        private const val NOTIFICATION_ID = 1
        var isRunning = false
            private set
    }

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        showOverlay()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        removeOverlay()
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        super.onTaskRemoved(rootIntent)
        stopSelf()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID, "猫娘悬浮窗", NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "猫娘模拟器悬浮窗服务"
            setShowBadge(false)
        }
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(channel)
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pi = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("猫娘模拟器")
            .setContentText("喵～ 悬浮输入框运行中")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pi)
            .setOngoing(true)
            .build()
    }

    private fun showOverlay() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val wrap = dp(8)
        val bgDrawable = GradientDrawable().apply {
            setColor(0xFFFFF0F5.toInt())
            setCornerRadius(dp(16).toFloat())
            setStroke(dp(2), 0xFFE91E63.toInt())
        }

        // 主容器
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = bgDrawable
            setPadding(dp(12), dp(12), dp(12), dp(12))
        }

        // 标题栏（可拖动）
        val titleBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val dragHandle = TextView(this).apply {
            text = " 猫娘输入框 🐱 "
            setTextColor(0xFFE91E63.toInt())
            textSize = 15f
            setPadding(0, dp(4), 0, dp(4))
        }
        val hideBtn = TextView(this).apply {
            text = " 收起 "
            setTextColor(0xFF9C27B0.toInt())
            textSize = 13f
            setPadding(dp(8), dp(4), dp(8), dp(4))
        }
        titleBar.addView(dragHandle, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        titleBar.addView(hideBtn)

        // 输入框
        val editText = EditText(this).apply {
            hint = "在这里输入要发送的话..."
            textSize = 15f
            setTextColor(0xFF333333.toInt())
            setHintTextColor(0xFF999999.toInt())
            background = GradientDrawable().apply {
                setColor(0xFFFFFFFF.toInt())
                setCornerRadius(dp(8).toFloat())
                setStroke(1, 0xFFE0E0E0.toInt())
            }
            setPadding(dp(12), dp(10), dp(12), dp(10))
            isSingleLine = false
            maxLines = 4
            minHeight = dp(44)
        }

        // 预览区域：显示加完喵的文字
        val preview = TextView(this).apply {
            text = "预览：喵～...喵～"
            textSize = 13f
            setTextColor(0xFF4A148C.toInt())
            setPadding(0, dp(6), 0, dp(6))
            maxLines = 3
        }

        // 按钮行
        val btnRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.END
        }

        val copyBtn = Button(this).apply {
            text = "复制喵～"
            setTextColor(0xFFFFFFFF.toInt())
            textSize = 14f
            background = GradientDrawable().apply {
                setColor(0xFFE91E63.toInt())
                setCornerRadius(dp(20).toFloat())
            }
            setPadding(dp(20), dp(6), dp(20), dp(6))
            minHeight = dp(36)
        }

        btnRow.addView(copyBtn)

        container.addView(titleBar)
        container.addView(editText, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = dp(8) })
        container.addView(preview)
        container.addView(btnRow, LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
        ))

        // 布局参数
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            y = dp(100)
            width = dp(340)
        }

        // 标题栏拖动
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f
        var isDragging = false

        dragHandle.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.rawX - initialTouchX
                    val dy = event.rawY - initialTouchY
                    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) isDragging = true
                    params.x = initialX + dx.toInt()
                    params.y = initialY - dy.toInt()
                    try { windowManager?.updateViewLayout(container, params) } catch (_: Exception) {}
                }
            }
            isDragging
        }

        // 收起/展开
        var collapsed = false
        val expandedViews = listOf(editText, preview, btnRow)
        hideBtn.setOnClickListener {
            collapsed = !collapsed
            expandedViews.forEach { it.visibility = if (collapsed) View.GONE else View.VISIBLE }
            hideBtn.text = if (collapsed) " 展开 " else " 收起 "
            try { windowManager?.updateViewLayout(container, params) } catch (_: Exception) {}
        }

        // 实时预览
        editText.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val input = s?.toString() ?: ""
                if (input.isBlank()) {
                    preview.text = "预览：喵～...喵～"
                } else {
                    val meowified = MeowPrefs.meowify(input, this@MeowOverlayService)
                    preview.text = "预览：$meowified"
                }
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        // 复制按钮
        copyBtn.setOnClickListener {
            val input = editText.text?.toString() ?: ""
            if (input.isBlank()) return@setOnClickListener

            val meowified = MeowPrefs.meowify(input, this)
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newPlainText("meow", meowified))

            // 显示"已复制"反馈
            copyBtn.text = "已复制 ✓"
            copyBtn.postDelayed({
                copyBtn.text = "复制喵～"
                editText.text?.clear()
            }, 800)
        }

        // 点击外部让输入框获得焦点
        editText.setOnClickListener {
            editText.requestFocus()
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.showSoftInput(editText, InputMethodManager.SHOW_IMPLICIT)
        }

        overlayView = container
        windowManager?.addView(container, params)
    }

    private fun removeOverlay() {
        overlayView?.let {
            try { windowManager?.removeView(it) } catch (_: Exception) {}
            overlayView = null
        }
    }

    private fun dp(value: Int): Int {
        return (value * resources.displayMetrics.density + 0.5f).toInt()
    }
}
