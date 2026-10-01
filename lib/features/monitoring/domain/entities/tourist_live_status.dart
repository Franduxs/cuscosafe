import 'package:latlong2/latlong.dart';

enum TouristSafetyState {
  safe,
  warning, // Detenido > 10 min o cerca del límite
  sosAlert, // Botón de pánico accionado
}

class TouristLiveStatus {
  final String userId;
  final String name;
  final LatLng position;
  final int batteryLevel;
  final DateTime lastSeen;
  final TouristSafetyState state;
  final String statusMessage;

  const TouristLiveStatus({
    required this.userId,
    required this.name,
    required this.position,
    required this.batteryLevel,
    required this.lastSeen,
    required this.state,
    required this.statusMessage,
  });
}
