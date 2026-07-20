import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/analytics_repository.dart';
import '../models/analytics_data.dart';

final analyticsProvider = AsyncNotifierProvider<AnalyticsNotifier, AnalyticsOverview>(() {
  return AnalyticsNotifier();
});

class AnalyticsNotifier extends AsyncNotifier<AnalyticsOverview> {
  late final AnalyticsRepository _repository;

  @override
  Future<AnalyticsOverview> build() async {
    _repository = ref.read(analyticsRepositoryProvider);
    return _fetchOverview();
  }

  Future<AnalyticsOverview> _fetchOverview() async {
    return await _repository.getOverview();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchOverview());
  }
}

final analyticsWeeklyProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repository = ref.read(analyticsRepositoryProvider);
  return await repository.getWeekly();
});
