import 'package:flutter/material.dart';
import '../../../app/theme.dart';

class GoalsScreen extends StatefulWidget {
  const GoalsScreen({super.key});

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen> {
  String _filter = 'Active';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background
          Positioned(
            top: -100, right: -100,
            child: Container(
              width: 400, height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.rose500.withOpacity(0.08),
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
                              const Icon(Icons.flag, color: AppTheme.rose400, size: 28),
                              const SizedBox(width: 12),
                              Text('My Goals',
                                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Text('Track your progress and get AI next steps',
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

                // Filters
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppTheme.cardColorTranslucent,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderColorSubtle),
                    ),
                    child: Row(
                      children: ['Active', 'Completed', 'All'].map((tab) {
                        final isSelected = _filter == tab;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _filter = tab),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? AppTheme.borderColor : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              alignment: Alignment.center,
                              child: Text(tab,
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
                
                // Content (Empty State for now)
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 100, height: 100,
                            decoration: BoxDecoration(
                              color: AppTheme.rose500.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Text('🎯', style: TextStyle(fontSize: 48)),
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text('No Active Goals',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Define what you want to achieve. AI LifeOS will help you break it down into actionable milestones.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppTheme.secondaryText, height: 1.5, fontSize: 15),
                          ),
                          const SizedBox(height: 32),
                          ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.add, color: Colors.white),
                            label: const Text('Create Your First Goal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.rose500,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
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
