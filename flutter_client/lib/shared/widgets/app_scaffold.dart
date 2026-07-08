import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const AppScaffold({
    super.key,
    required this.navigationShell,
  });

  void _goBranch(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: _goBranch,
        backgroundColor: const Color(0xFF0f172a),
        indicatorColor: const Color(0xFF818cf8).withOpacity(0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: Color(0xFF818cf8)),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.flag_outlined),
            selectedIcon: Icon(Icons.flag, color: Color(0xFF818cf8)),
            label: 'Goals',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble, color: Color(0xFF818cf8)),
            label: 'AI Chat',
          ),
          NavigationDestination(
            icon: Icon(Icons.check_circle_outline),
            selectedIcon: Icon(Icons.check_circle, color: Color(0xFF818cf8)),
            label: 'Habits',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt),
            selectedIcon: Icon(Icons.list_alt, color: Color(0xFF818cf8)),
            label: 'Planner',
          ),
        ],
      ),
    );
  }
}
