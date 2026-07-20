import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

final authRepositoryProvider = Provider((ref) => AuthRepository());

class AuthRepository {
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await apiClient.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } catch (e) {
      throw Exception('Failed to login: $e');
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    try {
      final response = await apiClient.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
      });
      return response.data;
    } catch (e) {
      throw Exception('Failed to register: $e');
    }
  }

  Future<Map<String, dynamic>> googleSignIn(String idToken) async {
    try {
      final response = await apiClient.post('/auth/google', data: {
        'credential': idToken,
      });
      return response.data;
    } catch (e) {
      throw Exception('Failed to sign in with Google: $e');
    }
  }

  Future<Map<String, dynamic>> getMe() async {
    try {
      final response = await apiClient.get('/auth/me');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch user data: $e');
    }
  }
}
