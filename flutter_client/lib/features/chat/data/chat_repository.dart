import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

final chatRepositoryProvider = Provider((ref) => ChatRepository());

class ChatRepository {
  Stream<Map<String, dynamic>> sendMessageStream(String message, {String? chatId}) async* {
    try {
      final response = await apiClient.dio.post(
        '/chat/stream',
        data: {
          'message': message,
          if (chatId != null) 'chatId': chatId,
        },
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
                yield json;
              } catch (e) {
                // Ignore malformed JSON chunks
              }
            }
          }
        }
      }
    } catch (e) {
      throw Exception('Failed to communicate with AI: $e');
    }
  }

  Future<List<dynamic>> getChatHistory() async {
    try {
      final response = await apiClient.get('/chat/history');
      return response.data['data'] ?? [];
    } catch (e) {
      throw Exception('Failed to fetch chat history: $e');
    }
  }

  Future<Map<String, dynamic>> getChat(String chatId) async {
    try {
      final response = await apiClient.get('/chat/$chatId');
      return response.data['data'] ?? {};
    } catch (e) {
      throw Exception('Failed to fetch chat: $e');
    }
  }
}
