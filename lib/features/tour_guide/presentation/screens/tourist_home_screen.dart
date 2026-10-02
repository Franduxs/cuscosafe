import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import '../../../../core/ai/heuristic_anomaly_detector.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/tour_coordinates.dart';
import '../../../emergency/presentation/widgets/sos_one_touch_button.dart';
import '../../../tracking/data/datasources/sync_dispatcher.dart';
import '../../../tracking/presentation/services/location_tracking_service.dart';

class TouristHomeScreen extends StatefulWidget {
  final String tourId;
  final String userId;
  final String touristName;

  const TouristHomeScreen({
    super.key,
    this.tourId = 'TOUR_CITY_001',
    this.userId = 'TURISTA_DEMO_01',
    this.touristName = 'Turista Invitado',
  });

  @override
  State<TouristHomeScreen> createState() => _TouristHomeScreenState();
}

class _TouristHomeScreenState extends State<TouristHomeScreen> {
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Iniciar el rastreo automático y el despachador al cargar la vista
      context.read<LocationTrackingService>().startTracking(
            tourId: widget.tourId,
            userId: widget.userId,
          );
      context.read<SyncDispatcher>().initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final trackingService = context.watch<LocationTrackingService>();
    final syncDispatcher = context.watch<SyncDispatcher>();

    final LatLng currentLatLng = trackingService.currentPosition != null
        ? LatLng(
            trackingService.currentPosition!.latitude,
            trackingService.currentPosition!.longitude,
          )
        : TourCoordinates.plazaDeArmas;

    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(
              'assets/icons/icon-192.png',
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Icon(Icons.shield, color: Colors.white),
            ),
          ),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'CuscoSafe · City Tour',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white),
            ),
            Text(
              'EPG YUYARIY S.A.C. · ${widget.touristName}',
              style: const TextStyle(fontSize: 11.5, color: AppColors.primaryIncaGold, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        backgroundColor: AppColors.corporateSlate,
        actions: [
          IconButton(
            icon: Icon(
              syncDispatcher.isOnline ? Icons.cloud_done : Icons.cloud_off,
              color: syncDispatcher.isOnline ? Colors.white : AppColors.statusWarning,
            ),
            tooltip: syncDispatcher.isOnline ? 'Conectado a la nube' : 'Modo Offline (Store & Forward)',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    syncDispatcher.isOnline
                        ? 'En línea. Todos los datos están sincronizados con la agencia.'
                        : 'Sin señal de datos. ${syncDispatcher.pendingLocationsCount} puntos guardados en SQLite.',
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. Mapa Gratuito OpenStreetMap (Sustituto de Google Maps API)
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: currentLatLng,
                initialZoom: 15.5,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.yuyariy.cuscosafe.app',
                  maxZoom: 19,
                ),
                // Polígono de Geocercado Seguro del City Tour
                PolygonLayer(
                  polygons: [
                    Polygon(
                      points: TourCoordinates.cityTourSafePolygon,
                      color: AppColors.primaryIncaGold.withOpacity(0.18),
                      borderColor: AppColors.primaryIncaGold,
                      borderStrokeWidth: 2.5,
                      isFilled: true,
                    ),
                  ],
                ),
                // Marcadores de Hitos del Tour y Posición del Turista
                MarkerLayer(
                  markers: [
                    // Hitos del Tour
                    _buildLandmarkMarker(TourCoordinates.qoricancha, 'Qoricancha', Icons.temple_buddhist),
                    _buildLandmarkMarker(TourCoordinates.plazaDeArmas, 'Plaza de Armas', Icons.account_balance),
                    _buildLandmarkMarker(TourCoordinates.mercadoSanPedro, 'San Pedro', Icons.storefront),
                    _buildLandmarkMarker(TourCoordinates.sacsayhuaman, 'Sacsayhuamán', Icons.terrain),
                    _buildLandmarkMarker(TourCoordinates.yuyariyOffice, 'YUYARIY VR', Icons.vrpano, color: AppColors.primaryIncaGold),

                    // Marcador de la posición actual del turista
                    Marker(
                      point: currentLatLng,
                      width: 50,
                      height: 50,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.primaryBurgundy,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: const [
                            BoxShadow(color: Colors.black26, blurRadius: 6),
                          ],
                        ),
                        child: const Icon(Icons.person_pin, color: Colors.white, size: 28),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Banner Superior: Diagnóstico Heurístico de IA
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: _buildAnomalyBanner(trackingService.lastAnomaly),
          ),

          // 3. Indicador Flotante de Modo Offline
          if (!syncDispatcher.isOnline)
            Positioned(
              bottom: 170,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.darkStone.withOpacity(0.92),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.storage, color: AppColors.primaryIncaGold, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Modo Offline: ${syncDispatcher.pendingLocationsCount} posiciones en SQLite',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),

          // 4. Botón SOS Flotante (One-Touch)
          Positioned(
            bottom: 24,
            left: 0,
            right: 0,
            child: Center(
              child: SosOneTouchButton(
                tourId: widget.tourId,
                userId: widget.userId,
                onAlertTriggered: () {
                  syncDispatcher.syncPendingData();
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnomalyBanner(AnomalyResult anomaly) {
    Color bannerColor;
    IconData bannerIcon;

    switch (anomaly.type) {
      case AnomalyType.outOfBounds:
        bannerColor = AppColors.sosEmergency;
        bannerIcon = Icons.warning_rounded;
        break;
      case AnomalyType.prolongedStop:
        bannerColor = AppColors.statusWarning;
        bannerIcon = Icons.timer_outlined;
        break;
      case AnomalyType.none:
      default:
        bannerColor = AppColors.statusSafe;
        bannerIcon = Icons.check_circle_outline;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bannerColor,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          Icon(bannerIcon, color: Colors.white, size: 24),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              anomaly.message,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Marker _buildLandmarkMarker(LatLng pos, String label, IconData icon, {Color color = AppColors.darkStone}) {
    return Marker(
      point: pos,
      width: 75,
      height: 52,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: const [BoxShadow(color: Colors.black38, blurRadius: 4)],
            ),
            child: Icon(icon, color: Colors.white, size: 16),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              label,
              style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Colors.black87),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
