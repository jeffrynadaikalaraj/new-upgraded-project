import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../app/theme.dart';

class PlannerScreen extends StatelessWidget {
  const PlannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final formattedDate = DateFormat('EEEE, MMMM d, y').format(today);

    return Scaffold(
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: 0, right: 0,
            child: Container(
              width: 350, height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.indigo500.withOpacity(0.1),
              ),
            ),
          ),
          Positioned(
            bottom: 0, left: 0,
            child: Container(
              width: 350, height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.purple500.withOpacity(0.1),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.calendar_today, color: AppTheme.indigo400, size: 28),
                              const SizedBox(width: 12),
                              Text('Daily Planner',
                                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(formattedDate,
                            style: const TextStyle(color: AppTheme.secondaryText, fontSize: 14),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                Divider(color: AppTheme.borderColorSubtle, height: 1),

                // Content (Empty State)
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 100, height: 100,
                            decoration: BoxDecoration(
                              color: AppTheme.indigo500.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Icon(Icons.auto_awesome, size: 44, color: AppTheme.indigo400),
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text('Ready to plan your day?',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'AI LifeOS will analyze your active goals, pending milestones, daily habits, and personal preferences to create an optimized schedule for you.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppTheme.secondaryText, height: 1.5, fontSize: 14),
                          ),
                          const SizedBox(height: 32),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () {},
                                  icon: const Icon(Icons.auto_awesome, size: 18, color: Colors.white),
                                  label: const Text('Customize', style: TextStyle(color: Colors.white)),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    side: const BorderSide(color: AppTheme.borderColor),
                                    backgroundColor: AppTheme.cardColorTranslucent,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: AppTheme.buttonGradient,
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppTheme.indigo500.withOpacity(0.3),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: ElevatedButton(
                                    onPressed: () {},
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      shadowColor: Colors.transparent,
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    child: const Text('Generate Plan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
