import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../../shared/design_system/gradient_button.dart';

class HabitsScreen extends StatefulWidget {
  const HabitsScreen({super.key});

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  String _filterCategory = 'all';
  final List<String> _categories = ['all', 'health', 'fitness', 'productivity', 'mindfulness', 'learning', 'other'];

  @override
  Widget build(BuildContext context) {
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
                        onPressed: () {},
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

              // Empty State
              Expanded(
                child: Center(
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
                            onPressed: () {},
                          ),
                        ]
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
