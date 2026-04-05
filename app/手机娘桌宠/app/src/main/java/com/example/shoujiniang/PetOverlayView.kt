package com.example.shoujiniang

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.os.Build
import android.view.View
import android.view.WindowManager
import kotlin.math.sin
import kotlin.random.Random

/**
 * 系统级悬浮视图 — FLAG_NOT_TOUCHABLE，不干扰任何触摸操作。
 *
 * 分层绘制（底→顶）：
 *   1. 好感度等级光晕（常驻，颜色/强度随等级递增）
 *   2. 空闲蓝色光晕（叠加）
 *   3. 气泡 + "好感度++/--" 文字
 *   4. 手机娘角色 PNG + 等级标签
 *   5. 爱心粒子
 */
class PetOverlayView(context: Context) : View(context) {

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

    private data class HeartParticle(
        var x: Float,
        var y: Float,
        var alpha: Float,
        val speed: Float,
        val size: Float,
        val phase: Float
    )

    // ========== 颜色常量 ==========

    private val colorPinkHot = Color.parseColor("#FFFF69B4")
    private val colorRoyalBlue = Color.parseColor("#FF4169E1")
    private val colorTeal = Color.parseColor("#FF00CED1")

    // ========== 数据列表 ==========

    private val bubbles = mutableListOf<Bubble>()
    private val floatingTexts = mutableListOf<FloatingText>()
    private val hearts = mutableListOf<HeartParticle>()

    // ========== 角色相关 ==========

    private var petBitmap: Bitmap? = null
    private val petSizeBase = 220f
    private var petX = 0f
    private var petY = 0f
    private var petScale = 1.0f
    private var petAlpha = 1.0f
    private var petTargetScale = 1.0f
    private var petTargetAlpha = 1.0f

    // 弹簧弹跳
    private var petBounceOffset = 0f
    private var petBounceVelocity = 0f
    private var isBouncing = false
    private val springStiffness = 0.12f
    private val springDamping = 0.75f

    // 等级信息
    private var currentLevel = 1
    private var levelText = "Lv.1 普通"

    // 好感度光晕
    private var levelGlowAlpha = 0f
    private var levelGlowTargetAlpha = 0.2f
    private var levelGlowColor = Color.WHITE
    private var levelGlowPhase = 0f

    // 呼吸动画
    private var breathPhase = 0f

    // 眨眼动画
    private var blinkTimer = 0f
    private var isBlinking = false

    // 跳跃计时器
    private var jumpTimer = 0f

    // 爱心粒子
    private var heartTimer = 0f

