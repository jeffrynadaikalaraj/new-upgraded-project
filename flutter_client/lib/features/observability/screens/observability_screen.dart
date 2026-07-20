import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/observability_provider.dart';

class ObservabilityScreen extends ConsumerWidget {
  const ObservabilityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metricsAsync = ref.watch(observabilityProvider);

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
                    const Icon(LucideIcons.activity, color: AppTheme.emerald400, size: 28),
                    const SizedBox(width: 12),
                    Text('System Health',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
              ),
              
              Expanded(
                child: metricsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.emerald500)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose400))),
                  data: (metrics) {
                    if (metrics.isEmpty) {
                      return const Center(child: Text('No metrics available', style: TextStyle(color: AppTheme.secondaryText)));
                    }
                    
                    return RefreshIndicator(
                      onRefresh: () => ref.read(observabilityProvider.notifier).refresh(),
                      color: AppTheme.emerald500,
                      child: ListView(
                        padding: const EdgeInsets.all(24),
                        children: [
                          PremiumCard(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(LucideIcons.cpu, color: AppTheme.emerald400, size: 20),
                                    SizedBox(width: 8),
                                    Text('System Overview', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _buildMetricRow('Environment', metrics['env']?.toString() ?? 'N/A'),
                                _buildMetricRow('Uptime', '${((metrics['uptime'] ?? 0) / 60).toStringAsFixed(2)} minutes'),
                                _buildMetricRow('Node Version', metrics['nodeVersion']?.toString() ?? 'N/A'),
                                _buildMetricRow('Process ID', metrics['processId']?.toString() ?? 'N/A'),
                              ],
                            ),
                          ).animate().fadeIn().slideY(begin: 0.1, end: 0),
                          const SizedBox(height: 16),
                          PremiumCard(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Row(
                                  children: [
                                    Icon(LucideIcons.hardDrive, color: AppTheme.sky400, size: 20),
                                    SizedBox(width: 8),
                                    Text('Memory Usage', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                if (metrics['memory'] != null) ...[
                                  _buildMetricRow('RSS', '${(metrics['memory']['rss'] / 1024 / 1024).toStringAsFixed(2)} MB'),
                                  _buildMetricRow('Heap Total', '${(metrics['memory']['heapTotal'] / 1024 / 1024).toStringAsFixed(2)} MB'),
                                  _buildMetricRow('Heap Used', '${(metrics['memory']['heapUsed'] / 1024 / 1024).toStringAsFixed(2)} MB'),
                                ],
                              ],
                            ),
                          ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1, end: 0),
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

  Widget _buildMetricRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.secondaryText, fontSize: 14)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
