import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Colors based on React Tailwind theme
  static const Color scaffoldBackground = Color(0xFF0f172a); // slate-900
  static const Color cardColor = Color(0xFF1e293b); // slate-800
  static const Color borderColor = Color(0xFF334155); // slate-700
  static const Color primaryText = Color(0xFFf1f5f9); // slate-100
  static const Color secondaryText = Color(0xFF94a3b8); // slate-400
  static const Color accentColor = Color(0xFF818cf8); // indigo-400

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: scaffoldBackground,
      colorScheme: const ColorScheme.dark(
        primary: accentColor,
        surface: cardColor,
        onPrimary: Colors.white,
        onSurface: primaryText,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        bodyLarge: const TextStyle(color: primaryText),
        bodyMedium: const TextStyle(color: primaryText),
        labelLarge: const TextStyle(color: secondaryText),
      ),
      cardTheme: CardTheme(
        color: cardColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: borderColor, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scaffoldBackground,
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
          borderSide: const BorderSide(color: accentColor),
        ),
        hintStyle: const TextStyle(color: secondaryText),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: scaffoldBackground,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}
