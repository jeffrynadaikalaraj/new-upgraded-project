import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/calendar_repository.dart';
import '../models/event.dart';

final calendarProvider = AsyncNotifierProvider<CalendarNotifier, List<CalendarEvent>>(() {
  return CalendarNotifier();
});

class CalendarNotifier extends AsyncNotifier<List<CalendarEvent>> {
  late final CalendarRepository _repository;

  @override
  Future<List<CalendarEvent>> build() async {
    _repository = ref.read(calendarRepositoryProvider);
    return _fetchEvents();
  }

  Future<List<CalendarEvent>> _fetchEvents({String? start, String? end}) async {
    return await _repository.getEvents(start: start, end: end);
  }

  Future<void> refresh({String? start, String? end}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchEvents(start: start, end: end));
  }

  Future<bool> createEvent(CalendarEvent event) async {
    try {
      final newEvent = await _repository.createEvent(event);
      if (state.hasValue) {
        state = AsyncValue.data([...state.value!, newEvent]);
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      print('Error creating event: $e');
      return false;
    }
  }

  Future<bool> updateEvent(String id, Map<String, dynamic> updates) async {
    try {
      final updatedEvent = await _repository.updateEvent(id, updates);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.map((e) => e.id == id ? updatedEvent : e).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error updating event: $e');
      return false;
    }
  }

  Future<bool> deleteEvent(String id) async {
    try {
      await _repository.deleteEvent(id);
      if (state.hasValue) {
        state = AsyncValue.data(
          state.value!.where((e) => e.id != id).toList(),
        );
      }
      return true;
    } catch (e) {
      print('Error deleting event: $e');
      return false;
    }
  }
}
