import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../app/theme.dart';
import '../models/daily_plan.dart';
import '../../shared/design_system/premium_card.dart';

class TimeBlockWidget extends StatelessWidget {
  final PlanBlock block;
  final VoidCallback onToggle;

  const TimeBlockWidget({
    super.key,
    required this.block,
    required this.onToggle,
  });

  Color _getColorForType(String type) {
    switch (type) {
      case 'habit': return AppTheme.emerald500;
      case 'goal_work': return AppTheme.rose500;
      case 'break': return AppTheme.sky400;
      case 'free': return AppTheme.orange500;
      default: return AppTheme.accentIndigo;
    }
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'habit': return LucideIcons.activity;
      case 'goal_work': return LucideIcons.target;
      case 'break': return LucideIcons.coffee;
      case 'free': return LucideIcons.sun;
      default: return LucideIcons.calendar;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getColorForType(block.type);
    final isCompleted = block.completed;

    return PremiumCard(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      glowColor: isCompleted ? color.withOpacity(0.15) : Colors.transparent,
      border: isCompleted ? Border.all(color: color.withOpacity(0.3)) : null,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 60,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  block.startTime,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  block.endTime,
                  style: const TextStyle(
                    color: AppTheme.mutedText,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 2,
            height: 40,
            color: color.withOpacity(0.5),
            margin: const EdgeInsets.symmetric(horizontal: 12),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(_getIconForType(block.type), color: color, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        block.title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: isCompleted ? AppTheme.mutedText : Colors.white,
                          fontWeight: FontWeight.bold,
                          decoration: isCompleted ? TextDecoration.lineThrough : null,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                if (block.aiNotes.isNotEmpty || block.notes.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    block.aiNotes.isNotEmpty ? block.aiNotes : block.notes,
                    style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: onToggle,
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted ? color : Colors.white.withOpacity(0.05),
                border: Border.all(
                  color: isCompleted ? color : AppTheme.borderColorSubtle,
                ),
              ),
              child: isCompleted
                  ? const Icon(LucideIcons.check, color: Colors.white, size: 20)
                  : null,
            ),
          ),
        ],
      ),
    );
  }
}
