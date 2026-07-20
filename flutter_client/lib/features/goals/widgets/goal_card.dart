import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../app/theme.dart';
import '../models/goal.dart';
import '../../shared/design_system/premium_card.dart';

class GoalCard extends StatelessWidget {
  final Goal goal;
  final VoidCallback onTap;

  const GoalCard({
    super.key,
    required this.goal,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      onTap: onTap,
      margin: const EdgeInsets.only(bottom: 16),
      glowColor: AppTheme.rose500.withOpacity(0.15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  goal.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.rose500.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.rose500.withOpacity(0.3)),
                ),
                child: Text(
                  goal.category.toUpperCase(),
                  style: const TextStyle(color: AppTheme.rose400, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          if (goal.description != null && goal.description!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              goal.description!,
              style: const TextStyle(color: AppTheme.secondaryText, fontSize: 14),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 24),
          
          // Progress Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Progress',
                style: TextStyle(color: AppTheme.mutedText, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.1),
              ),
              Text(
                '${goal.progress.toStringAsFixed(0)}%',
                style: const TextStyle(color: AppTheme.rose400, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: goal.progress / 100,
              backgroundColor: Colors.white.withOpacity(0.05),
              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.rose500),
              minHeight: 8,
            ),
          ),
          
          if (goal.milestones.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(color: AppTheme.borderColorSubtle),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(LucideIcons.checkCircle2, color: AppTheme.mutedText, size: 16),
                const SizedBox(width: 8),
                Text(
                  '${goal.milestones.where((m) => m.completed).length} of ${goal.milestones.length} milestones',
                  style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
