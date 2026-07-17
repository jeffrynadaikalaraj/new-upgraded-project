import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/chat/screens/chat_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/goals/screens/goals_screen.dart';
import '../features/habits/screens/habits_screen.dart';
import '../features/planner/screens/planner_screen.dart';
import '../shared/widgets/app_scaffold.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _shellNavigatorDashboardKey = GlobalKey<NavigatorState>(debugLabel: 'shellDashboard');
final GlobalKey<NavigatorState> _shellNavigatorGoalsKey = GlobalKey<NavigatorState>(debugLabel: 'shellGoals');
final GlobalKey<NavigatorState> _shellNavigatorChatKey = GlobalKey<NavigatorState>(debugLabel: 'shellChat');
final GlobalKey<NavigatorState> _shellNavigatorHabitsKey = GlobalKey<NavigatorState>(debugLabel: 'shellHabits');
final GlobalKey<NavigatorState> _shellNavigatorPlannerKey = GlobalKey<NavigatorState>(debugLabel: 'shellPlanner');

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppScaffold(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _shellNavigatorDashboardKey,
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorGoalsKey,
            routes: [
              GoRoute(
                path: '/goals',
                builder: (context, state) => const GoalsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorChatKey,
            routes: [
              GoRoute(
                path: '/chat',
                builder: (context, state) => const ChatScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorHabitsKey,
            routes: [
              GoRoute(
                path: '/habits',
                builder: (context, state) => const HabitsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _shellNavigatorPlannerKey,
            routes: [
              GoRoute(
                path: '/planner',
                builder: (context, state) => const PlannerScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
