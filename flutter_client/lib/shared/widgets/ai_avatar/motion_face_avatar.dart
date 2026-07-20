import 'dart:math';
import 'package:flutter/material.dart';

enum AIFaceState {
  idle,
  listening,
  thinking,
  speaking,
  happy,
  excited,
  concerned,
  error,
  sleeping,
}

class MotionFaceAvatar extends StatefulWidget {
  final AIFaceState state;
  final double size;
  final double volume; // 0.0 to 1.0 for lip sync

  const MotionFaceAvatar({
    super.key,
    this.state = AIFaceState.idle,
    this.size = 120.0,
    this.volume = 0.0,
  });

  @override
  State<MotionFaceAvatar> createState() => _MotionFaceAvatarState();
}

class _MotionFaceAvatarState extends State<MotionFaceAvatar> with TickerProviderStateMixin {
  late AnimationController _breathingController;
  late AnimationController _eyeMovementController;
  late AnimationController _blinkController;
  late AnimationController _thinkingController;
  
  Offset _eyeOffset = Offset.zero;
  bool _isBlinking = false;

  @override
  void initState() {
    super.initState();
    
    // Breathing
    _breathingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat(reverse: true);

    // Eye Movement (random darting)
    _eyeMovementController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scheduleNextEyeMovement();

    // Blinking
    _blinkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _blinkController.reverse();
        } else if (status == AnimationStatus.dismissed) {
          _isBlinking = false;
          _scheduleNextBlink();
        }
      });
    _scheduleNextBlink();

    // Thinking (orbiting particles)
    _thinkingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  void _scheduleNextEyeMovement() {
    Future.delayed(Duration(milliseconds: 1000 + Random().nextInt(3000)), () {
      if (mounted) {
        setState(() {
          final maxOffset = 5.0;
          if (widget.state == AIFaceState.thinking) {
             _eyeOffset = Offset(
              Random().nextDouble() * maxOffset * 2 - maxOffset,
              -Random().nextDouble() * maxOffset - maxOffset, // Look up
            );
          } else if (widget.state == AIFaceState.sleeping) {
            _eyeOffset = Offset.zero;
          } else {
            _eyeOffset = Offset(
              Random().nextDouble() * maxOffset * 2 - maxOffset,
              Random().nextDouble() * maxOffset * 2 - maxOffset,
            );
          }
        });
        _eyeMovementController.forward(from: 0);
        _scheduleNextEyeMovement();
      }
    });
  }

  void _scheduleNextBlink() {
    Future.delayed(Duration(milliseconds: 2000 + Random().nextInt(4000)), () {
      if (mounted && widget.state != AIFaceState.sleeping) {
        setState(() {
          _isBlinking = true;
        });
        _blinkController.forward();
      } else if (mounted) {
        _scheduleNextBlink();
      }
    });
  }

  @override
  void dispose() {
    _breathingController.dispose();
    _eyeMovementController.dispose();
    _blinkController.dispose();
    _thinkingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([
        _breathingController,
        _eyeMovementController,
        _blinkController,
        _thinkingController,
      ]),
      builder: (context, child) {
        return CustomPaint(
          size: Size(widget.size, widget.size),
          painter: _FacePainter(
            state: widget.state,
            breathingValue: _breathingController.value,
            eyeOffset: _eyeOffset,
            blinkValue: _isBlinking ? _blinkController.value : (widget.state == AIFaceState.sleeping ? 1.0 : 0.0),
            thinkingValue: _thinkingController.value,
            volume: widget.volume,
          ),
        );
      },
    );
  }
}

class _FacePainter extends CustomPainter {
  final AIFaceState state;
  final double breathingValue;
  final Offset eyeOffset;
  final double blinkValue; // 0 = open, 1 = closed
  final double thinkingValue; // 0 to 1 for rotation
  final double volume;

