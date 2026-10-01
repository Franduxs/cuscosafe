import '../../domain/entities/location_point.dart';

class LocationPointModel extends LocationPoint {
  const LocationPointModel({
    super.id,
    required super.tourId,
    required super.userId,
    required super.latitude,
    required super.longitude,
    required super.accuracy,
    required super.speed,
    required super.timestamp,
    super.isSynced = false,
  });

  /// Conversión desde registro de SQLite
  factory LocationPointModel.fromMap(Map<String, dynamic> map) {
    return LocationPointModel(
      id: map['id'] as int?,
      tourId: map['tour_id'] as String,
      userId: map['user_id'] as String,
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      accuracy: (map['accuracy'] as num).toDouble(),
      speed: (map['speed'] as num).toDouble(),
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp'] as int),
      isSynced: (map['is_synced'] as int) == 1,
    );
  }

  /// Conversión a Map para almacenamiento local en SQLite
  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'tour_id': tourId,
      'user_id': userId,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'speed': speed,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'is_synced': isSynced ? 1 : 0,
    };
  }

  /// Conversión de payload para Cloud Firestore (NoSQL)
  Map<String, dynamic> toFirestore() {
    return {
      'tour_id': tourId,
      'user_id': userId,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'speed': speed,
      'timestamp': timestamp.toIso8601String(),
      'synced_at': DateTime.now().toIso8601String(),
    };
  }
}
