import 'package:latlong2/latlong.dart';
import 'geofence_evaluator.dart';

enum AnomalyType {
  none,
  prolongedStop,      // Detenido más de 10 minutos fuera de paradas programadas
  outOfBounds,        // Salió del polígono seguro del City Tour
}

class AnomalyResult {
  final AnomalyType type;
  final String message;
  final DateTime detectedAt;

  AnomalyResult({
    required this.type,
    required this.message,
    required this.detectedAt,
  });

  bool get hasAnomaly => type != AnomalyType.none;
}

/// Módulo de Detección Heurística de Anomalías de Movimiento.
/// Requisito del componente de Inteligencia Artificial para el proyecto de titulación SENATI.
class HeuristicAnomalyDetector {
  static const int staticThresholdMinutes = 10;
  static const double movementThresholdMeters = 15.0; // Umbral de radio de ruido GPS

  DateTime? _lastMovementTime;
  LatLng? _lastRecordedPosition;

  final Distance _distanceCalculator = const Distance();

  /// Evalúa la posición actual frente a los polígonos del tour y el historial inmediato de movimiento.
  AnomalyResult evaluatePosition({
    required LatLng currentPosition,
    required List<LatLng> safePolygon,
    required DateTime currentTimestamp,
    bool isScheduledStop = false, // Parada guiada programada (ej. dentro del templo Qoricancha)
  }) {
    // 1. Detección de salida de perímetro seguro (Geofence Out of Bounds)
    final bool isInside = GeofenceEvaluator.isPointInsidePolygon(
      currentPosition,
      safePolygon,
    );

    if (!isInside) {
      return AnomalyResult(
        type: AnomalyType.outOfBounds,
        message: 'Turista fuera del perímetro delimitado del City Tour.',
        detectedAt: currentTimestamp,
      );
    }

    // 2. Detección heurística de estancamiento / inmovilidad prolongada
    if (_lastRecordedPosition == null || _lastMovementTime == null) {
      _lastRecordedPosition = currentPosition;
      _lastMovementTime = currentTimestamp;
      return AnomalyResult(
        type: AnomalyType.none,
        message: 'Rastreo inicializado.',
        detectedAt: currentTimestamp,
      );
    }

    final double deltaDistance = _distanceCalculator.as(
      LengthUnit.Meter,
      _lastRecordedPosition!,
      currentPosition,
    );

    if (deltaDistance > movementThresholdMeters) {
      // El turista se está desplazando activamente
      _lastRecordedPosition = currentPosition;
      _lastMovementTime = currentTimestamp;
    } else {
      // El turista permanece en el mismo radio
      final Duration stationaryDuration = currentTimestamp.difference(_lastMovementTime!);
      if (!isScheduledStop && stationaryDuration.inMinutes >= staticThresholdMinutes) {
        return AnomalyResult(
          type: AnomalyType.prolongedStop,
          message: 'Inmovilidad anómala: Turista detenido por más de ${stationaryDuration.inMinutes} minutos.',
          detectedAt: currentTimestamp,
        );
      }
    }

    return AnomalyResult(
      type: AnomalyType.none,
      message: 'Comportamiento de desplazamiento nominal.',
      detectedAt: currentTimestamp,
    );
  }

  void reset() {
    _lastMovementTime = null;
    _lastRecordedPosition = null;
  }
}
