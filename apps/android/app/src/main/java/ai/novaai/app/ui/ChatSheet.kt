package ai.novaai.app.ui

import ai.novaai.app.MainViewModel
import ai.novaai.app.ui.chat.ChatSheetContent
import androidx.compose.runtime.Composable

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
