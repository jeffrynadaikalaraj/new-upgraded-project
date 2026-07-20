import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'premium_card.dart';
import '../../app/theme.dart';

class AIInsightCard extends StatelessWidget {
  final String title;
  final String insight;
  final Color? accentColor;

  const AIInsightCard({
    super.key,
    this.title = 'AI Insight',
    required this.insight,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    final color = accentColor ?? AppTheme.cyan400;

    return PremiumCard(
      padding: const EdgeInsets.all(16.0),
      glowColor: color.withOpacity(0.2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.2)),
            ),
            child: Icon(LucideIcons.sparkles, color: color, size: 20)
                .animate(onPlay: (c) => c.repeat())
                .shimmer(duration: 2.seconds, color: Colors.white),
          ),
          const SizedBox(width: 16),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: color,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  insight,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.primaryText,
                        height: 1.5,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideY(begin: -0.1, end: 0, duration: 500.ms, curve: Curves.easeOut);
  }
}
