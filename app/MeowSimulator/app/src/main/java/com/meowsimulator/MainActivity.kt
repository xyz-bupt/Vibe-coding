package com.meowsimulator

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.text.Editable
import android.text.TextWatcher
import android.widget.Button
import android.widget.EditText
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var switchOverlay: Switch
    private lateinit var etPrefix: EditText
    private lateinit var etSuffix: EditText
    private lateinit var tvStatus: TextView
    private lateinit var btnSetupOverlay: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        switchOverlay = findViewById(R.id.switchOverlay)
        etPrefix = findViewById(R.id.etPrefix)
        etSuffix = findViewById(R.id.etSuffix)
        tvStatus = findViewById(R.id.tvStatus)
        btnSetupOverlay = findViewById(R.id.btnSetupOverlay)

        etPrefix.setText(MeowPrefs.getPrefix(this))
        etSuffix.setText(MeowPrefs.getSuffix(this))
        switchOverlay.isChecked = MeowPrefs.isOverlayEnabled(this)

        setupListeners()
        updateStatus()
    }

    override fun onResume() {
        super.onResume()
        updateStatus()
    }

    private fun setupListeners() {
        switchOverlay.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked && !Settings.canDrawOverlays(this)) {
                showOverlayPermissionDialog()
                switchOverlay.isChecked = false
                return@setOnCheckedChangeListener
            }
            MeowPrefs.setOverlayEnabled(this, isChecked)
            if (isChecked) startOverlay() else stopOverlay()
            updateStatus()
        }

        etPrefix.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                MeowPrefs.setPrefix(this@MainActivity, s?.toString() ?: MeowPrefs.DEFAULT_PREFIX)
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        etSuffix.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                MeowPrefs.setSuffix(this@MainActivity, s?.toString() ?: MeowPrefs.DEFAULT_SUFFIX)
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        btnSetupOverlay.setOnClickListener {
            if (Settings.canDrawOverlays(this)) {
                Toast.makeText(this, "喵～ 悬浮窗权限已开启", Toast.LENGTH_SHORT).show()
            } else {
                startActivity(
                    Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:$packageName"))
                )
            }
        }
    }

    private fun updateStatus() {
        val overlayOk = Settings.canDrawOverlays(this)
        val overlayOn = MeowPrefs.isOverlayEnabled(this) && overlayOk
        val serviceRunning = MeowOverlayService.isRunning

        tvStatus.text = buildString {
            append("悬浮输入框：")
            append(when {
                serviceRunning -> "运行中 ✓"
                overlayOn -> "已开启（未运行）"
                else -> "未开启"
            })
            append("\n悬浮窗权限：")
            append(if (overlayOk) "已授权 ✓" else "未授权 ✗")
            append("\n\n使用方式：")
            append(if (serviceRunning) "\n打开微信 → 点悬浮框 → 输入 → 复制 → 粘贴发送" else "\n请先开启悬浮输入框")
        }

        btnSetupOverlay.text = if (overlayOk) "已授权 ✓" else "开启悬浮窗权限"
    }

    private fun showOverlayPermissionDialog() {
        AlertDialog.Builder(this)
            .setTitle("开启悬浮窗权限")
            .setMessage("需要悬浮窗权限才能显示猫娘输入框喵～\n\n点击「去设置」开启权限。")
            .setPositiveButton("去设置") { _, _ ->
                startActivity(
                    Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:$packageName"))
                )
            }
            .setNegativeButton("取消", null)
            .show()
    }

    private fun startOverlay() {
        val intent = Intent(this, MeowOverlayService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopOverlay() {
        stopService(Intent(this, MeowOverlayService::class.java))
    }
}
