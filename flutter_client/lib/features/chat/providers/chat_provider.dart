import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../models/message.dart';
import '../data/chat_repository.dart';

final chatProvider = StateNotifierProvider<ChatNotifier, List<ChatMessage>>((ref) {
  return ChatNotifier(ref.read(chatRepositoryProvider), ref);
});

final isAiThinkingProvider = StateProvider<bool>((ref) => false);
final isSpeakingProvider = StateProvider<bool>((ref) => false);

class ChatNotifier extends StateNotifier<List<ChatMessage>> {
  final ChatRepository _repository;
  final Ref _ref;
  final FlutterTts _flutterTts = FlutterTts();

  ChatNotifier(this._repository, this._ref) : super([]) {
    _initTts();
    state = [
      ChatMessage(
        id: 'init',
        content: 'Hello! I am AI LifeOS. How can I assist you today?',
        role: MessageRole.ai,
      )
    ];
  }

  Future<void> _initTts() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.1);
    
    _flutterTts.setCompletionHandler(() {
      _ref.read(isSpeakingProvider.notifier).state = false;
    });
  }

  Future<void> speak(String text) async {
    _ref.read(isSpeakingProvider.notifier).state = true;
    await _flutterTts.speak(text);
  }

  Future<void> stopSpeaking() async {
    await _flutterTts.stop();
    _ref.read(isSpeakingProvider.notifier).state = false;
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    
    await stopSpeaking();

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
      final stream = _repository.sendMessageStream(text);
      await for (final chunk in stream) {
        if (_ref.read(isAiThinkingProvider)) {
          _ref.read(isAiThinkingProvider.notifier).state = false;
        }
        
        fullResponse += chunk;
        
        state = state.map((msg) {
          if (msg.id == aiMsgId) {
            return msg.copyWith(content: fullResponse);
          }
          return msg;
        }).toList();
      }
      
      if (fullResponse.isNotEmpty) {
        await speak(fullResponse);
      }
      
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
}
