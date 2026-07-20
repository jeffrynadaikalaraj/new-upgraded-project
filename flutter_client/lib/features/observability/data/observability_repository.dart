import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

final observabilityRepositoryProvider = Provider((ref) => ObservabilityRepository());

class ObservabilityRepository {
  Future<Map<String, dynamic>> getMetrics() async {
    try {
      final response = await apiClient.get('/observability/metrics');
      if (response.data['success'] == true) {
        return response.data['data'] as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      throw Exception('Failed to fetch metrics: $e');
    }
  }
}
