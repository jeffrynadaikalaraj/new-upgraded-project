import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ─── Core Palette (matches Tailwind slate) ───────────────────────
  static const Color scaffoldBackground = Color(0xFF0f172a); // slate-900
  static const Color cardColor = Color(0xFF1e293b);           // slate-800
  static const Color cardColorTranslucent = Color(0x801e293b); // slate-800/50
  static const Color borderColor = Color(0xFF334155);          // slate-700
  static const Color borderColorSubtle = Color(0x80334155);    // slate-700/50
  static const Color primaryText = Color(0xFFf1f5f9);          // slate-100
  static const Color secondaryText = Color(0xFF94a3b8);        // slate-400
  static const Color mutedText = Color(0xFF64748b);            // slate-500

  // ─── Accent Colors ───────────────────────────────────────────────
  static const Color accentIndigo = Color(0xFF818cf8);    // indigo-400
  static const Color indigo500 = Color(0xFF6366f1);       // indigo-500
  static const Color emerald400 = Color(0xFF34d399);      // emerald-400
  static const Color emerald500 = Color(0xFF10b981);      // emerald-500
  static const Color orange400 = Color(0xFFfb923c);       // orange-400
  static const Color orange500 = Color(0xFFf97316);       // orange-500
  static const Color purple400 = Color(0xFFc084fc);       // purple-400
  static const Color purple500 = Color(0xFFa855f7);       // purple-500
  static const Color violet400 = Color(0xFFa78bfa);       // violet-400
  static const Color violet500 = Color(0xFF8b5cf6);       // violet-500
  static const Color blue400 = Color(0xFF60a5fa);         // blue-400
  static const Color blue500 = Color(0xFF3b82f6);         // blue-500
  static const Color rose400 = Color(0xFFfb7185);         // rose-400
  static const Color rose500 = Color(0xFFf43f5e);         // rose-500
  static const Color cyan400 = Color(0xFF22d3ee);         // cyan-400
  static const Color cyan500 = Color(0xFF06b6d4);         // cyan-500
  static const Color sky400 = Color(0xFF38bdf8);          // sky-400
  static const Color pink400 = Color(0xFFf472b6);         // pink-400
  static const Color amber400 = Color(0xFFfbbf24);        // amber-400
  static const Color amber500 = Color(0xFFf59e0b);        // amber-500

  // ─── Gradients ───────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [cyan500, indigo500, purple500],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [accentIndigo, purple400],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient buttonGradient = LinearGradient(
    colors: [indigo500, violet500, purple500],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // ─── Glassmorphism Decorations ───────────────────────────────────
  static BoxDecoration get glassCard => BoxDecoration(
    color: cardColorTranslucent,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: borderColorSubtle),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.2),
        blurRadius: 20,
        offset: const Offset(0, 8),
      ),
    ],
  );

  static BoxDecoration get glassCardStrong => BoxDecoration(
    color: const Color(0xE61e293b), // slate-800/90
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: const Color(0x26ffffff)), // white/15
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.3),
        blurRadius: 24,
        offset: const Offset(0, 10),
      ),
    ],
  );

  // ─── Theme Data ──────────────────────────────────────────────────
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: scaffoldBackground,
      colorScheme: const ColorScheme.dark(
        primary: accentIndigo,
        secondary: purple400,
        surface: cardColor,
        onPrimary: Colors.white,
        onSurface: primaryText,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        headlineLarge: const TextStyle(color: primaryText, fontWeight: FontWeight.bold),
        headlineMedium: const TextStyle(color: primaryText, fontWeight: FontWeight.bold),
        headlineSmall: const TextStyle(color: primaryText, fontWeight: FontWeight.bold),
        titleLarge: const TextStyle(color: primaryText, fontWeight: FontWeight.w600),
        titleMedium: const TextStyle(color: primaryText, fontWeight: FontWeight.w600),
        bodyLarge: const TextStyle(color: primaryText),
        bodyMedium: const TextStyle(color: primaryText),
        bodySmall: const TextStyle(color: secondaryText),
        labelLarge: const TextStyle(color: secondaryText),
        labelMedium: const TextStyle(color: secondaryText),
        labelSmall: const TextStyle(color: mutedText),
      ),
      cardTheme: CardThemeData(
        color: cardColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: borderColorSubtle),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accentIndigo, width: 2),
        ),
        hintStyle: const TextStyle(color: mutedText),
        labelStyle: const TextStyle(color: secondaryText),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: scaffoldBackground,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: primaryText,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
        ),
      ),
    );
  }
}
