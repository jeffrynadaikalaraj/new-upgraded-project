import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:dio/dio.dart';
import '../data/auth_repository.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/user.dart';

enum AuthStatus { initial, unauthenticated, authenticated, loading, error }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? errorMessage;

  AuthState({
    required this.status,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

  AuthNotifier(this._repository) : super(AuthState(status: AuthStatus.initial)) {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    final token = await SecureStorage.getToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      state = state.copyWith(status: AuthStatus.loading);
      final data = await _repository.getMe();
      final userData = data['data'] ?? data;
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: User.fromJson(userData),
      );
    } catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: e.toString());
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final data = await _repository.login(email, password);
      final token = data['token'];
      if (token != null) {
        await SecureStorage.saveToken(token);
        final userData = data['user'] ?? data['data'];
        if (userData != null) {
           state = state.copyWith(status: AuthStatus.authenticated, user: User.fromJson(userData));
        } else {
           // Fallback if backend doesn't return user in login response
           await checkAuthStatus(); 
        }
        return true;
      }
    } catch (e) {
      String msg = 'An error occurred';
      if (e is DioException && e.response != null) {
        msg = e.response?.data['message'] ?? msg;
      }
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
    return false;
  }

  Future<bool> register(String name, String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final data = await _repository.register(name, email, password);
      final token = data['token'];
      if (token != null) {
        await SecureStorage.saveToken(token);
        final userData = data['user'] ?? data['data'];
        if (userData != null) {
           state = state.copyWith(status: AuthStatus.authenticated, user: User.fromJson(userData));
        } else {
           await checkAuthStatus();
        }
        return true;
      }
    } catch (e) {
      String msg = 'An error occurred';
      if (e is DioException && e.response != null) {
        msg = e.response?.data['message'] ?? msg;
      }
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: msg);
    }
    return false;
  }

  Future<bool> googleSignIn() async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return false;
      }

      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return false;
      }

      final data = await _repository.googleSignIn(idToken);
      final token = data['token'];
      if (token != null) {
        await SecureStorage.saveToken(token);
        await checkAuthStatus();
        return true;
      }
    } catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, errorMessage: 'Google Sign-In failed');
    }
    return false;
  }

  Future<void> logout() async {
    await SecureStorage.clearAll();
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
    state = state.copyWith(status: AuthStatus.unauthenticated, user: null);
  }
}
