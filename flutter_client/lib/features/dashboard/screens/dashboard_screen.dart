import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../app/theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -50, right: -50,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.violet500.withOpacity(0.08),
              ),
            ),
          ),
          Positioned(
            bottom: 100, left: -100,
            child: Container(
              width: 400, height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.blue500.withOpacity(0.06),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Greeting Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Good Evening,',
                            style: TextStyle(color: AppTheme.secondaryText, fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          Text('User 👋',
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: AppTheme.glassCard,
                        child: const Icon(Icons.notifications_outlined, color: AppTheme.secondaryText),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // AI Insight Banner
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.indigo500.withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.auto_awesome, color: Colors.white),
                        ),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('AI Insight',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              SizedBox(height: 6),
                              Text(
                                "You've been consistent with your workout habit this week. Great job! Consider starting your reading habit tomorrow.",
                                style: TextStyle(color: Colors.white, height: 1.4),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Stats Grid
                  const Text('Overview',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard('Active Goals', '4', Icons.flag, AppTheme.violet400),
                      _buildStatCard('Habits Tracked', '12', Icons.repeat, AppTheme.emerald400),
                      _buildStatCard('Current Streak', '7d', Icons.local_fire_department, AppTheme.orange400),
                      _buildStatCard('Planner Score', '85%', Icons.check_circle, AppTheme.blue400),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Weekly Productivity Chart
                  const Text('Weekly Productivity',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    height: 220,
                    padding: const EdgeInsets.all(16),
                    decoration: AppTheme.glassCard,
                    child: BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: 100,
                        barTouchData: BarTouchData(enabled: false),
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
                                    style: const TextStyle(color: AppTheme.mutedText, fontSize: 12),
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
                          _makeGroupData(0, 40),
                          _makeGroupData(1, 65),
                          _makeGroupData(2, 50),
                          _makeGroupData(3, 85),
                          _makeGroupData(4, 70),
                          _makeGroupData(5, 45),
                          _makeGroupData(6, 90),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Recent Activity
                  const Text('Recent Activity',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: AppTheme.glassCard,
                    child: Column(
                      children: [
                        _buildActivityItem('Completed Workout', 'Habit', '2h ago'),
                        Divider(color: AppTheme.borderColorSubtle, height: 1),
                        _buildActivityItem('Read 20 pages', 'Task', '5h ago'),
                        Divider(color: AppTheme.borderColorSubtle, height: 1),
                        _buildActivityItem('Created "Learn Flutter" Goal', 'Goal', 'Yesterday'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100), // padding for bottom nav
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.glassCard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  BarChartGroupData _makeGroupData(int x, double y) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: AppTheme.accentIndigo,
          width: 14,
          borderRadius: BorderRadius.circular(4),
          backDrawRodData: BackgroundBarChartRodData(
            show: true,
            toY: 100,
            color: AppTheme.scaffoldBackground,
          ),
        ),
      ],
    );
  }

  Widget _buildActivityItem(String title, String type, String time) {
    return ListTile(
      leading: Container(
        width: 10, height: 10,
        decoration: const BoxDecoration(
          color: AppTheme.emerald400,
          shape: BoxShape.circle,
        ),
      ),
      title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 15)),
      subtitle: Text(type, style: const TextStyle(color: AppTheme.mutedText)),
      trailing: Text(time, style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
    );
  }
}
