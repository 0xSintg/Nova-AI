package ai.novaai.app.node

import ai.novaai.app.protocol.NovaAICalendarCommand
import ai.novaai.app.protocol.NovaAICallLogCommand
import ai.novaai.app.protocol.NovaAICameraCommand
import ai.novaai.app.protocol.NovaAICanvasA2UICommand
import ai.novaai.app.protocol.NovaAICanvasCommand
import ai.novaai.app.protocol.NovaAICapability
import ai.novaai.app.protocol.NovaAIContactsCommand
import ai.novaai.app.protocol.NovaAIDeviceCommand
import ai.novaai.app.protocol.NovaAILocationCommand
import ai.novaai.app.protocol.NovaAIMotionCommand
import ai.novaai.app.protocol.NovaAINotificationsCommand
import ai.novaai.app.protocol.NovaAIPhotosCommand
import ai.novaai.app.protocol.NovaAISmsCommand
import ai.novaai.app.protocol.NovaAISystemCommand
import ai.novaai.app.protocol.NovaAITalkCommand

data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val sendSmsAvailable: Boolean,
  val readSmsAvailable: Boolean,
  val smsSearchPossible: Boolean,
  val callLogAvailable: Boolean,
  val photosAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val debugBuild: Boolean,
)

enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SendSmsAvailable,
  ReadSmsAvailable,
  RequestableSmsSearchAvailable,
  CallLogAvailable,
  PhotosAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  DebugBuild,
}

enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  CallLogAvailable,
  PhotosAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = NovaAICapability.Canvas.rawValue),
      NodeCapabilitySpec(name = NovaAICapability.Device.rawValue),
      NodeCapabilitySpec(name = NovaAICapability.Notifications.rawValue),
      NodeCapabilitySpec(name = NovaAICapability.System.rawValue),
      NodeCapabilitySpec(
        name = NovaAICapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = NovaAICapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = NovaAICapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(name = NovaAICapability.Talk.rawValue),
      NodeCapabilitySpec(
        name = NovaAICapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(
        name = NovaAICapability.Photos.rawValue,
        availability = NodeCapabilityAvailability.PhotosAvailable,
      ),
      NodeCapabilitySpec(name = NovaAICapability.Contacts.rawValue),
      NodeCapabilitySpec(name = NovaAICapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = NovaAICapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
      NodeCapabilitySpec(
        name = NovaAICapability.CallLog.rawValue,
        availability = NodeCapabilityAvailability.CallLogAvailable,
      ),
    )

  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = NovaAICanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAICanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = NovaAISystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAITalkCommand.PttStart.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAITalkCommand.PttStop.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAITalkCommand.PttCancel.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAITalkCommand.PttOnce.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAICameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = NovaAICameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = NovaAICameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = NovaAILocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = NovaAIDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAIDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAIDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAIDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAINotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAINotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAIPhotosCommand.Latest.rawValue,
        availability = InvokeCommandAvailability.PhotosAvailable,
      ),
      InvokeCommandSpec(
        name = NovaAIContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAIContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAICalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAICalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = NovaAIMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = NovaAIMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = NovaAISmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SendSmsAvailable,
      ),
      InvokeCommandSpec(
        name = NovaAISmsCommand.Search.rawValue,
        availability = InvokeCommandAvailability.RequestableSmsSearchAvailable,
      ),
      InvokeCommandSpec(
        name = NovaAICallLogCommand.Search.rawValue,
        availability = InvokeCommandAvailability.CallLogAvailable,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> =
    capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.sendSmsAvailable || flags.readSmsAvailable
          NodeCapabilityAvailability.CallLogAvailable -> flags.callLogAvailable
          NodeCapabilityAvailability.PhotosAvailable -> flags.photosAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }.map { it.name }

  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> =
    all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SendSmsAvailable -> flags.sendSmsAvailable
          InvokeCommandAvailability.ReadSmsAvailable -> flags.readSmsAvailable
          InvokeCommandAvailability.RequestableSmsSearchAvailable -> flags.smsSearchPossible
          InvokeCommandAvailability.CallLogAvailable -> flags.callLogAvailable
          InvokeCommandAvailability.PhotosAvailable -> flags.photosAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }.map { it.name }
}
