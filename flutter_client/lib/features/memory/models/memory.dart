class Memory {
  final String id;
  final String type;
  final String content;
  final String? key;
  final String? value;
  final String category;
  final String? chatId;
  final String source;
  final String? sourceId;
  final int importance;
  final List<String> tags;
  final DateTime? expiresAt;
  final DateTime createdAt;

  Memory({
    required this.id,
    required this.type,
    required this.content,
    this.key,
    this.value,
    required this.category,
    this.chatId,
    required this.source,
    this.sourceId,
    required this.importance,
    this.tags = const [],
    this.expiresAt,
    required this.createdAt,
  });

  factory Memory.fromJson(Map<String, dynamic> json) {
    return Memory(
      id: json['_id'] as String,
      type: json['type'] as String? ?? 'general',
      content: json['content'] as String,
      key: json['key'] as String?,
      value: json['value'] as String?,
      category: json['category'] as String? ?? 'general',
      chatId: json['chatId'] as String?,
      source: json['source'] as String? ?? 'manual',
      sourceId: json['sourceId'] as String?,
      importance: json['importance'] as int? ?? 5,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt'] as String) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'content': content,
      if (key != null) 'key': key,
      if (value != null) 'value': value,
      'category': category,
      if (chatId != null) 'chatId': chatId,
      'source': source,
      if (sourceId != null) 'sourceId': sourceId,
      'importance': importance,
      'tags': tags,
      if (expiresAt != null) 'expiresAt': expiresAt!.toIso8601String(),
    };
  }
}
