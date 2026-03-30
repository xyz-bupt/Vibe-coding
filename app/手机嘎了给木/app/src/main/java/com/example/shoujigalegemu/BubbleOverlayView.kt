package com.example.shoujigalegemu

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.os.Build
import android.view.View
import android.view.WindowManager
import kotlin.math.sin
import kotlin.random.Random

/**
 * 系统级悬浮视图 — 在所有应用之上渲染气泡、光晕和文字。
 * 由 BubbleOverlayService 通过 WindowManager 管理。
 *
 * 关键：必须 setWillNotDraw(false) + onMeasure 确保在 WindowManager 中可绘制。
 * 不能用 LAYER_TYPE_SOFTWARE（与 TYPE_ACCESSIBILITY_OVERLAY 不兼容）。
 */
class BubbleOverlayView(context: Context) : View(context) {

    // ========== 数据类 ==========
    private data class Bubble(
        val x: Float,
        val startY: Float,
        var currentY: Float,
        val radius: Float,
        val color: Int,
        var alpha: Float,
        val speed: Float,
        val horizontalDrift: Float,
        val phase: Float
    )

    private data class FloatingText(
        val x: Float,
        val startY: Float,
        var currentY: Float,
        val text: String,
        val color: Int,
        var alpha: Float,
        val textSize: Float,
        var scale: Float
    )

    // ========== 预计算颜色常量 ==========
    private val colorPinkHot = Color.parseColor("#FFFF69B4")
    private val colorRoyalBlue = Color.parseColor("#FF4169E1")

    // ========== 数据列表 ==========
    private val bubbles = mutableListOf<Bubble>()
    private val floatingTexts = mutableListOf<FloatingText>()

