import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

final dashboardRepositoryProvider = Provider((ref) => DashboardRepository());

class DashboardRepository {
  Future<Map<String, dynamic>> getDashboardData() async {
    try {
      final response = await apiClient.get('/dashboard/');
      return response.data['data'];
    } catch (e) {
      throw Exception('Failed to fetch dashboard data: $e');
    }
  }
}
