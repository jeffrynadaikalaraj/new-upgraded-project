class Document {
  final String id;
  final String originalName;
  final String mimeType;
  final num size;
  final String summary;
  final List<String> tags;
  final String documentType;
  final DateTime createdAt;

  Document({
    required this.id,
    required this.originalName,
    required this.mimeType,
    required this.size,
    this.summary = '',
    this.tags = const [],
    this.documentType = 'general',
    required this.createdAt,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      id: json['_id'] as String,
      originalName: json['originalName'] as String,
      mimeType: json['mimeType'] as String,
      size: json['size'] as num? ?? 0,
      summary: json['summary'] as String? ?? '',
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      documentType: json['documentType'] as String? ?? 'general',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
    );
  }
}
