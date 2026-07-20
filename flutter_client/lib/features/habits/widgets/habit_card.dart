import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../app/theme.dart';
import '../models/habit.dart';
import '../../shared/design_system/premium_card.dart';

class HabitCard extends StatelessWidget {
  final Habit habit;
  final VoidCallback onTap;
  final VoidCallback onComplete;

  const HabitCard({
    super.key,
    required this.habit,
    required this.onTap,
    required this.onComplete,
  });

  bool get _isCompletedToday {
    final today = DateTime.now();
    return habit.completionLog.any((log) {
      return log.completed && 
             log.date.year == today.year &&
             log.date.month == today.month &&
             log.date.day == today.day;
    });
  }

  @override
  Widget build(BuildContext context) {
    final completed = _isCompletedToday;

    return PremiumCard(
      onTap: onTap,
      margin: const EdgeInsets.only(bottom: 16),
      glowColor: completed ? AppTheme.emerald500.withOpacity(0.15) : Colors.transparent,
      border: completed ? Border.all(color: AppTheme.emerald500.withOpacity(0.3)) : null,
      child: Row(
        children: [
          GestureDetector(
            onTap: onComplete,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: completed ? AppTheme.emerald500 : Colors.white.withOpacity(0.05),
                border: Border.all(
                  color: completed ? AppTheme.emerald400 : AppTheme.borderColorSubtle,
                ),
              ),
              child: completed
                  ? const Icon(LucideIcons.check, color: Colors.white, size: 20)
                  : null,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  habit.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: completed ? AppTheme.mutedText : Colors.white,
                    fontWeight: FontWeight.bold,
                    decoration: completed ? TextDecoration.lineThrough : null,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (habit.description.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    habit.description,
                    style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.flame, color: AppTheme.orange500, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    '${habit.streak.current}',
                    style: const TextStyle(color: AppTheme.orange400, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  habit.frequency,
                  style: const TextStyle(color: AppTheme.mutedText, fontSize: 10),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