    // ========== 画笔 ==========

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
    private val levelGlowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
    }
    private val highlightPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.WHITE
    }
    private val heartPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = colorPinkHot
    }
    private val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        isFilterBitmap = true
    }
    private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
        color = Color.WHITE
        textSize = 24f
    }
    private val labelShadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
        color = Color.BLACK
        textSize = 24f
    }

    // ========== 空闲蓝色光晕 ==========

    var borderGlowAlpha = 0f
        private set
    private var borderGlowWidth = 8f
    private var borderAnimPhase = 0f

    // ========== 动画帧控制 ==========

    private var isAnimating = false
    private val animFrameInterval = 16L
    private var lastFrameTime = 0L
    private val animator = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = Long.MAX_VALUE
        repeatCount = ValueAnimator.INFINITE
        addUpdateListener { onAnimationFrame() }
    }

    private val random = Random.Default
    private var screenWidth = 1080f
    private var screenHeight = 2400f
    private var density = 1f

    init {
        setWillNotDraw(false)
        refreshScreenSize()
        loadPetBitmap()
    }

    private fun loadPetBitmap() {
        try {
            petBitmap = BitmapFactory.decodeResource(context.resources, R.drawable.pet_character)
        } catch (_: Exception) { }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = MeasureSpec.getSize(widthMeasureSpec)
        val h = MeasureSpec.getSize(heightMeasureSpec)
        if (w > 0 && h > 0) {
            screenWidth = w.toFloat()
            screenHeight = h.toFloat()
        }
        updatePetPosition()
        setMeasuredDimension(
            if (w > 0) w else screenWidth.toInt(),
            if (h > 0) h else screenHeight.toInt()
        )
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        refreshScreenSize()
        updatePetPosition()
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
            density = context.resources.displayMetrics.density
        } catch (_: Exception) { }
    }

    private fun updatePetPosition() {
        val margin = 16f * density
        petX = screenWidth - petSizeBase * petScale / 2 - margin
        petY = screenHeight - petSizeBase * petScale / 2 - margin - 80f * density
    }

    // ========== 公开接口 ==========

    fun onUserInteracted() {
        spawnEdgeBubbles()
        spawnPlusText()
        triggerBounce()
        startAnimation()
    }

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

    fun setBorderGlowAlpha(alpha: Float) {
        borderGlowAlpha = alpha.coerceIn(0f, 0.8f)
        if (borderGlowAlpha > 0.01f) startAnimation()
    }

    fun updateLevel(level: Int, levelName: String, scale: Float, alpha: Float) {
        currentLevel = level
        this.levelText = "Lv.$level $levelName"
        petTargetScale = scale
        petTargetAlpha = alpha

        levelGlowColor = when (level) {
            0 -> Color.parseColor("#33444466")
            1 -> Color.WHITE
            2 -> colorTeal
            else -> colorPinkHot
        }
        levelGlowTargetAlpha = when (level) {
            0 -> 0.08f
            1 -> 0.2f
            2 -> 0.35f
            else -> 0.5f
        }

        updatePetPosition()
        startAnimation()
    }

    // ========== 弹簧弹跳 ==========

    private fun triggerBounce() {
        isBouncing = true
        petBounceVelocity = 20f * density
    }

    private fun updatePetBounce() {
        if (!isBouncing && petBounceOffset == 0f) return
        val springForce = -petBounceOffset * springStiffness * density
        petBounceVelocity += springForce
        petBounceVelocity *= springDamping
        petBounceOffset += petBounceVelocity

        if (kotlin.math.abs(petBounceOffset) < 0.5f && kotlin.math.abs(petBounceVelocity) < 0.5f) {
            petBounceOffset = 0f
            petBounceVelocity = 0f
            isBouncing = false
        }
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

    // ========== 爱心粒子 ==========

    private fun spawnHearts() {
        if (currentLevel < 3) return
        for (i in 0..1) {
            hearts.add(
                HeartParticle(
                    x = petX + random.nextFloat() * petSizeBase * petScale - petSizeBase * petScale / 2,
                    y = petY + petBounceOffset,
                    alpha = 0.8f,
                    speed = random.nextFloat() * 2 + 1,
                    size = random.nextFloat() * 12 + 8,
                    phase = random.nextFloat() * Math.PI.toFloat() * 2
                )
            )
        }
        if (hearts.size > 30) hearts.subList(0, hearts.size - 20).clear()
    }

    // ========== 动画控制 ==========

    private fun startAnimation() {
        if (!isAnimating) {
            isAnimating = true
            lastFrameTime = 0L
            animator.start()
        }
    }

    private fun onAnimationFrame() {
        val now = System.currentTimeMillis()
        if (lastFrameTime > 0 && now - lastFrameTime < animFrameInterval) return
        lastFrameTime = now

        updateBubbles()
        updateTexts()
        updateBorderGlow()
        updateLevelGlow()
        updatePetAnimation()
        updateHearts()
        invalidate()
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

    private fun updateLevelGlow() {
        levelGlowPhase += 0.03f
        levelGlowAlpha += (levelGlowTargetAlpha - levelGlowAlpha) * 0.03f
    }

    private fun updatePetAnimation() {
        breathPhase += 0.03f
        petScale += (petTargetScale - petScale) * 0.05f
        petAlpha += (petTargetAlpha - petAlpha) * 0.05f
        updatePetBounce()

        if (currentLevel >= 1) {
            blinkTimer += 0.02f
            if (!isBlinking && blinkTimer > 8f) {
                isBlinking = true
                blinkTimer = 0f
            }
            if (isBlinking && blinkTimer > 0.3f) {
                isBlinking = false
                blinkTimer = 0f
            }
        }

        if (currentLevel >= 2) {
            jumpTimer += 0.016f
            if (jumpTimer > 5f && !isBouncing) {
                triggerBounce()
                jumpTimer = 0f
            }
        }

        if (currentLevel >= 3) {
            heartTimer += 0.016f
            if (heartTimer > 1.5f) {
                spawnHearts()
                heartTimer = 0f
            }
        }

        updatePetPosition()
    }

    private fun updateHearts() {
        val iter = hearts.iterator()
        while (iter.hasNext()) {
            val h = iter.next()
            h.y -= h.speed
            h.x += sin(h.phase + h.y * 0.03f) * 1.5f
            h.alpha -= 0.01f
            if (h.alpha <= 0 || h.y < 0) iter.remove()
        }
    }

    // ========== 绘制 ==========

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawLevelGlow(canvas)
        drawBorderGlow(canvas)
        drawBubbles(canvas)
        drawFloatingTexts(canvas)
        drawPetCharacter(canvas)
        drawHearts(canvas)
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
            shadowTextPaint.textSize = sz
            shadowTextPaint.alpha = shadowAlphaInt
            canvas.drawText(t.text, t.x + 2, t.currentY + 2, shadowTextPaint)
            textPaint.color = t.color
            textPaint.alpha = alphaInt
            textPaint.textSize = sz
            canvas.drawText(t.text, t.x, t.currentY, textPaint)
        }
    }

    private fun drawLevelGlow(canvas: Canvas) {
        if (levelGlowAlpha < 0.01f) return
        val w = screenWidth
        val h = screenHeight
        val pulse = sin(levelGlowPhase) * 0.2f + 0.8f
        levelGlowPaint.color = levelGlowColor
        for (i in 1..4) {
            levelGlowPaint.strokeWidth = 12f + i * 8
            levelGlowPaint.alpha = (levelGlowAlpha * pulse * (60f / i)).toInt().coerceIn(0, 255)
            val inset = i * 4f
            canvas.drawRect(inset, inset, w - inset, h - inset, levelGlowPaint)
        }
        levelGlowPaint.strokeWidth = 12f
        levelGlowPaint.alpha = (levelGlowAlpha * pulse * 200).toInt().coerceIn(0, 255)
        canvas.drawRect(0f, 0f, w, h, levelGlowPaint)
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

    private fun drawPetCharacter(canvas: Canvas) {
        val bmp = petBitmap ?: return
        val breathScale = 1f + sin(breathPhase) * 0.03f
        val blinkAlpha = if (isBlinking) petAlpha * 0.3f else petAlpha
        val finalAlpha = blinkAlpha.coerceIn(0f, 1f)
        val size = petSizeBase * petScale * breathScale
        val cx = petX
        val cy = petY + petBounceOffset

        val src = Rect(0, 0, bmp.width, bmp.height)
        val dst = RectF(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2)
        bitmapPaint.alpha = (finalAlpha * 255).toInt().coerceIn(0, 255)
        canvas.drawBitmap(bmp, src, dst, bitmapPaint)

        val labelTextSize = 20f * density
        labelPaint.textSize = labelTextSize
        labelShadowPaint.textSize = labelTextSize
        val labelY = cy + size / 2 + 20f * density
        labelShadowPaint.alpha = (finalAlpha * 120).toInt().coerceIn(0, 255)
        canvas.drawText(levelText, cx + 1, labelY + 1, labelShadowPaint)
        labelPaint.color = when (currentLevel) {
            0 -> colorRoyalBlue
            1 -> Color.WHITE
            2 -> colorTeal
            else -> colorPinkHot
        }
        labelPaint.alpha = (finalAlpha * 255).toInt().coerceIn(0, 255)
        canvas.drawText(levelText, cx, labelY, labelPaint)
    }

    private fun drawHearts(canvas: Canvas) {
        for (h in hearts) {
            heartPaint.alpha = (h.alpha * 255).toInt().coerceIn(0, 255)
            drawHeart(canvas, h.x, h.y, h.size, heartPaint)
        }
    }

    private fun drawHeart(canvas: Canvas, x: Float, y: Float, size: Float, paint: Paint) {
        val path = Path()
        val half = size / 2f
        path.moveTo(x, y + half * 0.4f)
        path.cubicTo(x, y - half * 0.3f, x - half, y - half * 0.6f, x - half, y + half * 0.1f)
        path.cubicTo(x - half, y + half * 0.6f, x, y + half, x, y + half * 1.2f)
        path.cubicTo(x, y + half, x + half, y + half * 0.6f, x + half, y + half * 0.1f)
        path.cubicTo(x + half, y - half * 0.6f, x, y - half * 0.3f, x, y + half * 0.4f)
        path.close()
        canvas.drawPath(path, paint)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator.cancel()
        bubbles.clear()
        floatingTexts.clear()
        hearts.clear()
        petBitmap?.recycle()
        petBitmap = null
    }
}
