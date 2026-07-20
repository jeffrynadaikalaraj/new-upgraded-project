import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/document.dart';
import 'dart:io';
import 'package:path/path.dart' as path;

final documentRepositoryProvider = Provider((ref) => DocumentRepository());

class DocumentRepository {
  Future<List<Document>> getDocuments() async {
    try {
      final response = await apiClient.get('/documents');
      if (response.data['success'] == true) {
        final List<dynamic> jsonList = response.data['data'];
        return jsonList.map((json) => Document.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch documents: $e');
    }
  }

  Future<Document> uploadDocument(File file, {String type = 'general'}) async {
    try {
      final fileName = path.basename(file.path);
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: fileName),
        'documentType': type,
      });

      final response = await apiClient.post('/documents/upload', data: formData);
      if (response.data['success'] == true) {
        return Document.fromJson(response.data['data']);
      }
      throw Exception('Failed to upload document');
    } catch (e) {
      throw Exception('Failed to upload document: $e');
    }
  }

  Future<void> deleteDocument(String id) async {
    try {
      await apiClient.delete('/documents/$id');
    } catch (e) {
      throw Exception('Failed to delete document: $e');
    }
  }

  Future<String> askQuestion(String id, String question) async {
    try {
      final response = await apiClient.post('/documents/$id/ask', data: {
        'question': question,
      });
      if (response.data['success'] == true) {
        return response.data['data']['answer'] as String;
      }
      throw Exception('Failed to get answer');
    } catch (e) {
      throw Exception('Failed to ask question: $e');
    }
  }
}
