import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_colors.dart';
import 'core/database/database_helper.dart';
import 'features/tour_guide/presentation/screens/tourist_home_screen.dart';
import 'features/tracking/data/datasources/sync_dispatcher.dart';
import 'features/tracking/presentation/services/location_tracking_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Inicialización de la base de datos local SQLite (Offline-First)
  await DatabaseHelper.instance.database;

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LocationTrackingService()),
        ChangeNotifierProvider(create: (_) => SyncDispatcher()),
      ],
      child: const CuscoSafeApp(),
    ),
  );
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
      home: const TouristHomeScreen(),
    );
  }
}