    // ========== 画笔（预分配，onDraw 中零分配） ==========
    private val bubblePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
    }
    private val shadowTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
        color = Color.BLACK
    }
    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    private val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }
    private val highlightPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.WHITE
    }

    // ========== 蓝色边框光晕 ==========
    var borderGlowAlpha = 0f
        private set
    private var borderGlowWidth = 8f
    private var borderAnimPhase = 0f

    // ========== 动画帧控制 ==========
    private var isAnimating = false
    private val animFrameInterval = 16L // ~60fps
    private var lastFrameTime = 0L
    private val animator = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = Long.MAX_VALUE
        repeatCount = ValueAnimator.INFINITE
        addUpdateListener { onAnimationFrame() }
    }

    private val random = Random.Default

    // 屏幕尺寸
    private var screenWidth = 1080f
    private var screenHeight = 2400f

    init {
        // 关键！不调用这个，onDraw 永远不会被调用
        setWillNotDraw(false)
        refreshScreenSize()
    }

    // 关键！WindowManager 添加的 View 没有 layout，需要自己保证尺寸
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = MeasureSpec.getSize(widthMeasureSpec)
        val h = MeasureSpec.getSize(heightMeasureSpec)
        if (w > 0 && h > 0) {
            screenWidth = w.toFloat()
            screenHeight = h.toFloat()
        }
        setMeasuredDimension(
            if (w > 0) w else screenWidth.toInt(),
            if (h > 0) h else screenHeight.toInt()
        )
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        refreshScreenSize()
    }

    private fun refreshScreenSize() {
        try {
            val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                context.display ?: wm.defaultDisplay
            } else {
                @Suppress("DEPRECATION")
                wm.defaultDisplay
            }
            val size = Point()
            @Suppress("DEPRECATION")
            display.getRealSize(size)
            if (size.x > 0 && size.y > 0) {
                screenWidth = size.x.toFloat()
                screenHeight = size.y.toFloat()
            }
        } catch (_: Exception) { }
    }

    // ========== 公开接口 ==========

    /** 用户操作了手机，从屏幕四周生成粉红气泡 + "好感度++" */
    fun onUserInteracted() {
        spawnEdgeBubbles()
        spawnPlusText()
        startAnimation()
    }

    /** 外部定时调用：在屏幕中央生成"好感度--" */
    fun spawnIdleText() {
        val cx = screenWidth / 2f
        val cy = screenHeight / 2f
        floatingTexts.add(
            FloatingText(
                x = cx + random.nextFloat() * 100 - 50,
                startY = cy,
                currentY = cy,
                text = "好感度--",
                color = colorRoyalBlue,
                alpha = 1.0f,
                textSize = 44f + random.nextFloat() * 12,
                scale = 0.3f
            )
        )
        capTexts()
        startAnimation()
    }

    /** 外部控制蓝色光晕强度（0~0.8） */
    fun setBorderGlowAlpha(alpha: Float) {
        borderGlowAlpha = alpha.coerceIn(0f, 0.8f)
        if (borderGlowAlpha > 0.01f) startAnimation()
    }

    // ========== 气泡生成 ==========

    private fun spawnEdgeBubbles() {
        val count = random.nextInt(4, 8)
        for (i in 0 until count) {
            val edge = random.nextInt(4)
            val (bx, by) = when (edge) {
                0 -> random.nextFloat() * screenWidth to screenHeight
                1 -> random.nextFloat() * screenWidth to 0f
                2 -> 0f to random.nextFloat() * screenHeight
                else -> screenWidth to random.nextFloat() * screenHeight
            }
            val radius = random.nextFloat() * 20 + 12
            val alpha = random.nextFloat() * 0.5f + 0.3f
            val speed = random.nextFloat() * 3 + 2
            val drift = random.nextFloat() * 2 - 1
            val phase = random.nextFloat() * Math.PI.toFloat() * 2
            val color = generatePinkShade()
            bubbles.add(Bubble(bx, by, by, radius, color, alpha, speed, drift, phase))
        }
        capBubbles()
    }

    private fun generatePinkShade(): Int {
        val g = random.nextInt(80, 180)
        val b = random.nextInt(160, 220)
        return Color.argb(255, 255, g, b)
    }

    private fun spawnPlusText() {
        val edge = random.nextInt(4)
        val (tx, ty) = when (edge) {
            0 -> random.nextFloat() * screenWidth to screenHeight - 80f
            1 -> random.nextFloat() * screenWidth to 120f
            2 -> 80f to random.nextFloat() * screenHeight
            else -> screenWidth - 80f to random.nextFloat() * screenHeight
        }
        floatingTexts.add(
            FloatingText(
                x = tx, startY = ty, currentY = ty,
                text = "好感度++", color = colorPinkHot,
                alpha = 1.0f, textSize = 34f + random.nextFloat() * 14, scale = 0.3f
            )
        )
        capTexts()
    }

    private fun capBubbles() {
        if (bubbles.size > 150) bubbles.subList(0, bubbles.size - 100).clear()
    }

    private fun capTexts() {
        if (floatingTexts.size > 40) floatingTexts.subList(0, floatingTexts.size - 25).clear()
    }

    // ========== 动画控制 ==========

    private fun startAnimation() {
        if (!isAnimating) {
            isAnimating = true
            lastFrameTime = 0L
            animator.start()
        }
    }

    private fun stopAnimation() {
        if (isAnimating) {
            isAnimating = false
            animator.cancel()
        }
    }

    private fun onAnimationFrame() {
        val now = System.currentTimeMillis()
        if (lastFrameTime > 0 && now - lastFrameTime < animFrameInterval) return
        lastFrameTime = now

        updateBubbles()
        updateTexts()
        updateBorderGlow()
        invalidate()

        if (bubbles.isEmpty() && floatingTexts.isEmpty() && borderGlowAlpha <= 0.01f) {
            stopAnimation()
        }
    }

    private fun updateBubbles() {
        val iter = bubbles.iterator()
        while (iter.hasNext()) {
            val b = iter.next()
            b.currentY -= b.speed
            b.alpha -= 0.008f
            if (b.alpha <= 0 || b.currentY < -b.radius * 2 || b.currentY > screenHeight + b.radius * 2) {
                iter.remove()
            }
        }
    }

    private fun updateTexts() {
        val iter = floatingTexts.iterator()
        while (iter.hasNext()) {
            val t = iter.next()
            t.currentY -= 1.5f
            t.scale = (t.scale + 0.05f).coerceAtMost(1.0f)
            val totalTravel = t.startY - t.currentY
            if (totalTravel > 200) {
                t.alpha -= 0.015f
            }
            if (t.alpha <= 0) iter.remove()
        }
    }

    private fun updateBorderGlow() {
        borderAnimPhase += 0.05f
        borderGlowWidth = 8f + sin(borderAnimPhase) * 4f
    }

    // ========== 绘制 ==========

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawBubbles(canvas)
        drawFloatingTexts(canvas)
        drawBorderGlow(canvas)
    }

    private fun drawBubbles(canvas: Canvas) {
        for (b in bubbles) {
            val driftX = sin(b.phase + b.currentY * 0.02f) * b.horizontalDrift * 3
            val dx = b.x + driftX

            glowPaint.color = b.color
            glowPaint.alpha = (b.alpha * 80).toInt().coerceIn(0, 255)
            canvas.drawCircle(dx, b.currentY, b.radius * 2f, glowPaint)

            bubblePaint.color = b.color
            bubblePaint.alpha = (b.alpha * 255).toInt().coerceIn(0, 255)
            canvas.drawCircle(dx, b.currentY, b.radius, bubblePaint)

            highlightPaint.alpha = (b.alpha * 60).toInt().coerceIn(0, 255)
            canvas.drawCircle(
                dx - b.radius * 0.25f,
                b.currentY - b.radius * 0.25f,
                b.radius * 0.35f,
                highlightPaint
            )
        }
    }

    private fun drawFloatingTexts(canvas: Canvas) {
        for (t in floatingTexts) {
            val sz = t.textSize * t.scale
            val alphaInt = (t.alpha * 255).toInt().coerceIn(0, 255)
            val shadowAlphaInt = (t.alpha * 120).toInt().coerceIn(0, 255)

            // 黑色阴影层（不用 setShadowLayer，兼容所有渲染层）
            shadowTextPaint.textSize = sz
            shadowTextPaint.alpha = shadowAlphaInt
            canvas.drawText(t.text, t.x + 2, t.currentY + 2, shadowTextPaint)

            // 彩色文字层
            textPaint.color = t.color
            textPaint.alpha = alphaInt
            textPaint.textSize = sz
            canvas.drawText(t.text, t.x, t.currentY, textPaint)
        }
    }

    private fun drawBorderGlow(canvas: Canvas) {
        if (borderGlowAlpha <= 0.01f) return
        val w = screenWidth
        val h = screenHeight
        val pulse = sin(borderAnimPhase) * 0.3f + 0.7f
        borderPaint.color = colorRoyalBlue

        for (i in 1..3) {
            borderPaint.strokeWidth = borderGlowWidth + i * 6
            borderPaint.alpha = (borderGlowAlpha * pulse * (80f / i)).toInt().coerceIn(0, 255)
            val inset = i * 3f
            canvas.drawRect(inset, inset, w - inset, h - inset, borderPaint)
        }
        borderPaint.strokeWidth = borderGlowWidth
        borderPaint.alpha = (borderGlowAlpha * pulse * 255).toInt().coerceIn(0, 255)
        canvas.drawRect(0f, 0f, w, h, borderPaint)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator.cancel()
        bubbles.clear()
        floatingTexts.clear()
    }
}
