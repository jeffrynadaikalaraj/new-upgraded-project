import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
// import 'package:file_picker/file_picker.dart'; // To be added to pubspec
import '../../../app/theme.dart';
import '../../shared/design_system/floating_orbs.dart';
import '../../shared/design_system/premium_card.dart';
import '../providers/documents_provider.dart';

class DocumentsScreen extends ConsumerStatefulWidget {
  const DocumentsScreen({super.key});

  @override
  ConsumerState<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends ConsumerState<DocumentsScreen> {
  bool _isUploading = false;

  Future<void> _pickAndUploadFile() async {
    /*
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'txt', 'png', 'jpg'],
      );
      if (result != null && result.files.single.path != null) {
        setState(() => _isUploading = true);
        File file = File(result.files.single.path!);
        await ref.read(documentsProvider.notifier).uploadDocument(file);
        setState(() => _isUploading = false);
      }
    } catch (e) {
      setState(() => _isUploading = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
    */
    // Placeholder until file_picker is installed
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File picker requires native permissions. Plug in file_picker here.')));
  }

  void _showQA(String documentId, String title) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DocumentQAModal(documentId: documentId, title: title),
    );
  }

  @override
  Widget build(BuildContext context) {
    final docsAsync = ref.watch(documentsProvider);

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
                    const Icon(LucideIcons.fileText, color: AppTheme.sky400, size: 28),
                    const SizedBox(width: 12),
                    Text('Document AI',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),
              ),
              
              if (_isUploading)
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: LinearProgressIndicator(color: AppTheme.sky400),
                ),

              Expanded(
                child: docsAsync.when(
                  loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.sky500)),
                  error: (e, st) => Center(child: Text('Error: $e', style: const TextStyle(color: AppTheme.rose500))),
                  data: (docs) {
                    if (docs.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.fileQuestion, color: AppTheme.secondaryText, size: 48),
                            const SizedBox(height: 16),
                            const Text('No documents found.', style: TextStyle(color: AppTheme.secondaryText, fontSize: 16)),
                          ],
                        ),
                      ).animate().fadeIn();
                    }

                    return RefreshIndicator(
                      onRefresh: () => ref.read(documentsProvider.notifier).refresh(),
                      color: AppTheme.sky500,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        itemCount: docs.length,
                        itemBuilder: (context, index) {
                          final doc = docs[index];
                          return PremiumCard(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(LucideIcons.file, color: AppTheme.sky400, size: 20),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        doc.originalName,
                                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(LucideIcons.trash2, color: AppTheme.rose400, size: 18),
                                      onPressed: () {
                                        ref.read(documentsProvider.notifier).deleteDocument(doc.id);
                                      },
                                    ),
                                  ],
                                ),
                                if (doc.summary.isNotEmpty) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    doc.summary,
                                    style: const TextStyle(color: AppTheme.secondaryText, fontSize: 13),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      DateFormat('MMM d, yyyy').format(doc.createdAt),
                                      style: const TextStyle(color: AppTheme.mutedText, fontSize: 12),
                                    ),
                                    TextButton.icon(
                                      onPressed: () => _showQA(doc.id, doc.originalName),
                                      icon: const Icon(LucideIcons.messageSquare, size: 16, color: AppTheme.sky400),
                                      label: const Text('Ask AI', style: TextStyle(color: AppTheme.sky400)),
                                      style: TextButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                        backgroundColor: AppTheme.sky500.withOpacity(0.1),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      ),
                                    ),
                                  ],
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
      floatingActionButton: FloatingActionButton(
        onPressed: _pickAndUploadFile,
        backgroundColor: AppTheme.sky500,
        child: const Icon(LucideIcons.upload, color: Colors.white),
      ),
    );
  }
}

class _DocumentQAModal extends ConsumerStatefulWidget {
  final String documentId;
  final String title;

  const _DocumentQAModal({required this.documentId, required this.title});

  @override
  ConsumerState<_DocumentQAModal> createState() => _DocumentQAModalState();
}

class _DocumentQAModalState extends ConsumerState<_DocumentQAModal> {
  final TextEditingController _qController = TextEditingController();
  String _answer = '';
  bool _isAsking = false;

  void _ask() async {
    if (_qController.text.trim().isEmpty) return;
    setState(() {
      _isAsking = true;
      _answer = '';
    });
    final response = await ref.read(documentsProvider.notifier).askQuestion(widget.documentId, _qController.text);
    setState(() {
      _isAsking = false;
      _answer = response ?? 'Failed to get answer.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 24, left: 24, right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Ask about "${widget.title}"',
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            maxLines: 1, overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: SingleChildScrollView(
              child: _answer.isNotEmpty 
                ? Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.sky500.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.sky500.withOpacity(0.2)),
                    ),
                    child: Text(_answer, style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.5)),
                  )
                : const Center(child: Text('Ask a question below...', style: TextStyle(color: AppTheme.mutedText))),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _qController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'What is this document about?',
                    filled: true,
                    fillColor: AppTheme.cardColorTranslucent,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.sky500,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: IconButton(
                  icon: _isAsking 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(LucideIcons.send, color: Colors.white),
                  onPressed: _isAsking ? null : _ask,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
