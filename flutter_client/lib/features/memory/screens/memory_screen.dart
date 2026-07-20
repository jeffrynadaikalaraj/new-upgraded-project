import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/memory_provider.dart';

class MemoryScreen extends ConsumerStatefulWidget {
  const MemoryScreen({super.key});

  @override
  ConsumerState<MemoryScreen> createState() => _MemoryScreenState();
}

class _MemoryScreenState extends ConsumerState<MemoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  
  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    ref.read(memoryProvider.notifier).refresh(search: query.isNotEmpty ? query : null);
  }

  @override
  Widget build(BuildContext context) {
    final memoryAsync = ref.watch(memoryProvider);

    return Scaffold(
      body: FloatingOrbBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 8),
                    const Icon(LucideIcons.brain, color: AppTheme.violet400, size: 28),
                    const SizedBox(width: 12),
                    Text('Memory System',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
              ),
              
              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(color: Colors.white),
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Search memories...',
                    prefixIcon: const Icon(LucideIcons.search, color: AppTheme.secondaryText),
                    filled: true,
                    fillColor: AppTheme.cardColorTranslucent,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.borderColorSubtle),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: const BorderSide(color: AppTheme.borderColorSubtle),
                    ),
                  ),
                ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.1, end: 0),
              ),
              
              const SizedBox(height: 16),
              
              // Content
              Expanded(
                child: memoryAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.violet500)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose500))),
                  data: (memories) {
                    if (memories.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.brainCircuit, color: AppTheme.secondaryText, size: 48),
                            const SizedBox(height: 16),
                            const Text('No memories found.', style: TextStyle(color: AppTheme.secondaryText, fontSize: 16)),
                          ],
                        ),
                      ).animate().fadeIn();
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref.read(memoryProvider.notifier).refresh(),
                      color: AppTheme.violet500,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        itemCount: memories.length,
                        itemBuilder: (context, index) {
                          final memory = memories[index];
                          return PremiumCard(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppTheme.violet500.withOpacity(0.15),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(LucideIcons.hash, color: AppTheme.violet400, size: 16),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(memory.content, style: const TextStyle(color: Colors.white, fontSize: 14)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(0.05),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              memory.category,
                                              style: const TextStyle(color: AppTheme.mutedText, fontSize: 10),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(0.05),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              'Importance: ${memory.importance}',
                                              style: const TextStyle(color: AppTheme.mutedText, fontSize: 10),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.trash2, color: AppTheme.rose400, size: 18),
                                  onPressed: () {
                                    ref.read(memoryProvider.notifier).deleteMemory(memory.id);
                                  },
                                ),
                              ],
                            ),
                          ).animate().fadeIn(delay: (50 * index).ms).slideX(begin: 0.05, end: 0);
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
