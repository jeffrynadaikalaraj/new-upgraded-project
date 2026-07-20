import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/message.dart';
import '../data/chat_repository.dart';

final chatProvider = StateNotifierProvider<ChatNotifier, List<ChatMessage>>((ref) {
  return ChatNotifier(ref.read(chatRepositoryProvider), ref);
});

final isAiThinkingProvider = StateProvider<bool>((ref) => false);
final isSpeakingProvider = StateProvider<bool>((ref) => false);

final chatHistoryProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.read(chatRepositoryProvider);
  return await repository.getChatHistory();
});

class ChatNotifier extends StateNotifier<List<ChatMessage>> {
  final ChatRepository _repository;
  final Ref _ref;
  String? currentChatId;

  ChatNotifier(this._repository, this._ref) : super([]) {
    state = [
      ChatMessage(
        id: 'init',
        content: 'Hello! I am AI LifeOS. How can I assist you today?',
        role: MessageRole.ai,
      )
    ];
  }

  void newChat() {
    currentChatId = null;
    state = [
      ChatMessage(
        id: 'init_${DateTime.now().millisecondsSinceEpoch}',
        content: 'Hello! I am AI LifeOS. How can I assist you today?',
        role: MessageRole.ai,
      )
    ];
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMsgId = DateTime.now().millisecondsSinceEpoch.toString();
    final aiMsgId = 'ai_$userMsgId';

    state = [
      ...state,
      ChatMessage(id: userMsgId, content: text, role: MessageRole.user),
    ];

    state = [
      ...state,
      ChatMessage(id: aiMsgId, content: '', role: MessageRole.ai),
    ];

    _ref.read(isAiThinkingProvider.notifier).state = true;
    String fullResponse = '';

    try {
      final stream = _repository.sendMessageStream(text, chatId: currentChatId);
      await for (final chunk in stream) {
        if (_ref.read(isAiThinkingProvider)) {
          _ref.read(isAiThinkingProvider.notifier).state = false;
        }
        
        if (chunk.containsKey('chatId')) {
          currentChatId = chunk['chatId'];
        }
        
        if (chunk.containsKey('content')) {
          fullResponse += chunk['content'];
          
          state = state.map((msg) {
            if (msg.id == aiMsgId) {
              return msg.copyWith(content: fullResponse);
            }
            return msg;
          }).toList();
        }
      }
      _ref.invalidate(chatHistoryProvider);
    } catch (e) {
      _ref.read(isAiThinkingProvider.notifier).state = false;
      state = [
        ...state,
        ChatMessage(
          id: 'err_$userMsgId',
          content: 'Sorry, I encountered a network error. ($e)',
          role: MessageRole.system,
        )
      ];
    }
  }

  Future<void> loadChat(String chatId) async {
    try {
      _ref.read(isAiThinkingProvider.notifier).state = true;
      final data = await _repository.getChat(chatId);
      currentChatId = chatId;
      
      final messages = data['messages'] as List<dynamic>? ?? [];
      
      state = messages.map((m) {
        return ChatMessage(
          id: m['_id'] ?? m['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
          content: m['content'] ?? '',
          role: m['role'] == 'assistant' ? MessageRole.ai : MessageRole.user,
        );
      }).toList();
      
      if (state.isEmpty) {
        state = [
          ChatMessage(
            id: 'init_${DateTime.now().millisecondsSinceEpoch}',
            content: 'Chat loaded, but no messages found.',
            role: MessageRole.system,
          )
        ];
      }
    } catch (e) {
      state = [
        ChatMessage(
          id: 'err_load',
          content: 'Failed to load chat: $e',
          role: MessageRole.system,
        )
      ];
    } finally {
      _ref.read(isAiThinkingProvider.notifier).state = false;
    }
  }
}
