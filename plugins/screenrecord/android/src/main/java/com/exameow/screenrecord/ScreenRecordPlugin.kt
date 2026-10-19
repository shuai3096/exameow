package com.exameow.screenrecord

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.activity.result.ActivityResult
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Channel
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import app.tauri.plugin.PluginManager

object ScreenRecordRuntime {
  var events: Channel? = null
  var service: ScreenRecordService? = null
  var overlay: OverlayController? = null

  fun send(type: String, fill: (JSObject.() -> Unit) = {}) {
    val obj = JSObject()
    obj.put("type", type)
    fill(obj)
    try {
      events?.send(obj)
    } catch (e: Exception) {
      Log.e("ScreenRecord", "send event failed", e)
    }
  }
}

@InvokeArg
class StartSessionArgs {
  lateinit var events: Channel
}

@InvokeArg
class ShowAnswerArgs {
  var paused: Boolean = false
  var found: Boolean = false
  var answer: String = ""
  var stem: String = ""
  var options: List<String> = emptyList()
  var bankName: String = ""
  var dark: Boolean = false
}

@TauriPlugin
class ScreenRecordPlugin(private val activity: Activity) : Plugin(activity), OverlayController.Listener {

  @Volatile
  private var adjusting = true

  override fun load(webView: android.webkit.WebView) {}

  @Command
  fun startSession(invoke: Invoke) {
    val args = invoke.parseArgs(StartSessionArgs::class.java)
    ScreenRecordRuntime.events = args.events

    if (!Settings.canDrawOverlays(activity)) {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${activity.packageName}")
      )
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      activity.startActivity(intent)
      invoke.reject("overlay_permission_required")
      return
    }

    if (Build.VERSION.SDK_INT >= 33 &&
      activity.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      PluginManager.requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS)) {
        startProjectionConsent(invoke)
      }
      return
    }

    startProjectionConsent(invoke)
  }

  private fun startProjectionConsent(invoke: Invoke) {
    try {
      val mgr = activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
      startActivityForResult(invoke, mgr.createScreenCaptureIntent(), "onProjectionResult")
    } catch (e: Exception) {
      invoke.reject("projection_intent_failed: ${e.message}")
    }
  }

  @ActivityCallback
  fun onProjectionResult(invoke: Invoke, result: ActivityResult) {
    if (result.resultCode != Activity.RESULT_OK || result.data == null) {
      ScreenRecordRuntime.send("denied")
      invoke.reject("projection_denied")
      return
    }

    val intent = Intent(activity, ScreenRecordService::class.java).apply {
      action = ScreenRecordService.ACTION_START
      putExtra(ScreenRecordService.EXTRA_RESULT_CODE, result.resultCode)
      putExtra(ScreenRecordService.EXTRA_DATA, result.data)
    }
    activity.startForegroundService(intent)

    val overlay = OverlayController(activity, this)
    ScreenRecordRuntime.overlay = overlay
    overlay.showInitial()
    overlay.setAdjusting(true)
    Log.i("ScreenRecord", "overlays shown")

    invoke.resolve()
  }

  @Command
  fun begin(invoke: Invoke) {
    adjusting = false
    ScreenRecordRuntime.overlay?.setAdjusting(false)
    ScreenRecordRuntime.overlay?.hideFrame()
    ScreenRecordRuntime.service?.startCapture()
    invoke.resolve()
  }

  @Command
  fun adjust(invoke: Invoke) {
    adjusting = true
    ScreenRecordRuntime.overlay?.setAdjusting(true)
    ScreenRecordRuntime.service?.stopCapture()
    ScreenRecordRuntime.overlay?.showFrame()
    invoke.resolve()
  }

  @Command
  fun stop(invoke: Invoke) {
    teardown()
    invoke.resolve()
  }

  @Command
  fun showAnswer(invoke: Invoke) {
    val args = invoke.parseArgs(ShowAnswerArgs::class.java)
    ScreenRecordRuntime.overlay?.let { overlay ->
      overlay.setDark(args.dark)
      overlay.updateAnswer(
        paused = args.paused,
        found = args.found,
        answer = args.answer,
        stem = args.stem,
        options = args.options,
        bankName = args.bankName,
      )
    }
    invoke.resolve()
  }

  override fun onBeginClicked() {
    Log.i("ScreenRecord", "onBeginClicked")
    adjusting = false
    val overlay = ScreenRecordRuntime.overlay
    overlay?.markBegan()
    overlay?.setAdjusting(false)
    overlay?.hideFrame()
    ScreenRecordRuntime.service?.startCapture()
    ScreenRecordRuntime.send("begin")
  }

  override fun onAdjustClicked() {
    adjusting = !adjusting
    Log.i("ScreenRecord", "onAdjustClicked, adjusting=$adjusting")
    val overlay = ScreenRecordRuntime.overlay
    overlay?.setAdjusting(adjusting)
    if (adjusting) {
      ScreenRecordRuntime.service?.stopCapture()
      overlay?.showFrame()
      ScreenRecordRuntime.send("adjust")
    } else {
      overlay?.hideFrame()
      ScreenRecordRuntime.service?.startCapture()
      ScreenRecordRuntime.send("begin")
    }
  }

  override fun onExitClicked() {
    teardown()
    ScreenRecordRuntime.send("exit")
  }

  private fun teardown() {
    ScreenRecordRuntime.overlay?.removeAll()
    ScreenRecordRuntime.overlay = null
    val intent = Intent(activity, ScreenRecordService::class.java).apply {
      action = ScreenRecordService.ACTION_STOP
    }
    try {
      activity.startService(intent)
    } catch (e: Exception) {
      Log.w("ScreenRecord", "stop service failed", e)
    }
  }
}
