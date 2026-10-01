import 'package:flutter/material.dart';
import 'core/constants/app_colors.dart';
import 'core/database/database_helper.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicialización de la persistencia local SQLite Offline-First
  await DatabaseHelper.instance.database;

  runApp(const CuscoSafeApp());
}

class CuscoSafeApp extends StatelessWidget {
  const CuscoSafeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CuscoSafe - EPG YUYARIY S.A.C.',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: AppColors.primaryBurgundy,
        scaffoldBackgroundColor: AppColors.surfaceLight,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryBurgundy,
          primary: AppColors.primaryBurgundy,
          secondary: AppColors.primaryIncaGold,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'CuscoSafe | EPG YUYARIY',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: AppColors.primaryBurgundy,
        elevation: 2,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.shield_outlined,
                size: 80,
                color: AppColors.primaryBurgundy,
              ),
              const SizedBox(height: 20),
              const Text(
                'CuscoSafe: Asistencia y Monitoreo Inteligente',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.darkStone,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Arquitectura Offline-First con persistencia local SQLite y sincronización asíncrona hacia Firebase Spark.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: AppColors.offlineGrey),
              ),
              const SizedBox(height: 40),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.sosEmergency,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(220, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  elevation: 6,
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Botón SOS presionado. Evento registrado localmente.'),
                      backgroundColor: AppColors.sosEmergency,
                    ),
                  );
                },
                icon: const Icon(Icons.warning_amber_rounded, size: 30),
                label: const Text(
                  'BOTÓN SOS',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
