import 'package:flutter/material.dart';
import '../../../app/theme.dart';

class HabitsScreen extends StatefulWidget {
  const HabitsScreen({super.key});

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  String _filterCategory = 'all';
  final List<String> _categories = ['all', 'health', 'fitness', 'productivity', 'mindfulness', 'learning', 'other'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: 0, right: 0,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.violet500.withOpacity(0.08),
              ),
            ),
          ),
          Positioned(
            bottom: 0, left: 0,
            child: Container(
              width: 250, height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.emerald500.withOpacity(0.06),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.show_chart, color: AppTheme.violet400, size: 28),
                              const SizedBox(width: 12),
                              Text('My Habits',
                                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Text('Build consistency one day at a time.',
                            style: TextStyle(color: AppTheme.secondaryText, fontSize: 14),
                          ),
                        ],
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: AppTheme.cardColorTranslucent,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderColor),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.add, color: Colors.white),
                          onPressed: () {},
                        ),
                      ),
                    ],
                  ),
                ),

                // Category Filter (horizontal scroll)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _categories.map((cat) {
                        final isSelected = _filterCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: GestureDetector(
                            onTap: () => setState(() => _filterCategory = cat),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? AppTheme.borderColor : AppTheme.cardColorTranslucent,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppTheme.borderColorSubtle),
                              ),
                              child: Text(
                                cat.substring(0, 1).toUpperCase() + cat.substring(1),
                                style: TextStyle(
                                  color: isSelected ? Colors.white : AppTheme.secondaryText,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),

                // Empty State
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Stack(
                            alignment: Alignment.topRight,
                            children: [
                              Container(
                                width: 90, height: 90,
                                decoration: BoxDecoration(
                                  color: AppTheme.violet500.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Center(
                                  child: Icon(Icons.show_chart, size: 40, color: AppTheme.violet400),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppTheme.orange500.withOpacity(0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Text('🔥', style: TextStyle(fontSize: 16)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          Text(
                            _filterCategory == 'all' ? '🔥 No habits created' : 'No $_filterCategory habits',
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _filterCategory == 'all' 
                                ? 'Small daily actions create massive results.'
                                : 'Try another category or create your first $_filterCategory habit.',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: AppTheme.secondaryText, height: 1.5, fontSize: 15),
                          ),
                          if (_filterCategory == 'all') ...[
                            const SizedBox(height: 32),
                            ElevatedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.add, color: Colors.white),
                              label: const Text('Create Your First Habit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.indigo500,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ]
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
