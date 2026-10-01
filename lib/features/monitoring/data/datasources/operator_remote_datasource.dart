import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:latlong2/latlong.dart';
import '../../domain/entities/tourist_live_status.dart';

/// Fuente de datos remota para el panel del personal técnico de EPG YUYARIY S.A.C.
/// Escucha en tiempo real (WebSockets / Firestore Snapshot Stream) sin costos adicionales.
class OperatorRemoteDatasource {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Flujo continuo de alertas SOS activas
  Stream<List<Map<String, dynamic>>> getActiveSosAlertsStream() {
    return _firestore
        .collection('alerts')
        .where('status', isEqualTo: 'PENDING')
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['doc_id'] = doc.id;
        return data;
      }).toList();
    });
  }

  /// Flujo de las últimas posiciones emitidas por los turistas en el tour
  Stream<List<TouristLiveStatus>> getTouristsLiveStatusStream(String tourId) {
    return _firestore
        .collection('locations')
        .where('tour_id', isEqualTo: tourId)
        .orderBy('timestamp', descending: true)
        .limit(60)
        .snapshots()
        .map((snapshot) {
      final Map<String, TouristLiveStatus> latestPerUser = {};

      for (final doc in snapshot.docs) {
        final data = doc.data();
        final String userId = data['user_id'] ?? 'Desconocido';

        if (!latestPerUser.containsKey(userId)) {
          final double lat = (data['latitude'] as num?)?.toDouble() ?? -13.5160;
          final double lng = (data['longitude'] as num?)?.toDouble() ?? -71.9788;
          final DateTime timestamp = DateTime.tryParse(data['timestamp'] ?? '') ?? DateTime.now();

          latestPerUser[userId] = TouristLiveStatus(
            userId: userId,
            name: 'Turista $userId',
            position: LatLng(lat, lng),
            batteryLevel: 90,
            lastSeen: timestamp,
            state: TouristSafetyState.safe,
            statusMessage: 'En ruta nominal',
          );
        }
      }

      return latestPerUser.values.toList();
    });
  }

  /// Despacho de resolución de alerta SOS por parte del operador
  Future<void> resolveSosAlert(String alertDocId) async {
    await _firestore.collection('alerts').doc(alertDocId).update({
      'status': 'RESOLVED',
      'resolved_at': DateTime.now().toIso8601String(),
    });
  }
}
