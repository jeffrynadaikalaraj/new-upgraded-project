import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../core/api/api_client.dart';
import '../../../core/storage/secure_storage.dart';

final authProvider = StateNotifierProvider<AuthNotifier, bool>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<bool> {
  AuthNotifier() : super(false);

  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

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
      print('Login error: $e');
    }
    state = false;
    return false;
  }

  Future<bool> register(String name, String email, String password) async {
    state = true;
    try {
      final response = await apiClient.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = response.data['token'];
        if (token != null) {
          await SecureStorage.saveToken(token);
          state = false;
          return true;
        }
      }
    } catch (e) {
      print('Register error: $e');
    }
    state = false;
    return false;
  }

  Future<bool> googleSignIn() async {
    state = true;
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        state = false;
        return false;
      }

      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        state = false;
        return false;
      }

      final response = await apiClient.post('/auth/google', data: {
        'credential': idToken,
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
      print('Google Sign-In error: $e');
    }
    state = false;
    return false;
  }

  Future<void> logout() async {
    await SecureStorage.deleteToken();
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
  }
}
