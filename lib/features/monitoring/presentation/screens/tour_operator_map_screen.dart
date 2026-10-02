import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/tour_coordinates.dart';
import '../../data/datasources/operator_remote_datasource.dart';
import '../../domain/entities/tourist_live_status.dart';

class TourOperatorMapScreen extends StatefulWidget {
  final String tourId;

  const TourOperatorMapScreen({
    super.key,
    this.tourId = 'TOUR_CITY_001',
  });

  @override
  State<TourOperatorMapScreen> createState() => _TourOperatorMapScreenState();
}

class _TourOperatorMapScreenState extends State<TourOperatorMapScreen> {
  final MapController _mapController = MapController();
  final OperatorRemoteDatasource _datasource = OperatorRemoteDatasource();

  // Lista simulada de contingencia para demostración académica
  final List<TouristLiveStatus> _demoTourists = [
    TouristLiveStatus(
      userId: 'TUR_01',
      name: 'John Miller (USA)',
      position: TourCoordinates.plazaDeArmas,
      batteryLevel: 78,
      lastSeen: DateTime.now().subtract(const Duration(minutes: 1)),
      state: TouristSafetyState.safe,
      statusMessage: 'En ruta nominal',
    ),
    TouristLiveStatus(
      userId: 'TUR_02',
      name: 'Elena Rostova (Alemania)',
      position: const LatLng(-13.5208, -71.9750), // Cerca a Qoricancha
      batteryLevel: 62,
      lastSeen: DateTime.now().subtract(const Duration(minutes: 11)),
      state: TouristSafetyState.warning,
      statusMessage: 'Inmovilidad anómala (>10 min en Calle Zetas)',
    ),
    TouristLiveStatus(
      userId: 'TUR_03',
      name: 'Carlos Mendoza (Lima)',
      position: const LatLng(-13.5180, -71.9840), // Cerca a San Pedro
      batteryLevel: 45,
      lastSeen: DateTime.now(),
      state: TouristSafetyState.safe,
      statusMessage: 'En ruta nominal',
    ),
  ];

