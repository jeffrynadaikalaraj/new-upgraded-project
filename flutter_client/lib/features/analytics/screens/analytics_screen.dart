import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/analytics_provider.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overviewAsync = ref.watch(analyticsProvider);

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
                    const Icon(LucideIcons.lineChart, color: AppTheme.sky400, size: 28),
                    const SizedBox(width: 12),
                    Text('Analytics',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
              ),
              
              Divider(color: AppTheme.borderColorSubtle, height: 1),
              
              Expanded(
                child: overviewAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.sky400)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose400))),
                  data: (overview) {
                    return RefreshIndicator(
                      onRefresh: () => ref.read(analyticsProvider.notifier).refresh(),
                      color: AppTheme.sky500,
                      child: ListView(
                        padding: const EdgeInsets.all(24),
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatCard(
                                  'Focus Score',
                                  overview.focusScore.toString(),
                                  LucideIcons.target,
                                  AppTheme.emerald400,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildStatCard(
                                  'Current Streak',
                                  '${overview.currentStreak} Days',
                                  LucideIcons.flame,
                                  AppTheme.orange400,
                                ),
                              ),
                            ],
                          ).animate().fadeIn().slideX(begin: 0.1, end: 0),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatCard(
                                  'Active Goals',
                                  overview.activeGoals.toString(),
                                  LucideIcons.crosshair,
                                  AppTheme.indigo400,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildStatCard(
                                  'Habits Completed',
                                  overview.habitsCompleted.toString(),
                                  LucideIcons.checkCircle2,
                                  AppTheme.sky400,
                                ),
                              ),
                            ],
                          ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1, end: 0),
                          const SizedBox(height: 32),
                          const Text('Weekly Progress', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          PremiumCard(
                            padding: const EdgeInsets.all(24),
                            child: SizedBox(
                              height: 200,
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(LucideIcons.barChart2, color: AppTheme.mutedText, size: 48),
                                    const SizedBox(height: 16),
                                    const Text('Chart UI Placeholder', style: TextStyle(color: AppTheme.mutedText)),
                                    const SizedBox(height: 8),
                                    const Text('(Install fl_chart to render)', style: TextStyle(color: AppTheme.secondaryText, fontSize: 12)),
                                  ],
                                ),
                              ),
                            ),
                          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1, end: 0),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return PremiumCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(title, style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
