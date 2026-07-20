import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/document_repository.dart';
import '../models/document.dart';

final documentsProvider = AsyncNotifierProvider<DocumentsNotifier, List<Document>>(() {
  return DocumentsNotifier();
});

class DocumentsNotifier extends AsyncNotifier<List<Document>> {
  late final DocumentRepository _repository;

  @override
  Future<List<Document>> build() async {
    _repository = ref.read(documentRepositoryProvider);
    return _fetchDocuments();
  }

  Future<List<Document>> _fetchDocuments() async {
    return await _repository.getDocuments();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchDocuments());
  }

  Future<bool> uploadDocument(File file, {String type = 'general'}) async {
    try {
      final newDoc = await _repository.uploadDocument(file, type: type);
      if (state.hasValue) {
        state = AsyncValue.data([newDoc, ...state.value!]);
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      print('Error uploading document: $e');
      return false;
    }
  }

  Future<bool> deleteDocument(String id) async {
    try {
      await _repository.deleteDocument(id);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.where((d) => d.id != id).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error deleting document: $e');
      return false;
    }
  }

  Future<String?> askQuestion(String id, String question) async {
    try {
      return await _repository.askQuestion(id, question);
    } catch (e) {
      print('Error asking question: $e');
      return null;
    }
  }
}
