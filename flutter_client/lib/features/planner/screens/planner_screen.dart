import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/gradient_button.dart';
import '../../shared/design_system/premium_card.dart';

class PlannerScreen extends StatelessWidget {
  const PlannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final formattedDate = DateFormat('EEEE, MMMM d, y').format(today);

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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.calendarDays, color: AppTheme.accentIndigo, size: 28),
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
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
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
                            child: Icon(LucideIcons.sparkles, size: 44, color: AppTheme.accentIndigo),
                          ),
                        ).animate(onPlay: (c) => c.repeat(reverse: true)).scaleXY(begin: 1.0, end: 1.05, duration: 2.seconds),
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
                              child: PremiumCard(
                                padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 2),
                                glowColor: AppTheme.borderColorSubtle,
                                enableGlow: false,
                                child: OutlinedButton.icon(
                                  onPressed: () {},
                                  icon: const Icon(LucideIcons.settings, size: 18, color: Colors.white),
                                  label: const Text('Customize', style: TextStyle(color: Colors.white)),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    side: BorderSide.none,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: GradientButton(
                                text: 'Generate Plan',
                                icon: LucideIcons.sparkles,
                                onPressed: () {},
                              ),
                            ),
                          ],
                        ),
                      ],
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
