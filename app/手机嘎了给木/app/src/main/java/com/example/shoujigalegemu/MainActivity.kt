package com.example.shoujigalegemu

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * 主界面 — 管理无障碍服务的开启/关闭状态。
 * 真正的视觉效果由 BubbleOverlayService 在系统层面运行。
 */
class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var btnAction: Button
    private lateinit var handler: Handler

    private val checkInterval = 1000L
    private val checkRunnable = object : Runnable {
        override fun run() {
            updateStatus()
            handler.postDelayed(this, checkInterval)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.status_text)
        btnAction = findViewById(R.id.btn_open_settings)
        handler = Handler(Looper.getMainLooper())

        btnAction.setOnClickListener {
            // 打开系统无障碍设置页
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
        }

        updateStatus()
    }

    override fun onResume() {
        super.onResume()
        handler.removeCallbacks(checkRunnable)
        handler.post(checkRunnable)
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(checkRunnable)
    }

    private fun updateStatus() {
        val running = BubbleOverlayService.isRunning(this)
        if (running) {
            statusText.text = getString(R.string.status_enabled)
            btnAction.text = getString(R.string.btn_stop)
            btnAction.setOnClickListener {
                // 引导用户去关闭
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
            }
        } else {
            statusText.text = getString(R.string.status_disabled)
            btnAction.text = getString(R.string.btn_open_settings)
            btnAction.setOnClickListener {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
            }
        }
    }
}
