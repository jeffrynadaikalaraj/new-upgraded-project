import 'dart:ui';
import 'package:flutter/material.dart';
import '../../app/theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final BorderRadiusGeometry? borderRadius;
  final Color? color;
  final Border? border;
  final double blur;

  const GlassCard({
    super.key,
    required this.child,
    this.width,
    this.height,
    this.padding = const EdgeInsets.all(16.0),
    this.margin = EdgeInsets.zero,
    this.borderRadius,
    this.color,
    this.border,
    this.blur = 16.0,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = borderRadius ?? BorderRadius.circular(16);
    
    return Padding(
      padding: margin,
      child: ClipRRect(
        borderRadius: effectiveRadius,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            width: width,
            height: height,
            padding: padding,
            decoration: BoxDecoration(
              color: color ?? AppTheme.cardColorTranslucent,
              borderRadius: effectiveRadius,
              border: border ?? Border.all(color: AppTheme.borderColorSubtle, width: 1.0),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
