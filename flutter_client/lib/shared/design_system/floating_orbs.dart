import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../app/theme.dart';

class FloatingOrbBackground extends StatelessWidget {
  final Widget child;

  const FloatingOrbBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background color
        Container(color: AppTheme.scaffoldBackground),
        
        // Primary Orb (Top Right)
        Positioned(
          top: -150,
          right: -150,
          child: _buildOrb(
            color: AppTheme.cyan500.withOpacity(0.15),
            size: 600,
          )
          .animate(onPlay: (controller) => controller.repeat())
          .move(
            duration: 15.seconds,
            curve: Curves.easeInOutSine,
            begin: const Offset(0, 0),
            end: const Offset(-50, 50),
          )
          .then()
          .move(
            duration: 15.seconds,
            curve: Curves.easeInOutSine,
            begin: const Offset(-50, 50),
            end: const Offset(0, 0),
          ),
        ),

        // Secondary Orb (Bottom Left)
        Positioned(
          bottom: -100,
          left: -100,
          child: _buildOrb(
            color: AppTheme.purple500.withOpacity(0.12),
            size: 500,
          )
          .animate(onPlay: (controller) => controller.repeat())
          .move(
            duration: 18.seconds,
            curve: Curves.easeInOutSine,
            begin: const Offset(0, 0),
            end: const Offset(60, -40),
          )
          .then()
          .move(
            duration: 18.seconds,
            curve: Curves.easeInOutSine,
            begin: const Offset(60, -40),
            end: const Offset(0, 0),
          ),
        ),

        // Tertiary Orb (Center/Left)
        Positioned(
          top: 300,
          left: 50,
          child: _buildOrb(
            color: AppTheme.indigo500.withOpacity(0.1),
            size: 400,
          )
          .animate(onPlay: (controller) => controller.repeat())
          .scaleXY(
            duration: 10.seconds,
            curve: Curves.easeInOutSine,
            begin: 1.0,
            end: 1.2,
          )
          .then()
          .scaleXY(
            duration: 10.seconds,
            curve: Curves.easeInOutSine,
            begin: 1.2,
            end: 1.0,
          ),
        ),

        // Foreground Content
        Positioned.fill(child: child),
      ],
    );
  }

  Widget _buildOrb({required Color color, required double size}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color,
            color.withOpacity(0.5),
            color.withOpacity(0.0),
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
      ),
    );
  }
}
