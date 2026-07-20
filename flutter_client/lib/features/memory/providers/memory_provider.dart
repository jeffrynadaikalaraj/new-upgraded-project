import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/memory_repository.dart';
import '../models/memory.dart';

final memoryProvider = AsyncNotifierProvider<MemoryNotifier, List<Memory>>(() {
  return MemoryNotifier();
});

class MemoryNotifier extends AsyncNotifier<List<Memory>> {
  late final MemoryRepository _repository;

  @override
  Future<List<Memory>> build() async {
    _repository = ref.read(memoryRepositoryProvider);
    return _fetchMemories();
  }

  Future<List<Memory>> _fetchMemories({String? category, String? search}) async {
    return await _repository.getMemories(category: category, search: search);
  }

  Future<void> refresh({String? category, String? search}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchMemories(category: category, search: search));
  }

  Future<bool> deleteMemory(String id) async {
    try {
      await _repository.deleteMemory(id);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.where((m) => m.id != id).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error deleting memory: $e');
      return false;
    }
  }

  Future<bool> clearMemories() async {
    try {
      await _repository.clearMemories();
      state = const AsyncValue.data([]);
      return true;
    } catch (e) {
      print('Error clearing memories: $e');
      return false;
    }
  }
}
