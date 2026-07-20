import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/analytics_data.dart';

final analyticsRepositoryProvider = Provider((ref) => AnalyticsRepository());

class AnalyticsRepository {
  Future<AnalyticsOverview> getOverview() async {
    try {
      final response = await apiClient.get('/analytics/overview');
      if (response.data['success'] == true) {
        return AnalyticsOverview.fromJson(response.data['data']);
      }
      return AnalyticsOverview(focusScore: 0, activeGoals: 0, habitsCompleted: 0, currentStreak: 0);
    } catch (e) {
      throw Exception('Failed to fetch analytics overview: $e');
    }
  }

  Future<Map<String, dynamic>> getWeekly() async {
    try {
      final response = await apiClient.get('/analytics/weekly');
      if (response.data['success'] == true) {
        return response.data['data'] as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      throw Exception('Failed to fetch weekly analytics: $e');
    }
  }
}
