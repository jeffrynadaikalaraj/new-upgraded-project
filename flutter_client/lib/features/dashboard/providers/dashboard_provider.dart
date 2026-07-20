import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/dashboard_repository.dart';

final dashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final repository = ref.read(dashboardRepositoryProvider);
  return await repository.getDashboardData();
});
