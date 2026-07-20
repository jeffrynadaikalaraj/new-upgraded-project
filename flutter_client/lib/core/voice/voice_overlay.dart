import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:ui' show ImageFilter;
import '../../../app/theme.dart';
import '../../shared/widgets/ai_avatar/motion_face_avatar.dart';
import '../../shared/design_system/premium_card.dart';
import 'voice_controller.dart';

class VoiceOverlay extends ConsumerWidget {
  const VoiceOverlay({super.key});

  static void show(BuildContext context) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Voice Assistant',
      barrierColor: Colors.black.withOpacity(0.6),
      transitionDuration: const Duration(milliseconds: 400),
      pageBuilder: (context, anim1, anim2) {
        return const VoiceOverlay();
      },
      transitionBuilder: (context, anim1, anim2, child) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10 * anim1.value, sigmaY: 10 * anim1.value),
          child: FadeTransition(
            opacity: anim1,
            child: child,
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voiceState = ref.watch(voiceControllerProvider);
    final voiceController = ref.read(voiceControllerProvider.notifier);

    AIFaceState faceState = AIFaceState.idle;
    if (voiceState.isSpeaking) {
      faceState = AIFaceState.speaking;
    } else if (voiceState.isListening) {
      faceState = AIFaceState.listening;
    } else if (voiceState.responseText == '...') {
      faceState = AIFaceState.thinking;
    }

    return Material(
      color: Colors.transparent,
      child: Center(
        child: PremiumCard(
          padding: const EdgeInsets.all(32),
          width: MediaQuery.of(context).size.width * 0.85,
          glowColor: voiceState.isListening 
              ? AppTheme.emerald500.withOpacity(0.3) 
              : AppTheme.accentIndigo.withOpacity(0.3),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Avatar
              MotionFaceAvatar(
                state: faceState,
                size: 140,
                volume: voiceState.volume,
              ),
              const SizedBox(height: 32),
              
              // Text Content
              if (voiceState.hasError) ...[
                Text(
                  'Error: ${voiceState.errorMessage}',
                  style: const TextStyle(color: AppTheme.rose400, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ] else if (voiceState.isSpeaking) ...[
                Text(
                  voiceState.responseText,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500, height: 1.4),
                  textAlign: TextAlign.center,
                ).animate().fadeIn(duration: 300.ms),
              ] else if (voiceState.isListening) ...[
                Text(
                  voiceState.recognizedText.isEmpty ? 'Listening...' : voiceState.recognizedText,
                  style: TextStyle(
                    color: voiceState.recognizedText.isEmpty ? AppTheme.emerald400 : Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ] else ...[
                const Text(
                  'How can I help you?',
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ],
              
              const SizedBox(height: 40),
              
              // Controls
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onTap: () {
                      if (voiceState.isListening) {
                        voiceController.stopListening();
                      } else {
                        voiceController.startListening();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: voiceState.isListening ? AppTheme.accentGradient : AppTheme.buttonGradient,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: voiceState.isListening ? AppTheme.emerald500.withOpacity(0.4) : AppTheme.indigo500.withOpacity(0.4),
                            blurRadius: 20,
                            spreadRadius: voiceState.isListening ? 4 : 0,
                          )
                        ],
                      ),
                      child: Icon(
                        voiceState.isListening ? LucideIcons.mic : LucideIcons.micOff,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  voiceController.stopListening();
                  voiceController.stopSpeaking();
                  Navigator.of(context).pop();
                },
                child: const Text('Close', style: TextStyle(color: AppTheme.mutedText)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
