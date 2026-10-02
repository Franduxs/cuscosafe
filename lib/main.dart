import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_colors.dart';
import 'core/database/database_helper.dart';
import 'features/monitoring/presentation/screens/tour_operator_map_screen.dart';
import 'features/tour_guide/presentation/screens/tourist_home_screen.dart';
import 'features/tracking/data/datasources/sync_dispatcher.dart';
import 'features/tracking/presentation/services/location_tracking_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicialización de SQLite local
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

class CuscoSafeApp extends StatefulWidget {
  const CuscoSafeApp({super.key});

  @override
  State<CuscoSafeApp> createState() => _CuscoSafeAppState();
}

class _CuscoSafeAppState extends State<CuscoSafeApp> {
  int _currentRoleIndex = 0;

  final List<Widget> _views = const [
    TouristHomeScreen(),
    TourOperatorMapScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CuscoSafe - EPG YUYARIY S.A.C.',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: AppColors.primaryTerracotta,
        scaffoldBackgroundColor: AppColors.surfaceLight,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryTerracotta,
          primary: AppColors.corporateSlate,
          secondary: AppColors.primaryIncaGold,
        ),
      ),
      home: Scaffold(
        body: _views[_currentRoleIndex],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentRoleIndex,
          onTap: (index) => setState(() => _currentRoleIndex = index),
          selectedItemColor: AppColors.primaryTerracotta,
          unselectedItemColor: AppColors.offlineGrey,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.person_pin_circle),
              label: 'Modo Turista',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_customize_outlined),
              label: 'Control YUYARIY',
            ),
          ],
        ),
      ),
    );
  }
}
