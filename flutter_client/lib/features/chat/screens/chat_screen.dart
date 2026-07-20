import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../providers/chat_provider.dart';
import '../widgets/avatar_widget.dart';
import '../widgets/chat_input.dart';
import '../widgets/message_bubble.dart';
import '../../shared/widgets/ai_avatar/motion_face_avatar.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
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

    AIFaceState faceState = AIFaceState.idle;
    if (isAiThinking) faceState = AIFaceState.thinking;
    else if (isSpeaking) faceState = AIFaceState.speaking;

    return Scaffold(
      drawer: _buildChatHistoryDrawer(),
      body: FloatingOrbBackground(
        child: SafeArea(
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
                    Builder(
                      builder: (context) => IconButton(
                        icon: const Icon(LucideIcons.menu, color: Colors.white, size: 24),
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    MotionFaceAvatar(
                      state: faceState,
                      size: 40,
                      volume: isSpeaking ? 0.8 : 0.0,
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
                          ).animate(target: isAiThinking ? 1 : 0).fade(),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: Colors.white.withOpacity(0.05),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: IconButton(
                        icon: const Icon(LucideIcons.plus, color: Colors.white, size: 20),
                        onPressed: () => ref.read(chatProvider.notifier).newChat(),
                        tooltip: 'New Chat',
                      ),
                    ).animate().scale(delay: 200.ms, curve: Curves.easeOutBack),
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
      ),
    );
  }

  Widget _buildChatHistoryDrawer() {
    return Drawer(
      backgroundColor: AppTheme.scaffoldBackground,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  const Icon(LucideIcons.messageSquare, color: Colors.white),
                  const SizedBox(width: 12),
                  const Text(
                    'Chat History',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(LucideIcons.plus, color: Colors.white),
                    onPressed: () {
                      ref.read(chatProvider.notifier).newChat();
                      Navigator.pop(context);
                    },
                  )
                ],
              ),
            ),
            const Divider(color: AppTheme.borderColor),
            Expanded(
              child: Consumer(
                builder: (context, ref, child) {
                  final historyAsync = ref.watch(chatHistoryProvider);
                  return historyAsync.when(
                    data: (chats) {
                      if (chats.isEmpty) {
                        return const Center(
                          child: Text('No history found', style: TextStyle(color: AppTheme.mutedText)),
                        );
                      }
                      return ListView.builder(
                        itemCount: chats.length,
                        itemBuilder: (context, index) {
                          final chat = chats[index];
                          return ListTile(
                            leading: const Icon(LucideIcons.messageCircle, color: AppTheme.accentIndigo, size: 20),
                            title: Text(
                              chat['title'] ?? 'New Chat',
                              style: const TextStyle(color: Colors.white, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: Text(
                              '${chat['messageCount'] ?? 0} messages',
                              style: const TextStyle(color: AppTheme.mutedText, fontSize: 12),
                            ),
                            onTap: () {
                              final id = chat['_id'] ?? chat['id'];
                              if (id != null) {
                                ref.read(chatProvider.notifier).loadChat(id);
                              }
                              Navigator.pop(context);
                            },
                          );
                        },
                      );
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, st) => Center(
                      child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose500)),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
