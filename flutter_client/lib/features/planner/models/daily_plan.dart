class PlanBlock {
  final String id;
  final String startTime;
  final String endTime;
  final String title;
  final String type;
  final String? sourceId;
  final bool completed;
  final String notes;
  final String aiNotes;

  PlanBlock({
    required this.id,
    required this.startTime,
    required this.endTime,
    required this.title,
    required this.type,
    this.sourceId,
    this.completed = false,
    this.notes = '',
    this.aiNotes = '',
  });

  factory PlanBlock.fromJson(Map<String, dynamic> json) {
    return PlanBlock(
      id: json['_id'] as String? ?? json['id'] as String? ?? '',
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      title: json['title'] as String,
      type: json['type'] as String,
      sourceId: json['sourceId'] as String?,
      completed: json['completed'] as bool? ?? false,
      notes: json['notes'] as String? ?? '',
      aiNotes: json['aiNotes'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'startTime': startTime,
      'endTime': endTime,
      'title': title,
      'type': type,
      if (sourceId != null) 'sourceId': sourceId,
      'completed': completed,
      'notes': notes,
      'aiNotes': aiNotes,
    };
  }
}

class DailyPlan {
  final String id;
  final String userId;
  final String date;
  final List<PlanBlock> blocks;
  final num score;
  final String aiSummary;
  final DateTime? generatedAt;

  DailyPlan({
    required this.id,
    required this.userId,
    required this.date,
    this.blocks = const [],
    this.score = 0,
    this.aiSummary = '',
    this.generatedAt,
  });

  factory DailyPlan.fromJson(Map<String, dynamic> json) {
    return DailyPlan(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      date: json['date'] as String,
      blocks: (json['blocks'] as List<dynamic>?)
          ?.map((e) => PlanBlock.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      score: json['score'] as num? ?? 0,
      aiSummary: json['aiSummary'] as String? ?? '',
      generatedAt: json['generatedAt'] != null 
          ? DateTime.parse(json['generatedAt']) 
          : null,
    );
  }
}
