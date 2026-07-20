import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/reports_repository.dart';
import '../models/weekly_report.dart';

final reportsProvider = AsyncNotifierProvider<ReportsNotifier, List<WeeklyReport>>(() {
  return ReportsNotifier();
});

class ReportsNotifier extends AsyncNotifier<List<WeeklyReport>> {
  late final ReportsRepository _repository;

  @override
  Future<List<WeeklyReport>> build() async {
    _repository = ref.read(reportsRepositoryProvider);
    return _fetchReports();
  }

  Future<List<WeeklyReport>> _fetchReports() async {
    return await _repository.getAllReports();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchReports());
  }

  Future<bool> generateReport() async {
    try {
      final newReport = await _repository.generateReport();
      if (state.hasValue) {
        state = AsyncValue.data([newReport, ...state.value!]);
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      print('Error generating report: $e');
      return false;
    }
  }
}
