import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../app/theme.dart';

class AnimatedAvatar extends StatelessWidget {
  final double radius;
  final String imageUrl;
  final bool isOnline;

  const AnimatedAvatar({
    super.key,
    this.radius = 24.0,
    required this.imageUrl,
    this.isOnline = true,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppTheme.accentGradient,
            boxShadow: [
              BoxShadow(
                color: AppTheme.purple500.withOpacity(0.3),
                blurRadius: 12,
                spreadRadius: 2,
              )
            ],
          ),
          child: CircleAvatar(
            radius: radius,
            backgroundColor: AppTheme.cardColor,
            backgroundImage: NetworkImage(imageUrl),
          ),
        )
        .animate(onPlay: (c) => c.repeat(reverse: true))
        .scaleXY(begin: 1.0, end: 1.05, duration: 2.seconds, curve: Curves.easeInOutSine),
        
        if (isOnline)
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: radius * 0.6,
              height: radius * 0.6,
              decoration: BoxDecoration(
                color: AppTheme.emerald500,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.scaffoldBackground, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.emerald500.withOpacity(0.5),
                    blurRadius: 4,
                  )
                ],
              ),
            ),
          ),
      ],
    );
  }
}
