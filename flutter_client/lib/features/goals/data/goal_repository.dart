import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/goal.dart';

final goalRepositoryProvider = Provider((ref) => GoalRepository());

class GoalRepository {
  Future<List<Goal>> getGoals() async {
    try {
      final response = await apiClient.get('/goals');
      if (response.data['success'] == true) {
        final List<dynamic> goalsJson = response.data['data'];
        return goalsJson.map((json) => Goal.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch goals: $e');
    }
  }

  Future<Goal> createGoal(Goal goal) async {
    try {
      final response = await apiClient.post('/goals', data: goal.toJson());
      if (response.data['success'] == true) {
        return Goal.fromJson(response.data['data']);
      }
      throw Exception('Failed to create goal');
    } catch (e) {
      throw Exception('Failed to create goal: $e');
    }
  }

  Future<Goal> updateGoal(String id, Map<String, dynamic> updates) async {
    try {
      final response = await apiClient.put('/goals/$id', data: updates);
      if (response.data['success'] == true) {
        return Goal.fromJson(response.data['data']);
      }
      throw Exception('Failed to update goal');
    } catch (e) {
      throw Exception('Failed to update goal: $e');
    }
  }

  Future<void> deleteGoal(String id) async {
    try {
      await apiClient.delete('/goals/$id');
    } catch (e) {
      throw Exception('Failed to delete goal: $e');
    }
  }

  Future<Goal> addMilestone(String goalId, String title, {num? targetValue}) async {
    try {
      final response = await apiClient.post('/goals/$goalId/milestones', data: {
        'title': title,
        if (targetValue != null) 'targetValue': targetValue,
      });
      if (response.data['success'] == true) {
        return Goal.fromJson(response.data['data']);
      }
      throw Exception('Failed to add milestone');
    } catch (e) {
      throw Exception('Failed to add milestone: $e');
    }
  }

  Future<Goal> toggleMilestone(String goalId, String milestoneId, bool completed) async {
    try {
      final response = await apiClient.put('/goals/$goalId/milestones/$milestoneId', data: {
        'completed': completed,
      });
      if (response.data['success'] == true) {
        return Goal.fromJson(response.data['data']);
      }
      throw Exception('Failed to toggle milestone');
    } catch (e) {
      throw Exception('Failed to toggle milestone: $e');
    }
  }
}
