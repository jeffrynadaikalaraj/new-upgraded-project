import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  late Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      // Default to localhost for Android emulator. Update this based on environment.
      baseUrl: 'http://10.0.2.2:5001/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Attach JWT token to every request
        final token = await SecureStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          // TODO: Implement refresh token logic here
          // 1. Get refresh token
          // 2. Call /api/auth/refresh
          // 3. Save new token
          // 4. Retry original request
        }
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;

  // Convenient GET method
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await _dio.get(path, queryParameters: queryParameters);
  }

  // Convenient POST method
  Future<Response> post(String path, {dynamic data}) async {
    return await _dio.post(path, data: data);
  }

  // Convenient PUT method
  Future<Response> put(String path, {dynamic data}) async {
    return await _dio.put(path, data: data);
  }

  // Convenient DELETE method
  Future<Response> delete(String path) async {
    return await _dio.delete(path);
  }
}

// Global instance for now, can be replaced by a Riverpod provider
final apiClient = ApiClient();