  @override
  Widget build(BuildContext context) {
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
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Centro de Control YUYARIY',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.white),
            ),
            Text(
              'Monitoreo en Tiempo Real · City Tour Cusco VR',
              style: TextStyle(fontSize: 11.5, color: AppColors.primaryIncaGold, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        backgroundColor: AppColors.corporateSlate,
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location, color: Colors.white),
            tooltip: 'Centrar en Centro Histórico',
            onPressed: () {
              _mapController.move(TourCoordinates.plazaDeArmas, 15.0);
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. Mapa interactivo OpenStreetMap
          Positioned.fill(
            child: FlutterMap(
              mapController: _mapController,
              options: const MapOptions(
                initialCenter: TourCoordinates.plazaDeArmas,
                initialZoom: 15.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.yuyariy.cuscosafe.app',
                  maxZoom: 19,
                ),
                // Perímetro del City Tour
                PolygonLayer(
                  polygons: [
                    Polygon(
                      points: TourCoordinates.cityTourSafePolygon,
                      color: AppColors.primaryIncaGold.withOpacity(0.15),
                      borderColor: AppColors.primaryIncaGold,
                      borderStrokeWidth: 2,
                      isFilled: true,
                    ),
                  ],
                ),
                // Marcadores de Hitos Turísticos
                MarkerLayer(
                  markers: [
                    _buildHitoMarker(TourCoordinates.qoricancha, 'Qoricancha', Icons.temple_buddhist),
                    _buildHitoMarker(TourCoordinates.plazaDeArmas, 'Plaza de Armas', Icons.account_balance),
                    _buildHitoMarker(TourCoordinates.mercadoSanPedro, 'San Pedro', Icons.storefront),
                    _buildHitoMarker(TourCoordinates.sacsayhuaman, 'Sacsayhuamán', Icons.terrain),
                    _buildHitoMarker(TourCoordinates.yuyariyOffice, 'YUYARIY S.A.C.', Icons.vrpano, color: AppColors.primaryIncaGold),
                  ],
                ),
                // Marcadores de Turistas en vivo
                MarkerLayer(
                  markers: _demoTourists.map((t) => _buildTouristMarker(t)).toList(),
                ),
              ],
            ),
          ),

          // 2. HUD Superior de Métricas Operativas
          Positioned(
            top: 14,
            left: 14,
            right: 14,
            child: _buildMetricsHUD(),
          ),

          // 3. Panel Inferior Desplegable con Detalle de Turistas
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildTouristListSheet(),
          ),
        ],
      ),
    );
  }

  Marker _buildHitoMarker(LatLng pos, String label, IconData icon, {Color color = AppColors.darkStone}) {
    return Marker(
      point: pos,
      width: 80,
      height: 60,
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
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Marker _buildTouristMarker(TouristLiveStatus tourist) {
    Color markerColor;
    switch (tourist.state) {
      case TouristSafetyState.sosAlert:
        markerColor = AppColors.sosEmergency;
        break;
      case TouristSafetyState.warning:
        markerColor = AppColors.statusWarning;
        break;
      case TouristSafetyState.safe:
      default:
        markerColor = AppColors.statusSafe;
        break;
    }

    return Marker(
      point: tourist.position,
      width: 48,
      height: 48,
      child: GestureDetector(
        onTap: () => _showTouristDetailDialog(tourist),
        child: Container(
          decoration: BoxDecoration(
            color: markerColor,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: const [
              BoxShadow(color: Colors.black38, blurRadius: 6, offset: Offset(0, 2)),
            ],
          ),
          child: const Icon(Icons.person, color: Colors.white, size: 24),
        ),
      ),
    );
  }

  Widget _buildMetricsHUD() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.darkStone.withOpacity(0.94),
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 6)],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildMetricItem('En Ruta', '${_demoTourists.length}', AppColors.primaryIncaGold),
          _buildMetricItem('Nominales', '2', AppColors.statusSafe),
          _buildMetricItem('Anomalías', '1', AppColors.statusWarning),
          _buildMetricItem('SOS', '0', AppColors.sosEmergency),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _buildTouristListSheet() {
    return Container(
      height: 190,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -3))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Turistas Monitoreados',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                Text(
                  '${_demoTourists.length} participantes',
                  style: const TextStyle(fontSize: 12, color: AppColors.offlineGrey),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _demoTourists.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (ctx, index) {
                final t = _demoTourists[index];
                return ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: t.state == TouristSafetyState.warning
                        ? AppColors.statusWarning.withOpacity(0.2)
                        : AppColors.statusSafe.withOpacity(0.2),
                    child: Icon(
                      Icons.person,
                      color: t.state == TouristSafetyState.warning
                          ? AppColors.statusWarning
                          : AppColors.statusSafe,
                      size: 20,
                    ),
                  ),
                  title: Text(t.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text(t.statusMessage, style: const TextStyle(fontSize: 11)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.battery_std, size: 16, color: Colors.grey.shade600),
                      Text('${t.batteryLevel}%', style: const TextStyle(fontSize: 11)),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.gps_fixed, size: 18, color: AppColors.primaryBurgundy),
                        onPressed: () {
                          _mapController.move(t.position, 16.5);
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showTouristDetailDialog(TouristLiveStatus tourist) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(tourist.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID Turista: ${tourist.userId}'),
            const SizedBox(height: 6),
            Text('Estado: ${tourist.statusMessage}'),
            const SizedBox(height: 6),
            Text('Batería: ${tourist.batteryLevel}%'),
            const SizedBox(height: 6),
            Text('Última señal: Hace ${DateTime.now().difference(tourist.lastSeen).inMinutes} min'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cerrar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBurgundy,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _mapController.move(tourist.position, 17.0);
            },
            child: const Text('Localizar en Mapa'),
          ),
        ],
      ),
    );
  }
}
