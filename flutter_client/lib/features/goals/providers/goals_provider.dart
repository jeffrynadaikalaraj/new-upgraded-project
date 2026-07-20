import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/goal_repository.dart';
import '../models/goal.dart';

final goalsProvider = AsyncNotifierProvider<GoalsNotifier, List<Goal>>(() {
  return GoalsNotifier();
});

class GoalsNotifier extends AsyncNotifier<List<Goal>> {
  late final GoalRepository _repository;

  @override
  Future<List<Goal>> build() async {
    _repository = ref.read(goalRepositoryProvider);
    return _fetchGoals();
  }

  Future<List<Goal>> _fetchGoals() async {
    return await _repository.getGoals();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchGoals());
  }

  Future<bool> createGoal(Goal goal) async {
    try {
      final newGoal = await _repository.createGoal(goal);
      if (state.hasValue) {
        state = AsyncValue.data([...state.value!, newGoal]);
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      print('Error creating goal: $e');
      return false;
    }
  }

  Future<bool> updateGoal(String id, Map<String, dynamic> updates) async {
    try {
      final updatedGoal = await _repository.updateGoal(id, updates);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((g) => g.id == id ? updatedGoal : g).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error updating goal: $e');
      return false;
    }
  }

  Future<bool> deleteGoal(String id) async {
    try {
      await _repository.deleteGoal(id);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.where((g) => g.id != id).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error deleting goal: $e');
      return false;
    }
  }

  Future<bool> addMilestone(String goalId, String title, {num? targetValue}) async {
    try {
      final updatedGoal = await _repository.addMilestone(goalId, title, targetValue: targetValue);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((g) => g.id == goalId ? updatedGoal : g).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error adding milestone: $e');
      return false;
    }
  }

  Future<bool> toggleMilestone(String goalId, String milestoneId, bool completed) async {
    try {
      final updatedGoal = await _repository.toggleMilestone(goalId, milestoneId, completed);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((g) => g.id == goalId ? updatedGoal : g).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error toggling milestone: $e');
      return false;
    }
  }
}