  _FacePainter({
    required this.state,
    required this.breathingValue,
    required this.eyeOffset,
    required this.blinkValue,
    required this.thinkingValue,
    required this.volume,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    _drawBackground(canvas, center, radius);
    
    if (state == AIFaceState.thinking) {
      _drawThinkingAura(canvas, center, radius);
    }

    _drawEyes(canvas, center, radius);
    _drawMouth(canvas, center, radius);
  }

  void _drawBackground(Canvas canvas, Offset center, double radius) {
    // Breathing scale effect
    final scale = 1.0 + (breathingValue * 0.03) + (state == AIFaceState.excited ? 0.05 : 0.0);
    final scaledRadius = radius * scale;

    // Base face color based on state
    Color baseColor;
    switch (state) {
      case AIFaceState.listening:
        baseColor = const Color(0xFF6366F1); // Indigo
        break;
      case AIFaceState.error:
        baseColor = const Color(0xFFEF4444); // Red
        break;
      case AIFaceState.happy:
      case AIFaceState.excited:
        baseColor = const Color(0xFF10B981); // Emerald
        break;
      case AIFaceState.thinking:
        baseColor = const Color(0xFF8B5CF6); // Purple
        break;
      case AIFaceState.sleeping:
        baseColor = const Color(0xFF475569); // Slate
        break;
      case AIFaceState.concerned:
        baseColor = const Color(0xFFF59E0B); // Amber
        break;
      default:
        baseColor = const Color(0xFF3B82F6); // Blue
    }

    final paint = Paint()
      ..shader = RadialGradient(
        colors: [
          baseColor.withOpacity(0.8),
          baseColor.withOpacity(0.2),
          Colors.transparent,
        ],
        stops: const [0.5, 0.8, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: scaledRadius));

    canvas.drawCircle(center, scaledRadius, paint);
  }

  void _drawThinkingAura(Canvas canvas, Offset center, double radius) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(thinkingValue * 2 * pi);
    
    // Draw rotating arcs
    canvas.drawArc(
      Rect.fromCircle(center: Offset.zero, radius: radius * 0.8),
      0, pi / 2, false, paint,
    );
    canvas.drawArc(
      Rect.fromCircle(center: Offset.zero, radius: radius * 0.8),
      pi, pi / 2, false, paint,
    );
    
    canvas.restore();
  }

  void _drawEyes(Canvas canvas, Offset center, double radius) {
    final eyeSpacing = radius * 0.35;
    final eyeHeightOffset = -radius * 0.1;
    
    // Angry/concerned brows
    if (state == AIFaceState.concerned || state == AIFaceState.error) {
      final browPaint = Paint()
        ..color = Colors.white.withOpacity(0.8)
        ..strokeWidth = 4.0
        ..strokeCap = StrokeCap.round;
      
      final leftBrowCenter = center + Offset(-eyeSpacing, eyeHeightOffset - radius * 0.25);
      final rightBrowCenter = center + Offset(eyeSpacing, eyeHeightOffset - radius * 0.25);
      
      final browDip = state == AIFaceState.error ? radius * 0.1 : -radius * 0.05;
      
      canvas.drawLine(leftBrowCenter + Offset(-15, -browDip), leftBrowCenter + Offset(15, browDip), browPaint);
      canvas.drawLine(rightBrowCenter + Offset(-15, browDip), rightBrowCenter + Offset(15, -browDip), browPaint);
    }
    
    // Draw Eyes
    final leftEyeCenter = center + Offset(-eyeSpacing, eyeHeightOffset) + eyeOffset;
    final rightEyeCenter = center + Offset(eyeSpacing, eyeHeightOffset) + eyeOffset;
    
    _drawSingleEye(canvas, leftEyeCenter, radius);
    _drawSingleEye(canvas, rightEyeCenter, radius);
  }

