import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/memory.dart';

final memoryRepositoryProvider = Provider((ref) => MemoryRepository());

class MemoryRepository {
  Future<List<Memory>> getMemories({
    String? category,
    String? type,
    String? search,
    int limit = 50,
  }) async {
    try {
      final queryParams = <String, dynamic>{'limit': limit.toString()};
      if (category != null) queryParams['category'] = category;
      if (type != null) queryParams['type'] = type;
      if (search != null) queryParams['search'] = search;

      final response = await apiClient.get('/memories', queryParameters: queryParams);
      if (response.data['success'] == true) {
        final List<dynamic> memoriesJson = response.data['data'];
        return memoriesJson.map((json) => Memory.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch memories: $e');
    }
  }

  Future<void> deleteMemory(String id) async {
    try {
      await apiClient.delete('/memories/$id');
    } catch (e) {
      throw Exception('Failed to delete memory: $e');
    }
  }

  Future<void> clearMemories() async {
    try {
      await apiClient.delete('/memories');
    } catch (e) {
      throw Exception('Failed to clear memories: $e');
    }
  }
}
