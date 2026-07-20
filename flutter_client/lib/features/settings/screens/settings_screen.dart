import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../../auth/providers/biometric_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final biometricEnabled = ref.watch(biometricProvider);

    return Scaffold(
      body: FloatingOrbBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 8),
                    const Icon(LucideIcons.settings, color: AppTheme.sky400, size: 28),
                    const SizedBox(width: 12),
                    Text('Settings',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
              ),
              
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  children: [
                    PremiumCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          ListTile(
                            leading: const Icon(LucideIcons.user, color: AppTheme.sky400),
                            title: const Text('Account', style: TextStyle(color: Colors.white)),
                            subtitle: const Text('Manage your profile', style: TextStyle(color: AppTheme.mutedText)),
                            trailing: const Icon(LucideIcons.chevronRight, color: AppTheme.mutedText),
                            onTap: () {},
                          ),
                          const Divider(color: AppTheme.borderColorSubtle),
                          ListTile(
                            leading: const Icon(LucideIcons.bell, color: AppTheme.violet400),
                            title: const Text('Notifications', style: TextStyle(color: Colors.white)),
                            trailing: Switch(
                              value: true,
                              activeColor: AppTheme.violet500,
                              onChanged: (val) {},
                            ),
                          ),
                          const Divider(color: AppTheme.borderColorSubtle),
                          ListTile(
                            leading: const Icon(LucideIcons.fingerprint, color: AppTheme.emerald400),
                            title: const Text('Biometric Lock', style: TextStyle(color: Colors.white)),
                            trailing: Switch(
                              value: biometricEnabled,
                              activeColor: AppTheme.emerald500,
                              onChanged: (val) {
                                ref.read(biometricProvider.notifier).setEnabled(val);
                              },
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn().slideY(begin: 0.1, end: 0),
                    
                    const SizedBox(height: 24),
                    
                    PremiumCard(
                      padding: const EdgeInsets.all(16),
                      child: ListTile(
                        leading: const Icon(LucideIcons.logOut, color: AppTheme.rose400),
                        title: const Text('Sign Out', style: TextStyle(color: AppTheme.rose400, fontWeight: FontWeight.bold)),
                        onTap: () {
                          ref.read(authProvider.notifier).logout();
                        },
                      ),
                    ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1, end: 0),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
