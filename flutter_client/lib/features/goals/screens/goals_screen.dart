import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../../shared/design_system/gradient_button.dart';
import '../providers/goals_provider.dart';
import '../widgets/goal_card.dart';
import '../widgets/create_goal_dialog.dart';

class GoalsScreen extends ConsumerStatefulWidget {
  const GoalsScreen({super.key});

  @override
  ConsumerState<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends ConsumerState<GoalsScreen> {
  String _filter = 'Active';

  void _showCreateDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const CreateGoalDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final goalsAsync = ref.watch(goalsProvider);

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
                            const Icon(LucideIcons.target, color: AppTheme.rose400, size: 28),
                            const SizedBox(width: 12),
                            Text('My Goals',
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text('Track your progress and get AI next steps',
                          style: TextStyle(color: AppTheme.secondaryText, fontSize: 14),
                        ),
                      ],
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.rose500.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.rose500.withOpacity(0.3)),
                      ),
                      child: IconButton(
                        icon: const Icon(LucideIcons.plus, color: AppTheme.rose400),
                        onPressed: _showCreateDialog,
                      ),
                    ).animate().scale(delay: 200.ms, curve: Curves.easeOutBack),
                  ],
                ),
              ),

              // Filters
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: PremiumCard(
                  padding: const EdgeInsets.all(4),
                  enableGlow: false,
                  child: Row(
                    children: ['Active', 'Completed', 'All'].map((tab) {
                      final isSelected = _filter == tab;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _filter = tab),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.cardColor : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? AppTheme.borderColor : Colors.transparent,
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(tab,
                              style: TextStyle(
                                color: isSelected ? Colors.white : AppTheme.secondaryText,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ).animate().fadeIn(delay: 100.ms).slideY(begin: -0.1, end: 0),
              ),
              const SizedBox(height: 16),
              
              // Content
              Expanded(
                child: goalsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.rose500)),
                  error: (err, stack) => Center(
                    child: Text('Error loading goals: $err', style: const TextStyle(color: AppTheme.rose400)),
                  ),
                  data: (goals) {
                    final filteredGoals = goals.where((g) {
                      if (_filter == 'Active') return g.status == 'active';
                      if (_filter == 'Completed') return g.status == 'completed';
                      return true;
                    }).toList();

                    if (filteredGoals.isEmpty) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 100, height: 100,
                                decoration: BoxDecoration(
                                  color: AppTheme.rose500.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Center(
                                  child: Text('🎯', style: TextStyle(fontSize: 48)),
                                ),
                              ).animate(onPlay: (c) => c.repeat(reverse: true)).scaleXY(begin: 1.0, end: 1.05, duration: 2.seconds),
                              const SizedBox(height: 24),
                              const Text('No Goals Found',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'Define what you want to achieve. AI LifeOS will help you break it down into actionable milestones.',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: AppTheme.secondaryText, height: 1.5, fontSize: 15),
                              ),
                              const SizedBox(height: 32),
                              GradientButton(
                                text: 'Create Your First Goal',
                                icon: LucideIcons.plus,
                                gradient: const LinearGradient(colors: [AppTheme.rose400, AppTheme.rose500]),
                                onPressed: _showCreateDialog,
                              ),
                            ],
                          ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref.read(goalsProvider.notifier).refresh(),
                      color: AppTheme.rose500,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        itemCount: filteredGoals.length,
                        itemBuilder: (context, index) {
                          return GoalCard(
                            goal: filteredGoals[index],
                            onTap: () {
                              // Navigate to goal details
                            },
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
    );
  }
}
