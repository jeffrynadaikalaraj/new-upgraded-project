import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final biometricProvider = StateNotifierProvider<BiometricNotifier, bool>((ref) {
  return BiometricNotifier();
});

class BiometricNotifier extends StateNotifier<bool> {
  final LocalAuthentication auth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  BiometricNotifier() : super(false) {
    _loadState();
  }

  Future<void> _loadState() async {
    final enabled = await _storage.read(key: 'biometric_enabled');
    state = enabled == 'true';
  }

  Future<bool> authenticate() async {
    try {
      final isAvailable = await auth.canCheckBiometrics || await auth.isDeviceSupported();
      if (!isAvailable) return false;

      return await auth.authenticate(
        localizedReason: 'Please authenticate to unlock AI LifeOS',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: false,
        ),
      );
    } catch (e) {
      print('Biometric error: $e');
      return false;
    }
  }

  Future<void> setEnabled(bool enabled) async {
    if (enabled) {
      final authenticated = await authenticate();
      if (authenticated) {
        await _storage.write(key: 'biometric_enabled', value: 'true');
        state = true;
      }
    } else {
      await _storage.write(key: 'biometric_enabled', value: 'false');
      state = false;
    }
  }
}
