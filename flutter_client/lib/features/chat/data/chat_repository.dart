import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

final chatRepositoryProvider = Provider((ref) => ChatRepository());

class ChatRepository {
  Stream<String> sendMessageStream(String message) async* {
    try {
      final response = await apiClient.dio.post(
        '/chat/stream', // Matches standard AI LifeOS backend route
        data: {'message': message},
        options: Options(
          responseType: ResponseType.stream,
          headers: {'Accept': 'text/event-stream'},
        ),
      );

      final stream = response.data.stream;
      await for (final value in stream) {
        final decoded = utf8.decode(value);
        final lines = decoded.split('\n');
        
        for (var line in lines) {
          if (line.startsWith('data: ')) {
            final dataString = line.substring(6).trim();
            if (dataString == '[DONE]') return;
            if (dataString.isNotEmpty) {
              try {
                final json = jsonDecode(dataString);
                if (json.containsKey('content')) {
                  yield json['content'] as String;
                }
              } catch (e) {
                // Ignore malformed JSON chunks from chunk splitting
              }
            }
          }
        }
      }
    } catch (e) {
      throw Exception('Failed to communicate with AI: $e');
    }
  }
}
