package com.example.shoujiniang

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * 主界面 — 管理无障碍服务的开启/关闭状态，显示当前好感度。
 */
class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var favorText: TextView
    private lateinit var btnAction: Button
    private lateinit var handler: Handler
    private lateinit var favorManager: FavorabilityManager

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

        favorManager = FavorabilityManager(this)
        statusText = findViewById(R.id.status_text)
        favorText = findViewById(R.id.favor_text)
        btnAction = findViewById(R.id.btn_open_settings)
        handler = Handler(Looper.getMainLooper())

        btnAction.setOnClickListener {
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
        val running = PetOverlayService.isRunning(this)
        favorManager.reload()
        favorText.text = favorManager.getDisplayText()

        if (running) {
            statusText.text = getString(R.string.status_enabled)
            btnAction.text = getString(R.string.btn_stop)
            btnAction.setOnClickListener {
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
