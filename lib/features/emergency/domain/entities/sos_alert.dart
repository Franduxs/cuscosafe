class SosAlert {
  final int? id;
  final String tourId;
  final String userId;
  final double latitude;
  final double longitude;
  final int batteryLevel;
  final DateTime timestamp;
  final String status; // 'PENDING', 'ACKNOWLEDGED', 'RESOLVED'
  final bool isSynced;

  const SosAlert({
    this.id,
    required this.tourId,
    required this.userId,
    required this.latitude,
    required this.longitude,
    required this.batteryLevel,
    required this.timestamp,
    this.status = 'PENDING',
    this.isSynced = false,
  });
}
