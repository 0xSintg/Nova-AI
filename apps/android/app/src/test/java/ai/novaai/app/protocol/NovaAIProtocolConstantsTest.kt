package ai.novaai.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class NovaAIProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", NovaAICanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", NovaAICanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", NovaAICanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", NovaAICanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", NovaAICanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", NovaAICanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", NovaAICanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", NovaAICanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", NovaAICapability.Canvas.rawValue)
    assertEquals("camera", NovaAICapability.Camera.rawValue)
    assertEquals("voiceWake", NovaAICapability.VoiceWake.rawValue)
    assertEquals("talk", NovaAICapability.Talk.rawValue)
    assertEquals("location", NovaAICapability.Location.rawValue)
    assertEquals("sms", NovaAICapability.Sms.rawValue)
    assertEquals("device", NovaAICapability.Device.rawValue)
    assertEquals("notifications", NovaAICapability.Notifications.rawValue)
    assertEquals("system", NovaAICapability.System.rawValue)
    assertEquals("photos", NovaAICapability.Photos.rawValue)
    assertEquals("contacts", NovaAICapability.Contacts.rawValue)
    assertEquals("calendar", NovaAICapability.Calendar.rawValue)
    assertEquals("motion", NovaAICapability.Motion.rawValue)
    assertEquals("callLog", NovaAICapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", NovaAICameraCommand.List.rawValue)
    assertEquals("camera.snap", NovaAICameraCommand.Snap.rawValue)
    assertEquals("camera.clip", NovaAICameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", NovaAINotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", NovaAINotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", NovaAIDeviceCommand.Status.rawValue)
    assertEquals("device.info", NovaAIDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", NovaAIDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", NovaAIDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", NovaAISystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", NovaAIPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", NovaAIContactsCommand.Search.rawValue)
    assertEquals("contacts.add", NovaAIContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", NovaAICalendarCommand.Events.rawValue)
    assertEquals("calendar.add", NovaAICalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", NovaAIMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", NovaAIMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", NovaAISmsCommand.Send.rawValue)
    assertEquals("sms.search", NovaAISmsCommand.Search.rawValue)
  }

  @Test
  fun talkCommandsUseStableStrings() {
    assertEquals("talk.ptt.start", NovaAITalkCommand.PttStart.rawValue)
    assertEquals("talk.ptt.stop", NovaAITalkCommand.PttStop.rawValue)
    assertEquals("talk.ptt.cancel", NovaAITalkCommand.PttCancel.rawValue)
    assertEquals("talk.ptt.once", NovaAITalkCommand.PttOnce.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", NovaAICallLogCommand.Search.rawValue)
  }
}
