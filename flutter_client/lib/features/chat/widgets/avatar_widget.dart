import 'package:flutter/material.dart';

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
    // Determine color based on state
    Color accentColor = const Color(0xFF818cf8); // default indigo
    if (widget.isThinking) {
      accentColor = const Color(0xFFf472b6); // pink when thinking
    } else if (widget.isSpeaking) {
      accentColor = const Color(0xFF34d399); // green when speaking
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: const Color(0xFF1e293b),
            boxShadow: [
              if (widget.isThinking || widget.isSpeaking)
                BoxShadow(
                  color: accentColor.withOpacity(_glowAnimation.value),
                  blurRadius: 30 * _scaleAnimation.value,
                  spreadRadius: 10 * _scaleAnimation.value,
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
              size: 40,
              color: accentColor,
            ),
          ),
        );
      },
    );
  }
}
