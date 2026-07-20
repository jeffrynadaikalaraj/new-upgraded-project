class Milestone {
  final String? id;
  final String title;
  final bool completed;
  final num? targetValue;
  final DateTime? completedAt;

  Milestone({
    this.id,
    required this.title,
    this.completed = false,
    this.targetValue,
    this.completedAt,
  });

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      id: json['_id'] as String?,
      title: json['title'] as String,
      completed: json['completed'] as bool? ?? false,
      targetValue: json['targetValue'] as num?,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'title': title,
      'completed': completed,
      if (targetValue != null) 'targetValue': targetValue,
      if (completedAt != null) 'completedAt': completedAt!.toIso8601String(),
    };
  }
}

class ActivityLog {
  final String? id;
  final String text;
  final DateTime? date;
  final String? type;
  final String? metric;
  final num? value;
  final String? aiFeedback;

  ActivityLog({
    this.id,
    required this.text,
    this.date,
    this.type,
    this.metric,
    this.value,
    this.aiFeedback,
  });

  factory ActivityLog.fromJson(Map<String, dynamic> json) {
    return ActivityLog(
      id: json['_id'] as String?,
      text: json['text'] as String,
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
      type: json['type'] as String?,
      metric: json['metric'] as String?,
      value: json['value'] as num?,
      aiFeedback: json['aiFeedback'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'text': text,
      if (date != null) 'date': date!.toIso8601String(),
      if (type != null) 'type': type,
      if (metric != null) 'metric': metric,
      if (value != null) 'value': value,
      if (aiFeedback != null) 'aiFeedback': aiFeedback,
    };
  }
}

class Goal {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String category;
  final String? subcategory;
  final String priority;
  final String status;
  final num progress;
  final num? targetValue;
  final num currentValue;
  final String? targetMetric;
  final DateTime? targetDate;
  final List<Milestone> milestones;
  final List<ActivityLog> activityLog;
  final bool aiGenerated;
  final List<String> aiSuggestions;
  final List<String> tags;
  final DateTime? completedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Goal({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.category = 'other',
    this.subcategory,
    this.priority = 'medium',
    this.status = 'active',
    this.progress = 0,
    this.targetValue,
    this.currentValue = 0,
    this.targetMetric,
    this.targetDate,
    this.milestones = const [],
    this.activityLog = const [],
    this.aiGenerated = false,
    this.aiSuggestions = const [],
    this.tags = const [],
    this.completedAt,
    this.createdAt,
    this.updatedAt,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    return Goal(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String? ?? 'other',
      subcategory: json['subcategory'] as String?,
      priority: json['priority'] as String? ?? 'medium',
      status: json['status'] as String? ?? 'active',
      progress: json['progress'] as num? ?? 0,
      targetValue: json['targetValue'] as num?,
      currentValue: json['currentValue'] as num? ?? 0,
      targetMetric: json['targetMetric'] as String?,
      targetDate: json['targetDate'] != null ? DateTime.parse(json['targetDate']) : null,
      milestones: (json['milestones'] as List<dynamic>?)
              ?.map((e) => Milestone.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      activityLog: (json['activityLog'] as List<dynamic>?)
              ?.map((e) => ActivityLog.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      aiGenerated: json['aiGenerated'] as bool? ?? false,
      aiSuggestions: (json['aiSuggestions'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt']) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      if (description != null) 'description': description,
      'category': category,
      if (subcategory != null) 'subcategory': subcategory,
      'priority': priority,
      'status': status,
      'progress': progress,
      if (targetValue != null) 'targetValue': targetValue,
      'currentValue': currentValue,
      if (targetMetric != null) 'targetMetric': targetMetric,
      if (targetDate != null) 'targetDate': targetDate!.toIso8601String(),
      'milestones': milestones.map((e) => e.toJson()).toList(),
      'activityLog': activityLog.map((e) => e.toJson()).toList(),
      'aiGenerated': aiGenerated,
      'aiSuggestions': aiSuggestions,
      'tags': tags,
      if (completedAt != null) 'completedAt': completedAt!.toIso8601String(),
    };
  }

  Goal copyWith({
    String? title,
    String? description,
    String? category,
    String? subcategory,
    String? priority,
    String? status,
    num? progress,
    num? targetValue,
    num? currentValue,
    String? targetMetric,
    DateTime? targetDate,
    List<Milestone>? milestones,
    List<ActivityLog>? activityLog,
    bool? aiGenerated,
    List<String>? aiSuggestions,
    List<String>? tags,
    DateTime? completedAt,
  }) {
    return Goal(
      id: id,
      userId: userId,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      subcategory: subcategory ?? this.subcategory,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      targetValue: targetValue ?? this.targetValue,
      currentValue: currentValue ?? this.currentValue,
      targetMetric: targetMetric ?? this.targetMetric,
      targetDate: targetDate ?? this.targetDate,
      milestones: milestones ?? this.milestones,
      activityLog: activityLog ?? this.activityLog,
      aiGenerated: aiGenerated ?? this.aiGenerated,
      aiSuggestions: aiSuggestions ?? this.aiSuggestions,
      tags: tags ?? this.tags,
      completedAt: completedAt ?? this.completedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
