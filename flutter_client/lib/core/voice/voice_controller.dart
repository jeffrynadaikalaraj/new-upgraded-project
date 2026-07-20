import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:flutter_tts/flutter_tts.dart';

final voiceControllerProvider = StateNotifierProvider<VoiceController, VoiceState>((ref) {
  return VoiceController();
});

class VoiceState {
  final bool isListening;
  final bool isSpeaking;
  final String recognizedText;
  final String responseText;
  final bool hasError;
  final String errorMessage;
  final double volume;

  VoiceState({
    this.isListening = false,
    this.isSpeaking = false,
    this.recognizedText = '',
    this.responseText = '',
    this.hasError = false,
    this.errorMessage = '',
    this.volume = 0.0,
  });

  VoiceState copyWith({
    bool? isListening,
    bool? isSpeaking,
    String? recognizedText,
    String? responseText,
    bool? hasError,
    String? errorMessage,
    double? volume,
  }) {
    return VoiceState(
      isListening: isListening ?? this.isListening,
      isSpeaking: isSpeaking ?? this.isSpeaking,
      recognizedText: recognizedText ?? this.recognizedText,
      responseText: responseText ?? this.responseText,
      hasError: hasError ?? this.hasError,
      errorMessage: errorMessage ?? this.errorMessage,
      volume: volume ?? this.volume,
    );
  }
}

class VoiceController extends StateNotifier<VoiceState> {
  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  bool _speechEnabled = false;

  VoiceController() : super(VoiceState()) {
    _initSpeech();
    _initTts();
  }

  void _initSpeech() async {
    _speechEnabled = await _speechToText.initialize(
      onError: (errorNotification) {
        state = state.copyWith(hasError: true, errorMessage: errorNotification.errorMsg, isListening: false);
      },
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          state = state.copyWith(isListening: false);
          if (state.recognizedText.isNotEmpty && !state.hasError) {
            _processCommand(state.recognizedText);
          }
        }
      },
    );
  }

  void _initTts() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);

    _flutterTts.setStartHandler(() {
      state = state.copyWith(isSpeaking: true);
    });

    _flutterTts.setCompletionHandler(() {
      state = state.copyWith(isSpeaking: false, volume: 0.0);
    });

    _flutterTts.setCancelHandler(() {
      state = state.copyWith(isSpeaking: false, volume: 0.0);
    });

    _flutterTts.setErrorHandler((msg) {
      state = state.copyWith(isSpeaking: false, hasError: true, errorMessage: msg, volume: 0.0);
    });
  }

  Future<void> startListening() async {
    if (!_speechEnabled) {
      state = state.copyWith(hasError: true, errorMessage: 'Speech recognition not enabled/authorized.');
      return;
    }
    state = state.copyWith(isListening: true, recognizedText: '', hasError: false, errorMessage: '', responseText: '');
    await _speechToText.listen(
      onResult: _onSpeechResult,
      onSoundLevelChange: (level) {
         // map sound level to a 0.0-1.0 range roughly
         double normalized = (level + 50) / 100;
         if (normalized < 0) normalized = 0;
         if (normalized > 1) normalized = 1;
         state = state.copyWith(volume: normalized);
      }
    );
  }

  void _onSpeechResult(SpeechRecognitionResult result) {
    state = state.copyWith(recognizedText: result.recognizedWords);
  }

  Future<void> stopListening() async {
    await _speechToText.stop();
    state = state.copyWith(isListening: false);
  }

  void _processCommand(String text) async {
    final lowerText = text.toLowerCase();
    String response = "I heard you say: $text";

    if (lowerText.contains('goal')) {
      response = "I can help you create a goal. What would you like to achieve?";
    } else if (lowerText.contains('habit')) {
      response = "Let's set up a new habit for you.";
    } else if (lowerText.contains('schedule')) {
      response = "Checking your calendar. What time works best?";
    } else if (lowerText.contains('summarize week')) {
      response = "You've had a highly productive week, completing 85 percent of your habits.";
    } else {
      // Mock LLM thinking time
      state = state.copyWith(responseText: "...");
      await Future.delayed(const Duration(seconds: 1));
      response = "That's an interesting thought. I'm adding it to your memory.";
    }

    state = state.copyWith(responseText: response);
    await speak(response);
  }

  Future<void> speak(String text) async {
    // We simulate volume during speaking using a ticker since TTS doesn't provide real-time audio levels easily
    // In a real prod environment, we'd use an audio visualizer plugin.
    _simulateSpeakingVolume();
    await _flutterTts.speak(text);
  }
  
  void _simulateSpeakingVolume() async {
    while(state.isSpeaking) {
      if (mounted) {
        state = state.copyWith(volume: 0.2 + (0.8 * (DateTime.now().millisecondsSinceEpoch % 1000) / 1000.0));
      }
      await Future.delayed(const Duration(milliseconds: 100));
    }
  }

  Future<void> stopSpeaking() async {
    await _flutterTts.stop();
  }
}
