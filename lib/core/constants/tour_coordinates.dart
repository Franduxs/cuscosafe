import 'package:latlong2/latlong.dart';

/// Coordenadas y perímetros de los puntos neurálgicos del City Tour de EPG YUYARIY S.A.C.
/// Centro Histórico de Cusco, Perú.
class TourCoordinates {
  // Sede Central de YUYARIY (Av. El Sol)
  static const LatLng yuyariyOffice = LatLng(-13.5186, -71.9772);

  // Plaza de Armas del Cusco
  static const LatLng plazaDeArmas = LatLng(-13.5160, -71.9788);

  // Templo del Qoricancha / Santo Domingo
  static const LatLng qoricancha = LatLng(-13.5204, -71.9754);

  // Mercado Central de San Pedro
  static const LatLng mercadoSanPedro = LatLng(-13.5200, -71.9830);

  // Fortaleza de Sacsayhuamán
  static const LatLng sacsayhuaman = LatLng(-13.5080, -71.9816);

  /// Polígono delimitador del Geocercado (Safe Zone) del City Tour en el Centro Histórico
  static final List<LatLng> cityTourSafePolygon = [
    const LatLng(-13.5060, -71.9840), // Extremo Norte (Sacsayhuamán / Cristo Blanco)
    const LatLng(-13.5120, -71.9710), // Extremo Este (San Blas alto)
    const LatLng(-13.5230, -71.9740), // Extremo Sur-Este (Av. El Sol / Qoricancha sur)
    const LatLng(-13.5235, -71.9860), // Extremo Sur-Oeste (San Pedro / Estación tren)
    const LatLng(-13.5130, -71.9870), // Extremo Nor-Oeste (Santa Teresa)
  ];
}
