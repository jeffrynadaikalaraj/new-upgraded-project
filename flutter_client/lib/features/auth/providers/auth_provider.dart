import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../data/auth_repository.dart';
import '../../../core/storage/secure_storage.dart';

final authProvider = StateNotifierProvider<AuthNotifier, bool>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<bool> {
  final AuthRepository _repository;
  
  AuthNotifier(this._repository) : super(false);

  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

  Future<bool> login(String email, String password) async {
    state = true;
    try {
      final data = await _repository.login(email, password);
      final token = data['token'];
      if (token != null) {
        await SecureStorage.saveToken(token);
        state = false;
        return true;
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
      final data = await _repository.register(name, email, password);
      final token = data['token'];
      if (token != null) {
        await SecureStorage.saveToken(token);
        state = false;
        return true;
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

      final data = await _repository.googleSignIn(idToken);
      final token = data['token'];
      if (token != null) {
        await SecureStorage.saveToken(token);
        state = false;
        return true;
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
