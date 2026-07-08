import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/chat_provider.dart';
import '../widgets/message_bubble.dart';
import '../widgets/chat_input.dart';
import '../widgets/avatar_widget.dart';

class ChatScreen extends ConsumerWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(chatProvider);
    final isThinking = ref.watch(isAiThinkingProvider);
    final isSpeaking = ref.watch(isSpeakingProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI LifeOS', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          )
        ],
      ),
      body: Column(
        children: [
          // The AI Avatar header area
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24.0),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: const Color(0xFF0f172a),
              border: const Border(bottom: BorderSide(color: Color(0xFF1e293b))),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                )
              ]
            ),
            child: PulsingAvatar(
              isThinking: isThinking,
              isSpeaking: isSpeaking,
            ),
          ),
          
          Expanded(
            child: ListView.builder(
              reverse: true,
              padding: const EdgeInsets.only(top: 16.0, bottom: 8.0),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final message = messages[messages.length - 1 - index];
                return MessageBubble(message: message);
              },
            ),
          ),
          
          ChatInput(
            onSend: (text) {
              ref.read(chatProvider.notifier).sendMessage(text);
            },
          ),
        ],
      ),
    );
  }
}
