import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/weekly_report.dart';

final reportsRepositoryProvider = Provider((ref) => ReportsRepository());

class ReportsRepository {
  Future<List<WeeklyReport>> getAllReports() async {
    try {
      final response = await apiClient.get('/reports');
      if (response.data['success'] == true) {
        final List<dynamic> jsonList = response.data['data'];
        return jsonList.map((json) => WeeklyReport.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch reports: $e');
    }
  }

  Future<WeeklyReport?> getLatestReport() async {
    try {
      final response = await apiClient.get('/reports/latest');
      if (response.data['success'] == true && response.data['data'] != null) {
        return WeeklyReport.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to fetch latest report: $e');
    }
  }

  Future<WeeklyReport> generateReport() async {
    try {
      final response = await apiClient.post('/reports/generate');
      if (response.data['success'] == true) {
        return WeeklyReport.fromJson(response.data['data']);
      }
      throw Exception('Failed to generate report');
    } catch (e) {
      throw Exception('Failed to generate report: $e');
    }
  }
}
