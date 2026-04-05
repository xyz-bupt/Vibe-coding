package com.example.shoujiniang

import android.content.Context
import android.content.SharedPreferences

/**
 * 好感度管理器 — 维护 0~100 的好感度数值和 4 级等级系统。
 *
 * 等级划分：
 *   Lv.0 陌生  0~30
 *   Lv.1 普通  31~60
 *   Lv.2 友好  61~80
 *   Lv.3 亲密  81~100
 *
 * 数据通过 SharedPreferences 持久化，重启应用不丢失。
 */
class FavorabilityManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var score: Int = prefs.getInt(KEY_SCORE, DEFAULT_SCORE)
        private set

    val level: Int
        get() = when {
            score <= 30 -> 0
            score <= 60 -> 1
            score <= 80 -> 2
            else -> 3
        }

    val levelName: String
        get() = LEVEL_NAMES[level]

    val scaleForLevel: Float
        get() = LEVEL_SCALES[level]

    val alphaForLevel: Float
        get() = LEVEL_ALPHAS[level]

    private var lastAddTime = 0L

    /** 用户操作时调用，有 500ms 冷却。返回 true 表示加分成功。 */
    fun onUserInteract(): Boolean {
        val now = System.currentTimeMillis()
        if (now - lastAddTime < ADD_COOLDOWN) return false
        if (score >= MAX_SCORE) return false

        lastAddTime = now
        score = (score + 1).coerceAtMost(MAX_SCORE)
        save()
        return true
    }

    /** 空闲时调用（每 3 秒一次）。返回 true 表示扣分成功。 */
    fun onIdleTick(): Boolean {
        if (score <= 0) return false
        score = (score - 1).coerceAtLeast(0)
        save()
        return true
    }

    /** 从 SharedPreferences 重新加载最新数据（供其他组件读取最新状态）。 */
    fun reload() {
        score = prefs.getInt(KEY_SCORE, DEFAULT_SCORE)
    }

    /** 检查等级是否发生了变化（调用前后对比 level）。 */
    fun getLevelBeforeChange(oldScore: Int): Int = when {
        oldScore <= 30 -> 0
        oldScore <= 60 -> 1
        oldScore <= 80 -> 2
        else -> 3
    }

    fun getDisplayText(): String = "好感度: Lv.$level $levelName ($score/$MAX_SCORE)"

    private fun save() {
        prefs.edit().putInt(KEY_SCORE, score).apply()
    }

    companion object {
        private const val PREFS_NAME = "pet_favorability"
        private const val KEY_SCORE = "score"
        private const val DEFAULT_SCORE = 50
        private const val MAX_SCORE = 100
        private const val ADD_COOLDOWN = 500L

        private val LEVEL_NAMES = arrayOf("陌生", "普通", "友好", "亲密")
        private val LEVEL_SCALES = floatArrayOf(0.7f, 1.0f, 1.0f, 1.0f)
        private val LEVEL_ALPHAS = floatArrayOf(0.6f, 0.9f, 1.0f, 1.0f)
    }
}
