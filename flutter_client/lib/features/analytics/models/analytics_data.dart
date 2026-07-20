class AnalyticsOverview {
  final int focusScore;
  final int activeGoals;
  final int habitsCompleted;
  final int currentStreak;

  AnalyticsOverview({
    required this.focusScore,
    required this.activeGoals,
    required this.habitsCompleted,
    required this.currentStreak,
  });

  factory AnalyticsOverview.fromJson(Map<String, dynamic> json) {
    return AnalyticsOverview(
      focusScore: json['focusScore'] as int? ?? 0,
      activeGoals: json['activeGoals'] as int? ?? 0,
      habitsCompleted: json['habitsCompleted'] as int? ?? 0,
      currentStreak: json['currentStreak'] as int? ?? 0,
    );
  }
}
