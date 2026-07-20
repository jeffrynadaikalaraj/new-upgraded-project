import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../models/event.dart';

final calendarRepositoryProvider = Provider((ref) => CalendarRepository());

class CalendarRepository {
  Future<List<CalendarEvent>> getEvents({String? start, String? end}) async {
    try {
      final queryParams = <String, String>{};
      if (start != null) queryParams['start'] = start;
      if (end != null) queryParams['end'] = end;

      final response = await apiClient.get('/calendar', queryParameters: queryParams);
      if (response.data['success'] == true) {
        final List<dynamic> eventsJson = response.data['data'];
        return eventsJson.map((json) => CalendarEvent.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch calendar events: $e');
    }
  }

  Future<CalendarEvent> createEvent(CalendarEvent event) async {
    try {
      final response = await apiClient.post('/calendar', data: event.toJson());
      if (response.data['success'] == true) {
        return CalendarEvent.fromJson(response.data['data']);
      }
      throw Exception('Failed to create event');
    } catch (e) {
      throw Exception('Failed to create event: $e');
    }
  }

  Future<CalendarEvent> updateEvent(String id, Map<String, dynamic> updates) async {
    try {
      final response = await apiClient.put('/calendar/$id', data: updates);
      if (response.data['success'] == true) {
        return CalendarEvent.fromJson(response.data['data']);
      }
      throw Exception('Failed to update event');
    } catch (e) {
      throw Exception('Failed to update event: $e');
    }
  }

  Future<void> deleteEvent(String id) async {
    try {
      await apiClient.delete('/calendar/$id');
    } catch (e) {
      throw Exception('Failed to delete event: $e');
    }
  }
}
