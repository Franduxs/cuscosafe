import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

/// DatabaseHelper implementa el patrón Singleton para la base de datos local SQLite.
/// Soporta la arquitectura Offline-First (Store & Forward) para operar en los cañones
/// urbanos de piedra del Centro Histórico de Cusco donde la señal 4G/datos es discontinua.
class DatabaseHelper {
  static const String _dbName = 'cuscosafe_local.db';
  static const int _dbVersion = 1;

  // Nombres de Tablas
  static const String tableLocations = 'offline_locations';
  static const String tableSosEvents = 'sos_events';

  DatabaseHelper._internal();
  static final DatabaseHelper instance = DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final String dbPath = await getDatabasesPath();
    final String path = join(dbPath, _dbName);

    return await openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // 1. Tabla de Ubicaciones Offline del Turista
    await db.execute('''
      CREATE TABLE $tableLocations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL NOT NULL,
        speed REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // 2. Tabla de Eventos Críticos de Emergencia (Botón SOS)
    await db.execute('''
      CREATE TABLE $tableSosEvents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tour_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        battery_level INTEGER,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL, -- PENDING, ACKNOWLEDGED, RESOLVED
        is_synced INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // Índices B-Tree para optimizar las consultas asíncronas de Store & Forward
    await db.execute(
      'CREATE INDEX idx_locations_sync ON $tableLocations (is_synced);',
    );
    await db.execute(
      'CREATE INDEX idx_sos_sync ON $tableSosEvents (is_synced);',
    );
  }

  // ==========================================
  // OPERACIONES CRUD: POSICIONES GPS
  // ==========================================

  /// Inserta una nueva lectura de ubicación capturada en segundo plano
  Future<int> insertLocation(Map<String, dynamic> locationData) async {
    final Database db = await database;
    return await db.insert(
      tableLocations,
      locationData,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Retorna puntos pendientes de sincronización hacia Firebase
  Future<List<Map<String, dynamic>>> getUnsyncedLocations({int limit = 50}) async {
    final Database db = await database;
    return await db.query(
      tableLocations,
      where: 'is_synced = ?',
      whereArgs: [0],
      orderBy: 'timestamp ASC',
      limit: limit,
    );
  }

  /// Marca registros como sincronizados después de transmitirlos con éxito a Firestore
  Future<int> markLocationsAsSynced(List<int> ids) async {
    if (ids.isEmpty) return 0;
    final Database db = await database;
    return await db.update(
      tableLocations,
      {'is_synced': 1},
      where: 'id IN (${ids.join(',')})',
    );
  }

  /// Depuración preventiva de datos antiguos ya sincronizados (>48 horas) para liberar memoria
  Future<int> purgeOldSyncedLocations(int olderThanTimestamp) async {
    final Database db = await database;
    return await db.delete(
      tableLocations,
      where: 'is_synced = 1 AND timestamp < ?',
      whereArgs: [olderThanTimestamp],
    );
  }

  // ==========================================
  // OPERACIONES CRUD: EVENTOS SOS
  // ==========================================

  /// Registra el evento SOS inmediatamente de forma local
  Future<int> insertSosEvent(Map<String, dynamic> sosData) async {
    final Database db = await database;
    return await db.insert(
      tableSosEvents,
      sosData,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Retorna eventos SOS pendientes de envío
  Future<List<Map<String, dynamic>>> getUnsyncedSosEvents() async {
    final Database db = await database;
    return await db.query(
      tableSosEvents,
      where: 'is_synced = ?',
      whereArgs: [0],
      orderBy: 'timestamp ASC',
    );
  }

  /// Marca un evento SOS como sincronizado
  Future<int> markSosEventAsSynced(int id) async {
    final Database db = await database;
    return await db.update(
      tableSosEvents,
      {'is_synced': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Cierre de la conexión
  Future<void> close() async {
    final Database? db = _database;
    if (db != null && db.isOpen) {
      await db.close();
      _database = null;
    }
  }
}
