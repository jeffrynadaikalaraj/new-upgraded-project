import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/calendar_provider.dart';
import '../models/event.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    // Load events on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(calendarProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final calendarAsync = ref.watch(calendarProvider);
    final formattedDate = DateFormat('MMMM yyyy').format(_selectedDate);

    return Scaffold(
      body: FloatingOrbBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
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
                            const Icon(LucideIcons.calendar, color: AppTheme.sky400, size: 28),
                            const SizedBox(width: 12),
                            Text('Smart Calendar',
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Plan and time-block your goals.',
                          style: const TextStyle(color: AppTheme.secondaryText, fontSize: 14),
                        ),
                      ],
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
                  ],
                ),
              ),

              Divider(color: AppTheme.borderColorSubtle, height: 1),

              // Calendar View Placeholder
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(formattedDate, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(LucideIcons.chevronLeft, color: AppTheme.secondaryText),
                          onPressed: () {
                            setState(() {
                              _selectedDate = DateTime(_selectedDate.year, _selectedDate.month - 1, _selectedDate.day);
                            });
                          },
                        ),
                        IconButton(
                          icon: const Icon(LucideIcons.chevronRight, color: AppTheme.secondaryText),
                          onPressed: () {
                            setState(() {
                              _selectedDate = DateTime(_selectedDate.year, _selectedDate.month + 1, _selectedDate.day);
                            });
                          },
                        ),
                      ],
                    )
                  ],
                ),
              ),

              // Events List
              Expanded(
                child: calendarAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.sky400)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose500))),
                  data: (events) {
                    // filter events for selected date? 
                    // To keep it simple, just display all fetched events for now or filter by month
                    final filteredEvents = events.where((e) => e.startTime.year == _selectedDate.year && e.startTime.month == _selectedDate.month).toList();

                    if (filteredEvents.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.calendarX, color: AppTheme.secondaryText, size: 48),
                            const SizedBox(height: 16),
                            const Text('No events this month', style: TextStyle(color: AppTheme.secondaryText)),
                          ],
                        ),
                      ).animate().fadeIn();
                    }

                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      itemCount: filteredEvents.length,
                      itemBuilder: (context, index) {
                        final event = filteredEvents[index];
                        return PremiumCard(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(event.title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                              if (event.description.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(event.description, style: const TextStyle(color: AppTheme.secondaryText, fontSize: 14)),
                              ],
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  const Icon(LucideIcons.clock, color: AppTheme.sky400, size: 14),
                                  const SizedBox(width: 4),
                                  Text(
                                    DateFormat('MMM d, h:mm a').format(event.startTime),
                                    style: const TextStyle(color: AppTheme.sky400, fontSize: 12),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.1, end: 0);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.sky500,
        child: const Icon(LucideIcons.plus, color: Colors.white),
      ),
    );
  }
}
