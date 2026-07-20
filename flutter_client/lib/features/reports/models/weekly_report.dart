class WeeklyReport {
  final String id;
  final DateTime weekStartDate;
  final DateTime weekEndDate;
  final String summary;
  final List<String> highlights;
  final List<String> improvements;
  final List<String> recommendations;
  final num productivityScore;

  WeeklyReport({
    required this.id,
    required this.weekStartDate,
    required this.weekEndDate,
    this.summary = '',
    this.highlights = const [],
    this.improvements = const [],
    this.recommendations = const [],
    this.productivityScore = 0,
  });

  factory WeeklyReport.fromJson(Map<String, dynamic> json) {
    return WeeklyReport(
      id: json['_id'] as String,
      weekStartDate: DateTime.parse(json['weekStartDate'] as String),
      weekEndDate: DateTime.parse(json['weekEndDate'] as String),
      summary: json['summary'] as String? ?? '',
      highlights: (json['highlights'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      improvements: (json['improvements'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      recommendations: (json['recommendations'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      productivityScore: json['productivityScore'] as num? ?? 0,
    );
  }
}
