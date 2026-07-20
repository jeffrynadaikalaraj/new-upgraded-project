class CompletionLog {
  final DateTime date;
  final bool completed;
  final String note;

  CompletionLog({
    required this.date,
    this.completed = true,
    this.note = '',
  });

  factory CompletionLog.fromJson(Map<String, dynamic> json) {
    return CompletionLog(
      date: DateTime.parse(json['date']),
      completed: json['completed'] as bool? ?? true,
      note: json['note'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'completed': completed,
      'note': note,
    };
  }
}

class HabitStreak {
  final int current;
  final int longest;
  final DateTime? lastCompletedAt;

  HabitStreak({
    this.current = 0,
    this.longest = 0,
    this.lastCompletedAt,
  });

  factory HabitStreak.fromJson(Map<String, dynamic> json) {
    return HabitStreak(
      current: json['current'] as int? ?? 0,
      longest: json['longest'] as int? ?? 0,
      lastCompletedAt: json['lastCompletedAt'] != null 
          ? DateTime.parse(json['lastCompletedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'current': current,
      'longest': longest,
      if (lastCompletedAt != null) 'lastCompletedAt': lastCompletedAt!.toIso8601String(),
    };
  }
}

class Habit {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String frequency;
  final List<int> customDays;
  final String category;
  final String icon;
  final String color;
  final HabitStreak streak;
  final List<CompletionLog> completionLog;
  final String? remindAt;
  final bool isArchived;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Habit({
    required this.id,
    required this.userId,
    required this.title,
    this.description = '',
    this.frequency = 'daily',
    this.customDays = const [],
    this.category = 'other',
    this.icon = '✅',
    this.color = '#6366f1',
    HabitStreak? streak,
    this.completionLog = const [],
    this.remindAt,
    this.isArchived = false,
    this.createdAt,
    this.updatedAt,
  }) : streak = streak ?? HabitStreak();

  factory Habit.fromJson(Map<String, dynamic> json) {
    return Habit(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      frequency: json['frequency'] as String? ?? 'daily',
      customDays: (json['customDays'] as List<dynamic>?)?.map((e) => e as int).toList() ?? [],
      category: json['category'] as String? ?? 'other',
      icon: json['icon'] as String? ?? '✅',
      color: json['color'] as String? ?? '#6366f1',
      streak: json['streak'] != null 
          ? HabitStreak.fromJson(json['streak']) 
          : HabitStreak(),
      completionLog: (json['completionLog'] as List<dynamic>?)
          ?.map((e) => CompletionLog.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      remindAt: json['remindAt'] as String?,
      isArchived: json['isArchived'] as bool? ?? false,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'frequency': frequency,
      'customDays': customDays,
      'category': category,
      'icon': icon,
      'color': color,
      'streak': streak.toJson(),
      'completionLog': completionLog.map((e) => e.toJson()).toList(),
      if (remindAt != null) 'remindAt': remindAt,
      'isArchived': isArchived,
    };
  }

  Habit copyWith({
    String? title,
    String? description,
    String? frequency,
    List<int>? customDays,
    String? category,
    String? icon,
    String? color,
    HabitStreak? streak,
    List<CompletionLog>? completionLog,
    String? remindAt,
    bool? isArchived,
  }) {
    return Habit(
      id: id,
      userId: userId,
      title: title ?? this.title,
      description: description ?? this.description,
      frequency: frequency ?? this.frequency,
      customDays: customDays ?? this.customDays,
      category: category ?? this.category,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      streak: streak ?? this.streak,
      completionLog: completionLog ?? this.completionLog,
      remindAt: remindAt ?? this.remindAt,
      isArchived: isArchived ?? this.isArchived,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
