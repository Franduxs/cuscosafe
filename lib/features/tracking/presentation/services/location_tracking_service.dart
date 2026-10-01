import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/ai/heuristic_anomaly_detector.dart';
import '../../../../core/constants/tour_coordinates.dart';
import '../../../../core/database/database_helper.dart';
import '../../data/models/location_point_model.dart';

/// Servicio de captura continua de GPS en primer y segundo plano.
/// Optimizado para el recorrido a pie del City Tour de EPG YUYARIY S.A.C.
/// Aplica un filtro de distancia de 10 metros para reducir el drenado de batería del turista.
class LocationTrackingService with ChangeNotifier {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;
  final HeuristicAnomalyDetector _anomalyDetector = HeuristicAnomalyDetector();

  StreamSubscription<Position>? _positionStreamSubscription;

  bool _isTracking = false;
  Position? _currentPosition;
  AnomalyResult _lastAnomaly = AnomalyResult(
    type: AnomalyType.none,
    message: 'Sistema listo para iniciar tour.',
    detectedAt: DateTime.now(),
  );

  bool get isTracking => _isTracking;
  Position? get currentPosition => _currentPosition;
  AnomalyResult get lastAnomaly => _lastAnomaly;

  /// Inicia el rastreo con verificación estricta de permisos de Android/iOS
  Future<bool> startTracking({
    required String tourId,
    required String userId,
  }) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    _isTracking = true;
    notifyListeners();

    // Configuración de precisión y ahorro energético:
    // distanceFilter: 10 evita que el chip GPS despierte continuamente si el turista está parado
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10,
    );

    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen(
      (Position position) async {
        _currentPosition = position;

        final LatLng currentLatLng = LatLng(position.latitude, position.longitude);
        final DateTime now = DateTime.now();

        // 1. Persistencia Inmediata Offline en SQLite (Store & Forward)
        final pointModel = LocationPointModel(
          tourId: tourId,
          userId: userId,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          speed: position.speed,
          timestamp: now,
        );

        await _dbHelper.insertLocation(pointModel.toMap());

        // 2. Evaluación Heurística con Inteligencia Artificial (Requisito SENATI)
        _lastAnomaly = _anomalyDetector.evaluatePosition(
          currentPosition: currentLatLng,
          safePolygon: TourCoordinates.cityTourSafePolygon,
          currentTimestamp: now,
        );

        notifyListeners();
      },
      onError: (error) {
        debugPrint('[GPS Tracking Error]: $error');
      },
    );

    return true;
  }

  /// Detiene el rastreo y libera recursos del hardware GPS
  Future<void> stopTracking() async {
    await _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _isTracking = false;
    _anomalyDetector.reset();
    notifyListeners();
  }

  @override
  void dispose() {
    stopTracking();
    super.dispose();
  }
}
