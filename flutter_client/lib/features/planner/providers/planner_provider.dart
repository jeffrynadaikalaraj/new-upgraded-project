import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/planner_repository.dart';
import '../models/daily_plan.dart';

final plannerProvider = AsyncNotifierProvider<PlannerNotifier, DailyPlan?>(() {
  return PlannerNotifier();
});

class PlannerNotifier extends AsyncNotifier<DailyPlan?> {
  late final PlannerRepository _repository;
  String _currentDate = DateTime.now().toIso8601String().split('T')[0];

  @override
  Future<DailyPlan?> build() async {
    _repository = ref.read(plannerRepositoryProvider);
    return _fetchPlan(_currentDate);
  }

  Future<DailyPlan?> _fetchPlan(String dateStr) async {
    return await _repository.getPlanByDate(dateStr);
  }

  Future<void> loadPlanForDate(String dateStr) async {
    _currentDate = dateStr;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchPlan(dateStr));
  }

  Future<void> generatePlan() async {
    state = const AsyncValue.loading();
    try {
      final newPlan = await _repository.generatePlan();
      _currentDate = newPlan.date;
      state = AsyncValue.data(newPlan);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> toggleBlock(String blockId, bool completed) async {
    if (state.value == null) return false;
    try {
      final updatedPlan = await _repository.updateBlock(
        _currentDate,
        blockId,
        {'completed': completed},
      );
      state = AsyncValue.data(updatedPlan);
      return true;
    } catch (e) {
      print('Error toggling block: $e');
      return false;
    }
  }
}
