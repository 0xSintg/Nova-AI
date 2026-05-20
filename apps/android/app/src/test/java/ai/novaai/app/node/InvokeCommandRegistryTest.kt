package ai.novaai.app.node

import ai.novaai.app.protocol.NovaAICalendarCommand
import ai.novaai.app.protocol.NovaAICallLogCommand
import ai.novaai.app.protocol.NovaAICameraCommand
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
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      NovaAICapability.Canvas.rawValue,
      NovaAICapability.Device.rawValue,
      NovaAICapability.Notifications.rawValue,
      NovaAICapability.System.rawValue,
      NovaAICapability.Talk.rawValue,
      NovaAICapability.Contacts.rawValue,
      NovaAICapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      NovaAICapability.Camera.rawValue,
      NovaAICapability.Location.rawValue,
      NovaAICapability.Sms.rawValue,
      NovaAICapability.CallLog.rawValue,
      NovaAICapability.VoiceWake.rawValue,
      NovaAICapability.Motion.rawValue,
      NovaAICapability.Photos.rawValue,
    )

  private val coreCommands =
    setOf(
      NovaAIDeviceCommand.Status.rawValue,
      NovaAIDeviceCommand.Info.rawValue,
      NovaAIDeviceCommand.Permissions.rawValue,
      NovaAIDeviceCommand.Health.rawValue,
      NovaAINotificationsCommand.List.rawValue,
      NovaAINotificationsCommand.Actions.rawValue,
      NovaAISystemCommand.Notify.rawValue,
      NovaAITalkCommand.PttStart.rawValue,
      NovaAITalkCommand.PttStop.rawValue,
      NovaAITalkCommand.PttCancel.rawValue,
      NovaAITalkCommand.PttOnce.rawValue,
      NovaAIContactsCommand.Search.rawValue,
      NovaAIContactsCommand.Add.rawValue,
      NovaAICalendarCommand.Events.rawValue,
      NovaAICalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      NovaAICameraCommand.Snap.rawValue,
      NovaAICameraCommand.Clip.rawValue,
      NovaAICameraCommand.List.rawValue,
      NovaAILocationCommand.Get.rawValue,
      NovaAIMotionCommand.Activity.rawValue,
      NovaAIMotionCommand.Pedometer.rawValue,
      NovaAISmsCommand.Send.rawValue,
      NovaAISmsCommand.Search.rawValue,
      NovaAICallLogCommand.Search.rawValue,
      NovaAIPhotosCommand.Latest.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          photosAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          photosAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(NovaAIMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(NovaAIMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(NovaAISmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(NovaAISmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(NovaAISmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(NovaAISmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(NovaAISmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(NovaAICapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(NovaAICapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(NovaAICapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(NovaAICallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(NovaAICapability.CallLog.rawValue))
  }

  @Test
  fun advertisedPhotosSurface_respectsFeatureAvailability() {
    val disabledFlags = defaultFlags(photosAvailable = false)
    val enabledFlags = defaultFlags(photosAvailable = true)

    assertFalse(InvokeCommandRegistry.advertisedCapabilities(disabledFlags).contains(NovaAICapability.Photos.rawValue))
    assertFalse(InvokeCommandRegistry.advertisedCommands(disabledFlags).contains(NovaAIPhotosCommand.Latest.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCapabilities(enabledFlags).contains(NovaAICapability.Photos.rawValue))
    assertTrue(InvokeCommandRegistry.advertisedCommands(enabledFlags).contains(NovaAIPhotosCommand.Latest.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(NovaAICapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(NovaAICameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(NovaAILocationCommand.Get.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    photosAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      photosAvailable = photosAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
