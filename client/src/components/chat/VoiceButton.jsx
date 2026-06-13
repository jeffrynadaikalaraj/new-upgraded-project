import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceButton = ({ onTranscript, isGenerating }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript, true); // final
        } else if (interimTranscript) {
          onTranscript(interimTranscript, false); // interim
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.error("Microphone start error:", err);
        }
      } else {
        alert("Your browser does not support Speech Recognition.");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={isGenerating}
      className={`absolute right-12 bottom-2.5 p-2 rounded-lg transition-colors ${
        isListening 
          ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' 
          : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Mic className="w-5 h-5" />
        </motion.div>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
};

export default VoiceButton;
