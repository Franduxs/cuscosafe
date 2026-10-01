import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import '../../../../core/database/database_helper.dart';
import '../../../emergency/data/models/sos_alert_model.dart';
import '../models/location_point_model.dart';

/// Despachador Store & Forward para sincronizar datos locales (SQLite) con Firebase Spark.
/// Se activa automáticamente al recuperar conectividad de red tras cruzar cañones urbanos en Cusco.
class SyncDispatcher with ChangeNotifier {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Connectivity _connectivity = Connectivity();

  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  bool _isOnline = false;
  bool _isSyncing = false;
  int _pendingLocationsCount = 0;
  DateTime? _lastSyncTime;

  bool get isOnline => _isOnline;
  bool get isSyncing => _isSyncing;
  int get pendingLocationsCount => _pendingLocationsCount;
  DateTime? get lastSyncTime => _lastSyncTime;

  void initialize() {
    _checkInitialConnectivity();
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((results) {
      final bool hasNet = results.any((r) => r != ConnectivityResult.none);
      _isOnline = hasNet;
      notifyListeners();

      if (_isOnline) {
        syncPendingData();
      }
    });

    _refreshPendingCount();
  }

  Future<void> _checkInitialConnectivity() async {
    final results = await _connectivity.checkConnectivity();
    _isOnline = results.any((r) => r != ConnectivityResult.none);
    notifyListeners();

    if (_isOnline) {
      syncPendingData();
    }
  }

  Future<void> _refreshPendingCount() async {
    final unsynced = await _dbHelper.getUnsyncedLocations(limit: 500);
    _pendingLocationsCount = unsynced.length;
    notifyListeners();
  }

  /// Ejecuta el proceso de sincronización por lotes hacia Cloud Firestore
  Future<void> syncPendingData() async {
    if (_isSyncing || !_isOnline) return;

    _isSyncing = true;
    notifyListeners();

    try {
      // 1. PRIORIDAD MÁXIMA: Sincronizar Alertas SOS pendientes
      final unsyncedSos = await _dbHelper.getUnsyncedSosEvents();
      for (final item in unsyncedSos) {
        final sosModel = SosAlertModel.fromMap(item);
        await _firestore.collection('alerts').add(sosModel.toFirestore());
        if (sosModel.id != null) {
          await _dbHelper.markSosEventAsSynced(sosModel.id!);
        }
      }

      // 2. Sincronizar Historial de Coordenadas GPS (Batch Store & Forward)
      final unsyncedPoints = await _dbHelper.getUnsyncedLocations(limit: 50);
      if (unsyncedPoints.isNotEmpty) {
        final WriteBatch batch = _firestore.batch();
        final List<int> syncedIds = [];

        for (final raw in unsyncedPoints) {
          final point = LocationPointModel.fromMap(raw);
          final docRef = _firestore.collection('locations').doc();
          batch.set(docRef, point.toFirestore());
          if (point.id != null) {
            syncedIds.add(point.id!);
          }
        }

        await batch.commit();
        await _dbHelper.markLocationsAsSynced(syncedIds);
        _lastSyncTime = DateTime.now();
      }
    } catch (e) {
      debugPrint('[Store & Forward Sync Error]: $e');
    } finally {
      _isSyncing = false;
      await _refreshPendingCount();
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}
