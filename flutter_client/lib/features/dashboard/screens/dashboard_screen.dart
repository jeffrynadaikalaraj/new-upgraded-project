import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../../shared/design_system/ai_insight_card.dart';
import '../../shared/widgets/ai_avatar/motion_face_avatar.dart';
import '../providers/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardProvider);

    return Scaffold(
      body: FloatingOrbBackground(
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: () async => ref.refresh(dashboardProvider),
            child: dashboardAsync.when(
              data: (data) => _buildContent(context, data),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(
                child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose500)),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, Map<String, dynamic> data) {
    final user = data['user'] ?? {};
    final stats = data['stats'] ?? {};
    final aiInsight = data['aiInsight'] ?? "You're doing great! Keep it up.";
    final aiSuggestions = (data['aiSuggestions'] as List<dynamic>?)?.cast<String>() ?? [];
    final dailyReview = data['dailyReview'] ?? "No review available today.";
    final weeklyChart = (data['weeklyChart'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];
    final recentActivity = (data['recentActivity'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context, user['name'] ?? 'User'),
          const SizedBox(height: 32),
          
          AIInsightCard(insight: aiInsight),
          const SizedBox(height: 24),
          
          _buildStatsGrid(stats),
          const SizedBox(height: 24),
          
          if (aiSuggestions.isNotEmpty) ...[
            _buildAISuggestions(aiSuggestions),
            const SizedBox(height: 24),
          ],
          
          _buildDailyReview(dailyReview),
          const SizedBox(height: 24),
          
          _buildWeeklyChart(weeklyChart),
          const SizedBox(height: 24),
          
          _buildRecentActivity(recentActivity),
          const SizedBox(height: 100), // Padding for bottom nav
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good Evening,',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppTheme.secondaryText,
                  ),
            ).animate().fadeIn(duration: 500.ms).slideY(begin: -0.2, end: 0),
            const SizedBox(height: 4),
            Row(
              children: [
                ShaderMask(
                  shaderCallback: (bounds) => AppTheme.accentGradient.createShader(bounds),
                  child: Text(
                    name,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                  ),
                ),
                const SizedBox(width: 8),
                const Text('👋', style: TextStyle(fontSize: 24))
                    .animate(onPlay: (c) => c.repeat(reverse: true))
                    .rotate(begin: -0.1, end: 0.1, duration: 1.seconds, curve: Curves.easeInOut),
              ],
            ).animate().fadeIn(delay: 100.ms, duration: 500.ms).slideY(begin: -0.2, end: 0),
          ],
        ),
        const MotionFaceAvatar(
          state: AIFaceState.idle,
          size: 48,
        ).animate().fadeIn(delay: 200.ms).scale(curve: Curves.easeOutBack),
      ],
    );
  }

  Widget _buildStatsGrid(Map<String, dynamic> stats) {
    final activeGoals = stats['activeGoals'] ?? 0;
    final habitsToday = stats['habitsToday'] ?? 0;
    final currentStreak = stats['currentStreak'] ?? 0;
    final plannerScore = stats['plannerScore'] ?? 0;

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.3,
      children: [
        _buildStatCard('Active Goals', '$activeGoals', LucideIcons.target, AppTheme.blue500, delay: 100),
        _buildStatCard('Habits Tracked', '$habitsToday', LucideIcons.activity, AppTheme.emerald500, delay: 150),
        _buildStatCard('Current Streak', '${currentStreak}d', LucideIcons.flame, AppTheme.orange500, delay: 200),
        _buildStatCard('Focus Score', '$plannerScore%', LucideIcons.brainCircuit, AppTheme.purple500, delay: 250),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, {required int delay}) {
    return PremiumCard(
      padding: const EdgeInsets.all(16),
      glowColor: color.withOpacity(0.15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  color: AppTheme.secondaryText,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: color.withOpacity(0.2)),
                ),
                child: Icon(icon, color: color, size: 16),
              ),
            ],
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: delay.ms, duration: 400.ms).slideY(begin: 0.1, end: 0, curve: Curves.easeOut);
  }

  Widget _buildAISuggestions(List<String> suggestions) {
    return PremiumCard(
      glowColor: AppTheme.violet500.withOpacity(0.15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.violet500.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.violet500.withOpacity(0.2)),
                ),
                child: const Icon(LucideIcons.brainCircuit, color: AppTheme.violet400, size: 16),
              ),
              const SizedBox(width: 12),
              const Text(
                'AI Suggestions',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...suggestions.map((s) => Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: _buildSuggestionItem(s),
          )),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildSuggestionItem(String text) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.04)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2.0),
            child: Icon(LucideIcons.sparkles, color: AppTheme.violet400, size: 14),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: AppTheme.primaryText, fontSize: 13, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDailyReview(String review) {
    return PremiumCard(
      glowColor: AppTheme.sky400.withOpacity(0.15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.sky400.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.sky400.withOpacity(0.2)),
                ),
                child: const Icon(LucideIcons.notebookPen, color: AppTheme.sky400, size: 16),
              ),
              const SizedBox(width: 12),
              const Text(
                'Daily Review',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.only(left: 12),
            decoration: const BoxDecoration(
              border: Border(left: BorderSide(color: AppTheme.sky400, width: 2)),
            ),
            child: Text(
              '"$review"',
              style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13, fontStyle: FontStyle.italic, height: 1.5),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildWeeklyChart(List<Map<String, dynamic>> weeklyChart) {
    if (weeklyChart.isEmpty) return const SizedBox.shrink();

    // Map backend data to BarChartGroups
    List<BarChartGroupData> barGroups = [];
    for (int i = 0; i < weeklyChart.length; i++) {
      final item = weeklyChart[i];
      final score = (item['score'] as num?)?.toDouble() ?? 0.0;
      final color = score >= 80 ? AppTheme.emerald500 : AppTheme.blue500;
      barGroups.push(_makeGroupData(i, score, color));
    }

    return PremiumCard(
      height: 300,
      glowColor: AppTheme.emerald500.withOpacity(0.1),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.emerald500.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.emerald500.withOpacity(0.2)),
                ),
                child: const Icon(LucideIcons.trendingUp, color: AppTheme.emerald400, size: 16),
              ),
              const SizedBox(width: 12),
              const Text(
                'Weekly Productivity',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 100,
                barTouchData: BarTouchData(enabled: true),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index < 0 || index >= weeklyChart.length) return const SizedBox();
                        final dayStr = weeklyChart[index]['day'] ?? '';
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            dayStr,
                            style: const TextStyle(
                              color: AppTheme.mutedText, 
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                gridData: const FlGridData(show: false),
                barGroups: barGroups,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1, end: 0);
  }

  BarChartGroupData _makeGroupData(int x, double y, Color color) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: color.withOpacity(0.8),
          width: 16,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          backDrawRodData: BackgroundBarChartRodData(
            show: true,
            toY: 100,
            color: Colors.white.withOpacity(0.02),
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivity(List<Map<String, dynamic>> activity) {
    if (activity.isEmpty) return const SizedBox.shrink();
    
    return PremiumCard(
      glowColor: AppTheme.purple500.withOpacity(0.15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.emerald500.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.emerald500.withOpacity(0.2)),
                ),
                child: const Icon(LucideIcons.checkCircle2, color: AppTheme.emerald400, size: 16),
              ),
              const SizedBox(width: 12),
              const Text(
                'Recent Activity',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...activity.expand((act) {
            // Need to parse 'timestamp' maybe
            final timeStr = act['timestamp'] != null ? _formatTime(act['timestamp']) : 'Just now';
            return [
              _buildActivityItem(act['text'] ?? 'Activity', timeStr),
              if (act != activity.last)
                const Padding(
                  padding: EdgeInsets.only(left: 4),
                  child: SizedBox(height: 16, child: VerticalDivider(color: AppTheme.borderColorSubtle, thickness: 1)),
                ),
            ];
          }),
        ],
      ),
    ).animate().fadeIn(delay: 450.ms).slideY(begin: 0.1, end: 0);
  }

  String _formatTime(dynamic timestamp) {
    // Basic formatting for time
    try {
      final dt = DateTime.parse(timestamp.toString());
      final now = DateTime.now();
      final diff = now.difference(dt);
      
      if (diff.inDays == 0) {
        return '${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
      } else if (diff.inDays == 1) {
        return 'Yesterday';
      } else {
        return '${diff.inDays}d ago';
      }
    } catch (e) {
      return 'Recently';
    }
  }

  Widget _buildActivityItem(String title, String time) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 4),
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: AppTheme.emerald400,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.emerald400.withOpacity(0.5),
                blurRadius: 8,
              )
            ],
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 4),
              Text(
                time,
                style: const TextStyle(color: AppTheme.mutedText, fontSize: 12),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
