import 'package:flutter/material.dart';
import '../../../app/theme.dart';

class PulsingAvatar extends StatefulWidget {
  final bool isThinking;
  final bool isSpeaking;

  const PulsingAvatar({
    super.key,
    this.isThinking = false,
    this.isSpeaking = false,
  });

  @override
  State<PulsingAvatar> createState() => _PulsingAvatarState();
}

class _PulsingAvatarState extends State<PulsingAvatar> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _glowAnimation = Tween<double>(begin: 0.2, end: 0.6).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color accentColor = AppTheme.indigo500;
    if (widget.isThinking) {
      accentColor = AppTheme.pink400;
    } else if (widget.isSpeaking) {
      accentColor = AppTheme.emerald400;
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppTheme.cardColor,
            boxShadow: [
              if (widget.isThinking || widget.isSpeaking)
                BoxShadow(
                  color: accentColor.withOpacity(_glowAnimation.value),
                  blurRadius: 15 * _scaleAnimation.value,
                  spreadRadius: 4 * _scaleAnimation.value,
                ),
            ],
            border: Border.all(
              color: accentColor.withOpacity(0.5),
              width: 2,
            ),
          ),
          child: Transform.scale(
            scale: widget.isSpeaking ? _scaleAnimation.value : 1.0,
            child: Icon(
              Icons.psychology,
              size: 26,
              color: accentColor,
            ),
          ),
        );
      },
    );
  }
}
