import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../../shared/design_system/ai_insight_card.dart';
import '../../shared/widgets/ai_avatar/motion_face_avatar.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FloatingOrbBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(context),
                const SizedBox(height: 32),
                
                const AIInsightCard(
                  insight: "You've been consistent with your workout habit this week. Great job! Consider starting your reading habit tomorrow.",
                ),
                const SizedBox(height: 24),
                
                _buildStatsGrid(),
                const SizedBox(height: 24),
                
                _buildAISuggestions(),
                const SizedBox(height: 24),
                
                _buildDailyReview(),
                const SizedBox(height: 24),
                
                _buildWeeklyChart(),
                const SizedBox(height: 24),
                
                _buildRecentActivity(),
                const SizedBox(height: 100), // Padding for bottom nav
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
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
                    'Jeff',
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

  Widget _buildStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.3,
      children: [
        _buildStatCard('Active Goals', '4', LucideIcons.target, AppTheme.blue500, delay: 100),
        _buildStatCard('Habits Tracked', '12', LucideIcons.activity, AppTheme.emerald500, delay: 150),
        _buildStatCard('Current Streak', '7d', LucideIcons.flame, AppTheme.orange500, delay: 200),
        _buildStatCard('Focus Score', '94%', LucideIcons.brainCircuit, AppTheme.purple500, delay: 250),
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

  Widget _buildAISuggestions() {
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
          _buildSuggestionItem("Break down your 'Launch App' goal into smaller tasks for this week."),
          const SizedBox(height: 12),
          _buildSuggestionItem("You typically complete more habits in the morning. Try moving your workout earlier."),
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

  Widget _buildDailyReview() {
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
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.04)),
                  ),
                  child: const Column(
                    children: [
                      Text('HABITS', style: TextStyle(color: AppTheme.mutedText, fontSize: 10, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('4/5', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.04)),
                  ),
                  child: const Column(
                    children: [
                      Text('TASKS', style: TextStyle(color: AppTheme.mutedText, fontSize: 10, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('6/8', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.only(left: 12),
            decoration: const BoxDecoration(
              border: Border(left: BorderSide(color: AppTheme.sky400, width: 2)),
            ),
            child: const Text(
              '"Solid progress today. You hit most of your habits, but task completion slowed down in the afternoon. Try scheduling intensive tasks earlier."',
              style: TextStyle(color: AppTheme.secondaryText, fontSize: 13, fontStyle: FontStyle.italic, height: 1.5),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 350.ms).slideY(begin: 0.1, end: 0);
  }

  Widget _buildWeeklyChart() {
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
                        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            days[value.toInt()],
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
                barGroups: [
                  _makeGroupData(0, 40, AppTheme.blue500),
                  _makeGroupData(1, 65, AppTheme.blue500),
                  _makeGroupData(2, 50, AppTheme.blue500),
                  _makeGroupData(3, 85, AppTheme.emerald500),
                  _makeGroupData(4, 70, AppTheme.blue500),
                  _makeGroupData(5, 45, AppTheme.blue500),
                  _makeGroupData(6, 90, AppTheme.emerald500),
                ],
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

  Widget _buildRecentActivity() {
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
          _buildActivityItem('Completed Workout', '10:30 AM'),
          const Padding(
            padding: EdgeInsets.only(left: 4),
            child: SizedBox(height: 16, child: VerticalDivider(color: AppTheme.borderColorSubtle, thickness: 1)),
          ),
          _buildActivityItem('Read 20 pages', 'Yesterday'),
          const Padding(
            padding: EdgeInsets.only(left: 4),
            child: SizedBox(height: 16, child: VerticalDivider(color: AppTheme.borderColorSubtle, thickness: 1)),
          ),
          _buildActivityItem('Created "Learn Flutter" Goal', 'Yesterday'),
        ],
      ),
    ).animate().fadeIn(delay: 450.ms).slideY(begin: 0.1, end: 0);
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
