import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  String? _error;
  late AnimationController _bgAnimController;

  @override
  void initState() {
    super.initState();
    _bgAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _bgAnimController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    setState(() => _error = null);
    final success = await ref.read(authProvider.notifier).login(
      _emailController.text,
      _passwordController.text,
    );
    if (success && mounted) {
      context.go('/chat');
    } else if (mounted) {
      setState(() => _error = 'Login failed. Please check your credentials.');
    }
  }

  void _handleGoogleSignIn() async {
    setState(() => _error = null);
    final success = await ref.read(authProvider.notifier).googleSignIn();
    if (success && mounted) {
      context.go('/chat');
    } else if (mounted) {
      setState(() => _error = 'Google Sign-In failed. Please try again.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState.status == AuthStatus.loading;

    return Scaffold(
      body: Stack(
        children: [
          // Animated gradient background blobs
          AnimatedBuilder(
            animation: _bgAnimController,
            builder: (context, _) {
              final dx = _bgAnimController.value * 40 - 20;
              final dy = _bgAnimController.value * 25 - 12;
              return Stack(
                children: [
                  Positioned(
                    top: -80 + dy,
                    left: -60 + dx,
                    child: Container(
                      width: 320,
                      height: 320,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.indigo500.withOpacity(0.15),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -100 - dy,
                    right: -80 - dx,
                    child: Container(
                      width: 380,
                      height: 380,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.rose500.withOpacity(0.08),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Main content
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Center(
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: AppTheme.primaryGradient,
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.indigo500.withOpacity(0.4),
                            blurRadius: 24,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text('🧠', style: TextStyle(fontSize: 28)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Title
                  Text(
                    'Sign In',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Pick up where you left off',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppTheme.secondaryText,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),

                  // Error banner
                  if (_error != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 20),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.rose500.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.rose500.withOpacity(0.3)),
                      ),
                      child: Text(
                        _error!,
                        style: TextStyle(color: AppTheme.rose400, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ),

                  // Google Sign-In Button
                  OutlinedButton.icon(
                    onPressed: isLoading ? null : _handleGoogleSignIn,
                    icon: const Text('G', style: TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold,
                      color: Colors.white,
                    )),
                    label: const Text('Sign in with Google',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      side: const BorderSide(color: AppTheme.borderColor),
                      backgroundColor: AppTheme.cardColor,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Divider
                  Row(
                    children: [
                      Expanded(child: Divider(color: AppTheme.borderColor)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'Or sign in with email',
                          style: TextStyle(color: AppTheme.mutedText, fontSize: 13),
                        ),
                      ),
                      Expanded(child: Divider(color: AppTheme.borderColor)),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Email Label + Field
                  const Text('Email',
                    style: TextStyle(color: AppTheme.secondaryText, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      hintText: 'you@example.com',
                      prefixIcon: Icon(Icons.email_outlined, size: 18, color: AppTheme.mutedText),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 16),

                  // Password Label + Field
                  const Text('Password',
                    style: TextStyle(color: AppTheme.secondaryText, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      hintText: 'Your password',
                      prefixIcon: const Icon(Icons.lock_outline, size: 18, color: AppTheme.mutedText),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible ? Icons.visibility_off : Icons.visibility,
                          size: 18,
                          color: AppTheme.mutedText,
                        ),
                        onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                      ),
                    ),
                    obscureText: !_isPasswordVisible,
                    style: const TextStyle(color: Colors.white),
                  ),
                  const SizedBox(height: 28),

                  // Sign In Button (gradient)
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: AppTheme.buttonGradient,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.indigo500.withOpacity(0.35),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              height: 22, width: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.arrow_forward, size: 20, color: Colors.white),
                                SizedBox(width: 8),
                                Text('Sign In',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Register Link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Don't have an account? ",
                        style: TextStyle(color: AppTheme.mutedText, fontSize: 14),
                      ),
                      GestureDetector(
                        onTap: () => context.push('/register'),
                        child: const Text(
                          'Create one free',
                          style: TextStyle(
                            color: AppTheme.accentIndigo,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
