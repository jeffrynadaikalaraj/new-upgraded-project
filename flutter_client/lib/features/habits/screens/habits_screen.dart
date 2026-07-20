import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../../shared/design_system/gradient_button.dart';
import '../providers/habits_provider.dart';
import '../widgets/habit_card.dart';
import '../widgets/create_habit_dialog.dart';

class HabitsScreen extends ConsumerStatefulWidget {
  const HabitsScreen({super.key});

  @override
  ConsumerState<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends ConsumerState<HabitsScreen> {
  String _filterCategory = 'all';
  final List<String> _categories = ['all', 'health', 'fitness', 'productivity', 'mindfulness', 'learning', 'other'];

  void _showCreateDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const CreateHabitDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final habitsAsync = ref.watch(habitsProvider);

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
                            const Icon(LucideIcons.activity, color: AppTheme.emerald400, size: 28),
                            const SizedBox(width: 12),
                            Text('My Habits',
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text('Build consistency one day at a time.',
                          style: TextStyle(color: AppTheme.secondaryText, fontSize: 14),
                        ),
                      ],
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.emerald500.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.emerald500.withOpacity(0.3)),
                      ),
                      child: IconButton(
                        icon: const Icon(LucideIcons.plus, color: AppTheme.emerald400),
                        onPressed: _showCreateDialog,
                      ),
                    ).animate().scale(delay: 200.ms, curve: Curves.easeOutBack),
                  ],
                ),
              ),

              // Category Filter (horizontal scroll)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  clipBehavior: Clip.none,
                  child: Row(
                    children: _categories.map((cat) {
                      final isSelected = _filterCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: GestureDetector(
                          onTap: () => setState(() => _filterCategory = cat),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? AppTheme.cardColor : AppTheme.cardColorTranslucent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? AppTheme.borderColor : AppTheme.borderColorSubtle,
                              ),
                              boxShadow: isSelected ? [
                                BoxShadow(
                                  color: AppTheme.emerald500.withOpacity(0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ] : [],
                            ),
                            child: Text(
                              cat.substring(0, 1).toUpperCase() + cat.substring(1),
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
                ).animate().fadeIn(delay: 100.ms).slideX(begin: 0.1, end: 0),
              ),

              const SizedBox(height: 16),
              // Content
              Expanded(
                child: habitsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.emerald500)),
                  error: (err, stack) => Center(
                    child: Text('Error loading habits: $err', style: const TextStyle(color: AppTheme.rose400)),
                  ),
                  data: (habits) {
                    final filteredHabits = habits.where((h) {
                      if (_filterCategory == 'all') return true;
                      return h.category == _filterCategory;
                    }).toList();

                    if (filteredHabits.isEmpty) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Stack(
                                alignment: Alignment.topRight,
                                children: [
                                  Container(
                                    width: 90, height: 90,
                                    decoration: BoxDecoration(
                                      color: AppTheme.emerald500.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Center(
                                      child: Icon(LucideIcons.activity, size: 40, color: AppTheme.emerald400),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: AppTheme.orange500.withOpacity(0.2),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Text('🔥', style: TextStyle(fontSize: 16)),
                                  ),
                                ],
                              ).animate(onPlay: (c) => c.repeat(reverse: true)).scaleXY(begin: 1.0, end: 1.05, duration: 2.seconds),
                              const SizedBox(height: 24),
                              Text(
                                _filterCategory == 'all' ? '🔥 No habits created' : 'No $_filterCategory habits',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                _filterCategory == 'all' 
                                    ? 'Small daily actions create massive results.'
                                    : 'Try another category or create your first $_filterCategory habit.',
                                textAlign: TextAlign.center,
                                style: const TextStyle(color: AppTheme.secondaryText, height: 1.5, fontSize: 15),
                              ),
                              if (_filterCategory == 'all') ...[
                                const SizedBox(height: 32),
                                GradientButton(
                                  text: 'Create Your First Habit',
                                  icon: LucideIcons.plus,
                                  gradient: const LinearGradient(colors: [AppTheme.emerald400, AppTheme.emerald500]),
                                  onPressed: _showCreateDialog,
                                ),
                              ]
                            ],
                          ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref.read(habitsProvider.notifier).refresh(),
                      color: AppTheme.emerald500,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        itemCount: filteredHabits.length,
                        itemBuilder: (context, index) {
                          final habit = filteredHabits[index];
                          return HabitCard(
                            habit: habit,
                            onTap: () {
                              // View details
                            },
                            onComplete: () {
                              final isCompleted = habit.completionLog.any((l) => 
                                l.date.day == DateTime.now().day && l.completed);
                              if (isCompleted) {
                                ref.read(habitsProvider.notifier).uncompleteHabit(habit.id, DateTime.now().toIso8601String());
                              } else {
                                ref.read(habitsProvider.notifier).completeHabit(habit.id);
                              }
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