  void _drawSingleEye(Canvas canvas, Offset eyeCenter, double radius) {
    final eyeRadius = radius * 0.15 * (state == AIFaceState.excited ? 1.2 : 1.0);
    final paint = Paint()..color = Colors.white;

    if (blinkValue > 0) {
      // Blinking or sleeping
      final closedEyeHeight = eyeRadius * (1.0 - blinkValue);
      if (closedEyeHeight <= 1.0) {
        // Fully closed line
        paint.strokeWidth = 4.0;
        paint.strokeCap = StrokeCap.round;
        double curve = state == AIFaceState.happy ? -5.0 : 0.0;
        
        final path = Path()
          ..moveTo(eyeCenter.dx - eyeRadius, eyeCenter.dy)
          ..quadraticBezierTo(eyeCenter.dx, eyeCenter.dy + curve, eyeCenter.dx + eyeRadius, eyeCenter.dy);
        canvas.drawPath(path, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 4.0..strokeCap = StrokeCap.round);
      } else {
        canvas.drawOval(
          Rect.fromCenter(center: eyeCenter, width: eyeRadius * 2, height: closedEyeHeight * 2),
          paint,
        );
      }
    } else {
      // Open
      if (state == AIFaceState.happy) {
        // Happy arch eyes ^ ^
        final path = Path()
          ..moveTo(eyeCenter.dx - eyeRadius, eyeCenter.dy)
          ..quadraticBezierTo(eyeCenter.dx, eyeCenter.dy - eyeRadius, eyeCenter.dx + eyeRadius, eyeCenter.dy);
        canvas.drawPath(path, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 6.0..strokeCap = StrokeCap.round);
      } else {
        canvas.drawCircle(eyeCenter, eyeRadius, paint);
      }
    }
  }

  void _drawMouth(Canvas canvas, Offset center, double radius) {
    final mouthCenter = center + Offset(0, radius * 0.3);
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    if (state == AIFaceState.speaking) {
      // Lip sync mapping based on volume
      final mouthWidth = radius * 0.4;
      final mouthHeight = radius * 0.1 + (volume * radius * 0.3);
      
      canvas.drawOval(
        Rect.fromCenter(center: mouthCenter, width: mouthWidth, height: mouthHeight),
        paint,
      );
    } else if (state == AIFaceState.happy || state == AIFaceState.excited) {
      // Smile
      final path = Path()
        ..moveTo(mouthCenter.dx - radius * 0.2, mouthCenter.dy)
        ..quadraticBezierTo(mouthCenter.dx, mouthCenter.dy + radius * 0.2, mouthCenter.dx + radius * 0.2, mouthCenter.dy);
      canvas.drawPath(path, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 4.0..strokeCap = StrokeCap.round);
    } else if (state == AIFaceState.concerned || state == AIFaceState.error) {
      // Frown
      final path = Path()
        ..moveTo(mouthCenter.dx - radius * 0.15, mouthCenter.dy + radius * 0.1)
        ..quadraticBezierTo(mouthCenter.dx, mouthCenter.dy, mouthCenter.dx + radius * 0.15, mouthCenter.dy + radius * 0.1);
      canvas.drawPath(path, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 4.0..strokeCap = StrokeCap.round);
    } else if (state == AIFaceState.listening) {
      // Small pulsing circle for listening
      final r = radius * 0.05 + (breathingValue * radius * 0.02);
      canvas.drawCircle(mouthCenter, r, paint);
    } else if (state == AIFaceState.sleeping) {
      // Zzz
      final textSpan = const TextSpan(
        text: 'z',
        style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      textPainter.paint(canvas, center + Offset(radius * 0.3, -radius * 0.5 - (breathingValue * 10)));
    } else {
      // Neutral line
      final path = Path()
        ..moveTo(mouthCenter.dx - radius * 0.1, mouthCenter.dy)
        ..lineTo(mouthCenter.dx + radius * 0.1, mouthCenter.dy);
      canvas.drawPath(path, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 3.0..strokeCap = StrokeCap.round);
    }
  }

  @override
  bool shouldRepaint(covariant _FacePainter oldDelegate) {
    return state != oldDelegate.state ||
        breathingValue != oldDelegate.breathingValue ||
        eyeOffset != oldDelegate.eyeOffset ||
        blinkValue != oldDelegate.blinkValue ||
        thinkingValue != oldDelegate.thinkingValue ||
        volume != oldDelegate.volume;
  }
}
