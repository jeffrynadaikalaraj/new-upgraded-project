class CalendarEvent {
  final String id;
  final String title;
  final String description;
  final DateTime startTime;
  final DateTime endTime;
  final bool isAllDay;
  final String type;
  final String category;
  final bool isCompleted;
  final String? goalId;
  final String? habitId;
  final num focusTimeSpent;
  final String? recurrenceRule;

  CalendarEvent({
    required this.id,
    required this.title,
    this.description = '',
    required this.startTime,
    required this.endTime,
    this.isAllDay = false,
    this.type = 'task',
    this.category = 'Other',
    this.isCompleted = false,
    this.goalId,
    this.habitId,
    this.focusTimeSpent = 0,
    this.recurrenceRule,
  });

  factory CalendarEvent.fromJson(Map<String, dynamic> json) {
    return CalendarEvent(
      id: json['_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
      isAllDay: json['isAllDay'] as bool? ?? false,
      type: json['type'] as String? ?? 'task',
      category: json['category'] as String? ?? 'Other',
      isCompleted: json['isCompleted'] as bool? ?? false,
      goalId: json['goalId'] as String?,
      habitId: json['habitId'] as String?,
      focusTimeSpent: json['focusTimeSpent'] as num? ?? 0,
      recurrenceRule: json['recurrenceRule'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'isAllDay': isAllDay,
      'type': type,
      'category': category,
      'isCompleted': isCompleted,
      if (goalId != null) 'goalId': goalId,
      if (habitId != null) 'habitId': habitId,
      'focusTimeSpent': focusTimeSpent,
      if (recurrenceRule != null) 'recurrenceRule': recurrenceRule,
    };
  }
}
