import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/secure_storage.dart';

final authProvider = StateNotifierProvider<AuthNotifier, bool>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<bool> {
  AuthNotifier() : super(false);

  Future<bool> login(String email, String password) async {
    state = true; // isLoading = true
    try {
      final response = await apiClient.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final token = response.data['token'];
        if (token != null) {
          await SecureStorage.saveToken(token);
          state = false;
          return true;
        }
      }
    } catch (e) {
      // Handle error (e.g. show snackbar)
      print('Login error: $e');
    }
    state = false;
    return false;
  }

  Future<void> logout() async {
    await SecureStorage.deleteToken();
  }
}
