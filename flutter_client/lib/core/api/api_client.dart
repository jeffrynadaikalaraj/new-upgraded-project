import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  late Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      // Production Render Backend URL
      baseUrl: 'https://new-upgraded-project.onrender.com/api',
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
        if (e.response?.statusCode == 401 && e.requestOptions.path != '/auth/refresh') {
          // Token expired, attempt refresh
          final refreshToken = await SecureStorage.getRefreshToken();
          if (refreshToken != null) {
            try {
              // Create a temporary Dio instance to avoid interceptor loops
              final tokenDio = Dio(BaseOptions(baseUrl: e.requestOptions.baseUrl));
              final response = await tokenDio.post('/auth/refresh', data: {
                'refreshToken': refreshToken
              });

              final newToken = response.data['token'];
              if (newToken != null) {
                await SecureStorage.saveToken(newToken);
                
                // Retry the original request
                final options = e.requestOptions;
                options.headers['Authorization'] = 'Bearer $newToken';
                final retryResponse = await _dio.fetch(options);
                return handler.resolve(retryResponse);
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens
              await SecureStorage.clearAll();
            }
          }
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

  // Convenient PATCH method
  Future<Response> patch(String path, {dynamic data}) async {
    return await _dio.patch(path, data: data);
  }
}

// Global instance for now, can be replaced by a Riverpod provider
final apiClient = ApiClient();
