import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../../app/theme.dart';
import '../models/message.dart';

import 'package:flutter_animate/flutter_animate.dart';

class MessageBubble extends StatelessWidget {
  final ChatMessage message;

  const MessageBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == MessageRole.user;
    final isSystem = message.role == MessageRole.system;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
        padding: const EdgeInsets.all(16.0),
        decoration: isUser
            ? BoxDecoration(
                gradient: AppTheme.accentGradient,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentIndigo.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              )
            : BoxDecoration(
                color: isSystem ? AppTheme.rose500.withOpacity(0.1) : AppTheme.cardColorTranslucent,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(16),
                ),
                border: Border.all(
                  color: isSystem ? AppTheme.rose500.withOpacity(0.3) : AppTheme.borderColorSubtle,
                ),
                boxShadow: isSystem ? null : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.85,
        ),
        child: isUser
            ? Text(
                message.content,
                style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.4),
              )
            : MarkdownBody(
                data: message.content,
                selectable: true,
                styleSheet: MarkdownStyleSheet(
                  p: const TextStyle(color: AppTheme.primaryText, fontSize: 15, height: 1.5),
                  h1: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                  h2: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  h3: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  listBullet: const TextStyle(color: AppTheme.accentIndigo),
                  code: const TextStyle(
                    backgroundColor: AppTheme.scaffoldBackground,
                    color: AppTheme.accentIndigo,
                    fontFamily: 'monospace',
                  ),
                  codeblockDecoration: BoxDecoration(
                    color: AppTheme.scaffoldBackground,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.borderColor),
                  ),
                  codeblockPadding: const EdgeInsets.all(12),
                ),
              ),
      ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2, end: 0, curve: Curves.easeOutCubic),
    );
  }
}
