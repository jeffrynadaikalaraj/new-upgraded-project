import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import 'dart:ui' show ImageFilter;
import '../../core/voice/voice_overlay.dart';

class AppScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const AppScaffold({super.key, required this.navigationShell});

  void _onItemTapped(int index, BuildContext context) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // allow content to scroll behind the nav bar
      body: navigationShell,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 32.0),
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.accentIndigo.withOpacity(0.4),
                blurRadius: 16,
                spreadRadius: 2,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: FloatingActionButton(
            onPressed: () {
              VoiceOverlay.show(context);
            },
            backgroundColor: AppTheme.scaffoldBackground,
            child: const Icon(LucideIcons.mic, color: AppTheme.accentIndigo),
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final currentIndex = navigationShell.currentIndex;

    return ClipRRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20.0, sigmaY: 20.0),
        child: Container(
          height: 80,
          decoration: BoxDecoration(
            color: AppTheme.scaffoldBackground.withOpacity(0.85),
            border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 30,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavItem(0, LucideIcons.layoutDashboard, 'Home', currentIndex == 0, context),
                  _buildNavItem(1, LucideIcons.target, 'Goals', currentIndex == 1, context),
                  _buildPrimaryNavItem(2, LucideIcons.sparkles, currentIndex == 2, context),
                  _buildNavItem(3, LucideIcons.activity, 'Habits', currentIndex == 3, context),
                  _buildNavItem(4, LucideIcons.calendarDays, 'Planner', currentIndex == 4, context),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, bool isActive, BuildContext context) {
    Widget child = Container(
      width: 60,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 24,
            color: isActive ? AppTheme.accentIndigo : AppTheme.mutedText,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: isActive ? AppTheme.accentIndigo : AppTheme.mutedText,
              letterSpacing: 0.2,
            ),
          ),
          if (isActive) ...[
            const SizedBox(height: 4),
            Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accentIndigo,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentIndigo.withOpacity(0.6),
                    blurRadius: 6,
                  ),
                ],
              ),
            ).animate().scale(curve: Curves.easeOutBack, duration: 300.ms),
          ]
        ],
      ),
    );

    if (isActive) {
      child = child.animate().slideY(begin: 0.1, end: 0, duration: 200.ms);
    }

    return GestureDetector(
      onTap: () => _onItemTapped(index, context),
      behavior: HitTestBehavior.opaque,
      child: child,
    );
  }

  Widget _buildPrimaryNavItem(int index, IconData icon, bool isActive, BuildContext context) {
    return GestureDetector(
      onTap: () => _onItemTapped(index, context),
      child: Container(
        width: 52,
        height: 52,
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          gradient: AppTheme.buttonGradient,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: AppTheme.indigo500.withOpacity(0.4),
              blurRadius: 15,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: AppTheme.indigo500.withOpacity(0.1),
              spreadRadius: 3,
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 28,
          color: Colors.white,
        ).animate(target: isActive ? 1 : 0).rotate(begin: 0, end: 0.1),
      ),
    );
  }
}
