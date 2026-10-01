class LocationPoint {
  final int? id;
  final String tourId;
  final String userId;
  final double latitude;
  final double longitude;
  final double accuracy;
  final double speed;
  final DateTime timestamp;
  final bool isSynced;

  const LocationPoint({
    this.id,
    required this.tourId,
    required this.userId,
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.speed,
    required this.timestamp,
    this.isSynced = false,
  });
}
