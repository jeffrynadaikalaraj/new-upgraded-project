import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/habit.dart';

final habitRepositoryProvider = Provider((ref) => HabitRepository());

class HabitRepository {
  Future<List<Habit>> getHabits() async {
    try {
      final response = await apiClient.get('/habits');
      if (response.data['success'] == true) {
        final List<dynamic> habitsJson = response.data['data'];
        return habitsJson.map((json) => Habit.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch habits: $e');
    }
  }

  Future<Habit> createHabit(Habit habit) async {
    try {
      final response = await apiClient.post('/habits', data: habit.toJson());
      if (response.data['success'] == true) {
        return Habit.fromJson(response.data['data']);
      }
      throw Exception('Failed to create habit');
    } catch (e) {
      throw Exception('Failed to create habit: $e');
    }
  }

  Future<Habit> updateHabit(String id, Map<String, dynamic> updates) async {
    try {
      final response = await apiClient.put('/habits/$id', data: updates);
      if (response.data['success'] == true) {
        return Habit.fromJson(response.data['data']);
      }
      throw Exception('Failed to update habit');
    } catch (e) {
      throw Exception('Failed to update habit: $e');
    }
  }

  Future<void> deleteHabit(String id) async {
    try {
      await apiClient.delete('/habits/$id');
    } catch (e) {
      throw Exception('Failed to delete habit: $e');
    }
  }

  Future<Habit> completeHabit(String id, {String? note}) async {
    try {
      final response = await apiClient.post('/habits/$id/complete', data: {
        if (note != null) 'note': note,
      });
      if (response.data['success'] == true) {
        return Habit.fromJson(response.data['data']);
      }
      throw Exception('Failed to complete habit');
    } catch (e) {
      throw Exception('Failed to complete habit: $e');
    }
  }

  Future<Habit> uncompleteHabit(String id, String dateStr) async {
    try {
      final response = await apiClient.post('/habits/$id/uncomplete', data: {
        'date': dateStr,
      });
      if (response.data['success'] == true) {
        return Habit.fromJson(response.data['data']);
      }
      throw Exception('Failed to uncomplete habit');
    } catch (e) {
      throw Exception('Failed to uncomplete habit: $e');
    }
  }
}
