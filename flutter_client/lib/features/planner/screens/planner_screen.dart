import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/gradient_button.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/planner_provider.dart';
import '../widgets/time_block_widget.dart';
import '../models/daily_plan.dart';

class PlannerScreen extends ConsumerStatefulWidget {
  const PlannerScreen({super.key});

  @override
  ConsumerState<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends ConsumerState<PlannerScreen> {
  late DateTime _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now();
  }

  void _changeDate(int days) {
    setState(() {
      _selectedDate = _selectedDate.add(Duration(days: days));
    });
    final dateStr = _selectedDate.toIso8601String().split('T')[0];
    ref.read(plannerProvider.notifier).loadPlanForDate(dateStr);
  }

  @override
  Widget build(BuildContext context) {
    final plannerAsync = ref.watch(plannerProvider);
    final formattedDate = DateFormat('EEEE, MMMM d').format(_selectedDate);
    final isToday = _selectedDate.difference(DateTime.now()).inDays == 0 && _selectedDate.day == DateTime.now().day;

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
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            IconButton(
                              icon: const Icon(LucideIcons.chevronLeft, color: AppTheme.secondaryText, size: 20),
                              onPressed: () => _changeDate(-1),
                            ),
                            Text(isToday ? 'Today, $formattedDate' : formattedDate,
                              style: const TextStyle(color: AppTheme.secondaryText, fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            IconButton(
                              icon: const Icon(LucideIcons.chevronRight, color: AppTheme.secondaryText, size: 20),
                              onPressed: () => _changeDate(1),
                            ),
                          ],
                        ),
                      ],
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
                  ],
                ),
              ),
              
              Divider(color: AppTheme.borderColorSubtle, height: 1),

              // Content
              Expanded(
                child: plannerAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.accentIndigo)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose500))),
                  data: (plan) {
                    if (plan == null) {
                      return _buildEmptyState();
                    }
                    return _buildPlanContent(plan);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
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
                  child: GradientButton(
                    text: 'Generate AI Plan',
                    icon: LucideIcons.sparkles,
                    onPressed: () {
                      ref.read(plannerProvider.notifier).generatePlan();
                    },
                  ),
                ),
              ],
            ),
          ],
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
      ),
    );
  }

  Widget _buildPlanContent(DailyPlan plan) {
    return RefreshIndicator(
      onRefresh: () async {
        final dateStr = _selectedDate.toIso8601String().split('T')[0];
        await ref.read(plannerProvider.notifier).loadPlanForDate(dateStr);
      },
      color: AppTheme.accentIndigo,
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          if (plan.aiSummary.isNotEmpty) ...[
            PremiumCard(
              glowColor: AppTheme.violet500.withOpacity(0.15),
              padding: const EdgeInsets.all(16),
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
                        'AI Plan Summary',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    plan.aiSummary,
                    style: const TextStyle(color: AppTheme.primaryText, fontSize: 14, height: 1.5),
                  ),
                ],
              ),
            ).animate().fadeIn().slideY(begin: 0.1, end: 0),
            const SizedBox(height: 24),
          ],
          
          ...plan.blocks.asMap().entries.map((entry) {
            final idx = entry.key;
            final block = entry.value;
            return TimeBlockWidget(
              block: block,
              onToggle: () {
                ref.read(plannerProvider.notifier).toggleBlock(block.id, !block.completed);
              },
            ).animate().fadeIn(delay: (100 * idx).ms).slideX(begin: 0.1, end: 0);
          }),
        ],
      ),
    );
  }
}
