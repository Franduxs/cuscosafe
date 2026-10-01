import '../../domain/entities/sos_alert.dart';

class SosAlertModel extends SosAlert {
  const SosAlertModel({
    super.id,
    required super.tourId,
    required super.userId,
    required super.latitude,
    required super.longitude,
    required super.batteryLevel,
    required super.timestamp,
    super.status = 'PENDING',
    super.isSynced = false,
  });

  factory SosAlertModel.fromMap(Map<String, dynamic> map) {
    return SosAlertModel(
      id: map['id'] as int?,
      tourId: map['tour_id'] as String,
      userId: map['user_id'] as String,
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      batteryLevel: map['battery_level'] as int? ?? 100,
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp'] as int),
      status: map['status'] as String? ?? 'PENDING',
      isSynced: (map['is_synced'] as int) == 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'tour_id': tourId,
      'user_id': userId,
      'latitude': latitude,
      'longitude': longitude,
      'battery_level': batteryLevel,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'status': status,
      'is_synced': isSynced ? 1 : 0,
    };
  }

  Map<String, dynamic> toFirestore() {
    return {
      'tour_id': tourId,
      'user_id': userId,
      'latitude': latitude,
      'longitude': longitude,
      'battery_level': batteryLevel,
      'timestamp': timestamp.toIso8601String(),
      'status': status,
      'created_at': DateTime.now().toIso8601String(),
    };
  }
}
