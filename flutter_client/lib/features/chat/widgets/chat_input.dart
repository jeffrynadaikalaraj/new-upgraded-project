import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/glass_card.dart';

class ChatInput extends StatefulWidget {
  final Function(String) onSend;

  const ChatInput({super.key, required this.onSend});

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final _controller = TextEditingController();

  void _handleSend() {
    final text = _controller.text;
    if (text.trim().isNotEmpty) {
      widget.onSend(text);
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      decoration: BoxDecoration(
        color: AppTheme.scaffoldBackground.withOpacity(0.8),
        border: const Border(top: BorderSide(color: AppTheme.borderColorSubtle)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Attachment button
            IconButton(
              icon: const Icon(LucideIcons.paperclip, color: AppTheme.mutedText, size: 20),
              onPressed: () {
                // TODO: Handle file upload
              },
            ),
            const SizedBox(width: 4),
            Expanded(
              child: GlassCard(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                borderRadius: BorderRadius.circular(24.0),
                border: Border.all(color: AppTheme.borderColor),
                child: TextField(
                  controller: _controller,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Message AI LifeOS...',
                    hintStyle: TextStyle(color: AppTheme.mutedText),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    filled: false,
                    contentPadding: EdgeInsets.symmetric(vertical: 14),
                  ),
                  onSubmitted: (_) => _handleSend(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Mic / Voice button
            IconButton(
              icon: const Icon(LucideIcons.mic, color: AppTheme.mutedText, size: 20),
              onPressed: () {
                // TODO: Handle voice input
              },
            ),
            const SizedBox(width: 4),
            GestureDetector(
              onTap: _handleSend,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: AppTheme.buttonGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.indigo500.withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(LucideIcons.arrowUp, color: Colors.white, size: 20),
              ).animate(onPlay: (c) => c.repeat(reverse: true)).scaleXY(begin: 1.0, end: 1.05, duration: 2.seconds, curve: Curves.easeInOut),
            ),
          ],
        ),
      ),
    );
  }
}
