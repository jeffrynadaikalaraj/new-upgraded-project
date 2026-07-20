import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/habit_repository.dart';
import '../models/habit.dart';

final habitsProvider = AsyncNotifierProvider<HabitsNotifier, List<Habit>>(() {
  return HabitsNotifier();
});

class HabitsNotifier extends AsyncNotifier<List<Habit>> {
  late final HabitRepository _repository;

  @override
  Future<List<Habit>> build() async {
    _repository = ref.read(habitRepositoryProvider);
    return _fetchHabits();
  }

  Future<List<Habit>> _fetchHabits() async {
    return await _repository.getHabits();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchHabits());
  }

  Future<bool> createHabit(Habit habit) async {
    try {
      final newHabit = await _repository.createHabit(habit);
      if (state.hasValue) {
        state = AsyncValue.data([...state.value!, newHabit]);
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      print('Error creating habit: $e');
      return false;
    }
  }

  Future<bool> updateHabit(String id, Map<String, dynamic> updates) async {
    try {
      final updatedHabit = await _repository.updateHabit(id, updates);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((h) => h.id == id ? updatedHabit : h).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error updating habit: $e');
      return false;
    }
  }

  Future<bool> deleteHabit(String id) async {
    try {
      await _repository.deleteHabit(id);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.where((h) => h.id != id).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error deleting habit: $e');
      return false;
    }
  }

  Future<bool> completeHabit(String id, {String? note}) async {
    try {
      final updatedHabit = await _repository.completeHabit(id, note: note);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((h) => h.id == id ? updatedHabit : h).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error completing habit: $e');
      return false;
    }
  }

  Future<bool> uncompleteHabit(String id, String dateStr) async {
    try {
      final updatedHabit = await _repository.uncompleteHabit(id, dateStr);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((h) => h.id == id ? updatedHabit : h).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error uncompleting habit: $e');
      return false;
    }
  }
}
