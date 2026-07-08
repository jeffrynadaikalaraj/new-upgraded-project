import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../models/message.dart';

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
        margin: const EdgeInsets.symmetric(vertical: 6.0, horizontal: 16.0),
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF818cf8) : (isSystem ? Colors.redAccent.withOpacity(0.2) : const Color(0xFF1e293b)),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
            bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
          ),
          border: isUser ? null : Border.all(color: isSystem ? Colors.red : const Color(0xFF334155)),
        ),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        child: isUser
            ? Text(
                message.content,
                style: const TextStyle(color: Colors.white, fontSize: 16),
              )
            : MarkdownBody(
                data: message.content,
                selectable: true,
                styleSheet: MarkdownStyleSheet(
                  p: const TextStyle(color: Color(0xFFf1f5f9), fontSize: 16),
                  code: const TextStyle(
                    backgroundColor: Color(0xFF0f172a),
                    color: Color(0xFF818cf8),
                    fontFamily: 'monospace',
                  ),
                  codeblockDecoration: BoxDecoration(
                    color: const Color(0xFF0f172a),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
      ),
    );
  }
}
