import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/reports_provider.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  bool _isGenerating = false;

  void _generateReport() async {
    setState(() => _isGenerating = true);
    final success = await ref.read(reportsProvider.notifier).generateReport();
    setState(() => _isGenerating = false);
    
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Report generated successfully!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final reportsAsync = ref.watch(reportsProvider);

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
                    const Icon(LucideIcons.barChart, color: AppTheme.violet400, size: 28),
                    const SizedBox(width: 12),
                    Text('Weekly Reports',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
              ),
              
              if (_isGenerating)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: LinearProgressIndicator(color: AppTheme.violet500),
                ),

              Expanded(
                child: reportsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.violet500)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose400))),
                  data: (reports) {
                    if (reports.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.clipboardList, color: AppTheme.secondaryText, size: 48),
                            const SizedBox(height: 16),
                            const Text('No reports generated yet.', style: TextStyle(color: AppTheme.secondaryText, fontSize: 16)),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              onPressed: _generateReport,
                              icon: const Icon(LucideIcons.sparkles),
                              label: const Text('Generate First Report'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.violet500,
                                foregroundColor: Colors.white,
                              ),
                            )
                          ],
                        ),
                      ).animate().fadeIn();
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref.read(reportsProvider.notifier).refresh(),
                      color: AppTheme.violet500,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        itemCount: reports.length,
                        itemBuilder: (context, index) {
                          final report = reports[index];
                          return PremiumCard(
                            margin: const EdgeInsets.only(bottom: 24),
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Week of ${DateFormat('MMM d').format(report.weekStartDate)}',
                                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppTheme.emerald500.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Score: ${report.productivityScore}',
                                        style: const TextStyle(color: AppTheme.emerald400, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                if (report.summary.isNotEmpty) ...[
                                  Text(report.summary, style: const TextStyle(color: AppTheme.secondaryText, fontSize: 14, height: 1.5)),
                                  const SizedBox(height: 16),
                                ],
                                _buildListSection('Highlights', report.highlights, LucideIcons.star, AppTheme.sky400),
                                const SizedBox(height: 12),
                                _buildListSection('Improvements', report.improvements, LucideIcons.trendingUp, AppTheme.orange400),
                                const SizedBox(height: 12),
                                _buildListSection('Recommendations', report.recommendations, LucideIcons.lightbulb, AppTheme.violet400),
                              ],
                            ),
                          ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.1, end: 0);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _isGenerating ? null : _generateReport,
        backgroundColor: AppTheme.violet500,
        child: const Icon(LucideIcons.refreshCw, color: Colors.white),
      ),
    );
  }

  Widget _buildListSection(String title, List<String> items, IconData icon, Color color) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
          ],
        ),
        const SizedBox(height: 8),
        ...items.map((item) => Padding(
          padding: const EdgeInsets.only(bottom: 6, left: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('• ', style: TextStyle(color: AppTheme.mutedText, fontSize: 14)),
              Expanded(child: Text(item, style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4))),
            ],
          ),
        )),
      ],
    );
  }
}
