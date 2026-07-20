import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/observability_repository.dart';

final observabilityProvider = AsyncNotifierProvider<ObservabilityNotifier, Map<String, dynamic>>(() {
  return ObservabilityNotifier();
});

class ObservabilityNotifier extends AsyncNotifier<Map<String, dynamic>> {
  late final ObservabilityRepository _repository;

  @override
  Future<Map<String, dynamic>> build() async {
    _repository = ref.read(observabilityRepositoryProvider);
    return _fetchMetrics();
  }

  Future<Map<String, dynamic>> _fetchMetrics() async {
    return await _repository.getMetrics();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchMetrics());
  }
}
