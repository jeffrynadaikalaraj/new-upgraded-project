import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'glass_card.dart';
import '../../app/theme.dart';

class PremiumCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final bool enableGlow;
  final Color? glowColor;

  const PremiumCard({
    super.key,
    required this.child,
    this.onTap,
    this.width,
    this.height,
    this.padding = const EdgeInsets.all(20.0),
    this.margin = EdgeInsets.zero,
    this.enableGlow = true,
    this.glowColor,
  });

  @override
  State<PremiumCard> createState() => _PremiumCardState();
}

class _PremiumCardState extends State<PremiumCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final defaultGlow = widget.glowColor ?? AppTheme.accentIndigo.withOpacity(0.15);
    
    Widget content = MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutQuart,
          width: widget.width,
          height: widget.height,
          margin: widget.margin,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: _isHovered && widget.enableGlow
                ? [
                    BoxShadow(
                      color: defaultGlow,
                      blurRadius: 24,
                      spreadRadius: 2,
                    ),
                  ]
                : [],
          ),
          child: GlassCard(
            padding: widget.padding,
            color: _isHovered 
                ? AppTheme.cardColorTranslucent.withOpacity(0.7) 
                : AppTheme.cardColorTranslucent,
            border: Border.all(
              color: _isHovered 
                  ? (widget.glowColor?.withOpacity(0.3) ?? AppTheme.borderColorSubtle)
                  : AppTheme.borderColorSubtle,
              width: 1.0,
            ),
            child: widget.child,
          ),
        ),
      ),
    );

    if (widget.onTap != null) {
      // Add tap scale animation if tappable
      content = content
          .animate(target: _isHovered ? 1 : 0)
          .scaleXY(end: 1.02, curve: Curves.easeOutQuart, duration: 300.ms);
    } else {
       // Just hover scale for non-tappable but hovered premium cards
       content = content
          .animate(target: _isHovered ? 1 : 0)
          .scaleXY(end: 1.01, curve: Curves.easeOutQuart, duration: 300.ms);
    }

    return content;
  }
}
