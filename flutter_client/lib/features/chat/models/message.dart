enum MessageRole { user, ai, system }

class ChatMessage {
  final String id;
  final String content;
  final MessageRole role;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.content,
    required this.role,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
  
  ChatMessage copyWith({String? content}) {
    return ChatMessage(
      id: id,
      content: content ?? this.content,
      role: role,
      timestamp: timestamp,
    );
  }
}
