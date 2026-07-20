import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/theme.dart';
import '../providers/chat_provider.dart';
import '../widgets/avatar_widget.dart';
import '../widgets/chat_input.dart';
import '../widgets/message_bubble.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> with SingleTickerProviderStateMixin {
  late AnimationController _bgAnimController;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _bgAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _bgAnimController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatProvider);
    final isAiThinking = ref.watch(isAiThinkingProvider);
    final isSpeaking = ref.watch(isSpeakingProvider);

    // Auto-scroll when messages length changes or streaming happens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });

    return Scaffold(
      body: Stack(
        children: [
          // Animated background blobs
          AnimatedBuilder(
            animation: _bgAnimController,
            builder: (context, _) {
              final dx = _bgAnimController.value * 60 - 30;
              final dy = _bgAnimController.value * 40 - 20;
              return Stack(
                children: [
                  Positioned(
                    top: -100 + dy,
                    left: -50 + dx,
                    child: Container(
                      width: 400,
                      height: 400,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.indigo500.withOpacity(0.08),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 100 - dy,
                    right: -100 - dx,
                    child: Container(
                      width: 500,
                      height: 500,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.purple500.withOpacity(0.06),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Main Chat Layout
          SafeArea(
            child: Column(
              children: [
                // Glassmorphism Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppTheme.cardColorTranslucent,
                    border: const Border(bottom: BorderSide(color: AppTheme.borderColorSubtle)),
                  ),
                  child: Row(
                    children: [
                      PulsingAvatar(
                        isThinking: isAiThinking,
                        isSpeaking: isSpeaking,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('AI LifeOS',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Text(
                              isAiThinking ? 'Thinking...' : 'Ready to assist',
                              style: TextStyle(
                                fontSize: 13,
                                color: isAiThinking ? AppTheme.accentIndigo : AppTheme.emerald400,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: AppTheme.scaffoldBackground.withOpacity(0.5),
                          border: Border.all(color: AppTheme.borderColor),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.add, color: AppTheme.secondaryText, size: 20),
                          onPressed: () => ref.read(chatProvider.notifier).newChat(),
                          tooltip: 'New Chat',
                        ),
                      ),
                    ],
                  ),
                ),

                // Chat Messages
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      return MessageBubble(message: messages[index]);
                    },
                  ),
                ),

                // Disclaimer
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 4),
                  child: Text(
                    'AI LifeOS may generate inaccurate information.',
                    style: TextStyle(color: AppTheme.mutedText, fontSize: 11),
                  ),
                ),

                // Chat Input
                ChatInput(
                  onSend: (text) => ref.read(chatProvider.notifier).sendMessage(text),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

