import 'package:latlong2/latlong.dart';

/// Evaluador de Geocercado con Algoritmo de Ray-Casting (Punto en Polígono).
/// Módulo computacional para verificar si el turista se encuentra dentro del polígono seguro del tour.
class GeofenceEvaluator {
  /// Retorna `true` si el punto [point] está dentro del polígono delimitado por [polygon].
  static bool isPointInsidePolygon(LatLng point, List<LatLng> polygon) {
    if (polygon.length < 3) return false;

    bool inside = false;
    int j = polygon.length - 1;

    for (int i = 0; i < polygon.length; i++) {
      final double xi = polygon[i].latitude;
      final double yi = polygon[i].longitude;
      final double xj = polygon[j].latitude;
      final double yj = polygon[j].longitude;

      final bool intersect = ((yi > point.longitude) != (yj > point.longitude)) &&
          (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);

      if (intersect) {
        inside = !inside;
      }
      j = i;
    }

    return inside;
  }
}
