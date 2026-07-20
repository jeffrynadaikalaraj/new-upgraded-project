import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/daily_plan.dart';

final plannerRepositoryProvider = Provider((ref) => PlannerRepository());

class PlannerRepository {
  Future<DailyPlan> generatePlan() async {
    try {
      final response = await apiClient.post('/planner/generate');
      if (response.data['success'] == true) {
        return DailyPlan.fromJson(response.data['data']);
      }
      throw Exception('Failed to generate plan');
    } catch (e) {
      throw Exception('Failed to generate plan: $e');
    }
  }

  Future<DailyPlan?> getTodayPlan() async {
    try {
      final response = await apiClient.get('/planner/today');
      if (response.data['success'] == true) {
        if (response.data['data'] == null) return null;
        return DailyPlan.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      if (e.toString().contains('404')) return null;
      throw Exception('Failed to get today\'s plan: $e');
    }
  }

  Future<DailyPlan?> getPlanByDate(String dateStr) async {
    try {
      final response = await apiClient.get('/planner/$dateStr');
      if (response.data['success'] == true) {
        if (response.data['data'] == null) return null;
        return DailyPlan.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      if (e.toString().contains('404')) return null;
      throw Exception('Failed to get plan for date $dateStr: $e');
    }
  }

  Future<DailyPlan> updateBlock(String dateStr, String blockId, Map<String, dynamic> updates) async {
    try {
      final response = await apiClient.put('/planner/$dateStr/blocks/$blockId', data: updates);
      if (response.data['success'] == true) {
        return DailyPlan.fromJson(response.data['data']);
      }
      throw Exception('Failed to update plan block');
    } catch (e) {
      throw Exception('Failed to update plan block: $e');
    }
  }
}
