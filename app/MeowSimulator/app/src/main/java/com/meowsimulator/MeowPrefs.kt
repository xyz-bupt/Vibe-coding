package com.meowsimulator

import android.content.Context
import android.content.SharedPreferences

object MeowPrefs {
    private const val PREFS_NAME = "meow_prefs"
    private const val KEY_PREFIX = "prefix"
    private const val KEY_SUFFIX = "suffix"
    private const val KEY_OVERLAY_ENABLED = "overlay_enabled"

    const val DEFAULT_PREFIX = "喵～"
    const val DEFAULT_SUFFIX = "喵～"

    private fun getPrefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getPrefix(context: Context): String =
        getPrefs(context).getString(KEY_PREFIX, DEFAULT_PREFIX) ?: DEFAULT_PREFIX

    fun setPrefix(context: Context, prefix: String) =
        getPrefs(context).edit().putString(KEY_PREFIX, prefix).apply()

    fun getSuffix(context: Context): String =
        getPrefs(context).getString(KEY_SUFFIX, DEFAULT_SUFFIX) ?: DEFAULT_SUFFIX

    fun setSuffix(context: Context, suffix: String) =
        getPrefs(context).edit().putString(KEY_SUFFIX, suffix).apply()

    fun isOverlayEnabled(context: Context): Boolean =
        getPrefs(context).getBoolean(KEY_OVERLAY_ENABLED, false)

    fun setOverlayEnabled(context: Context, enabled: Boolean) =
        getPrefs(context).edit().putBoolean(KEY_OVERLAY_ENABLED, enabled).apply()

    fun meowify(text: String, context: Context): String {
        val prefix = getPrefix(context)
        val suffix = getSuffix(context)
        if (text.isBlank()) return text
        var result = text
        if (!result.startsWith(prefix)) result = "$prefix$result"
        if (!result.endsWith(suffix)) result = "$result$suffix"
        return result
    }
}
