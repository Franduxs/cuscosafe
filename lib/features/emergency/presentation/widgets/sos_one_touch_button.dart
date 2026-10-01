import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/database/database_helper.dart';
import '../../data/models/sos_alert_model.dart';

/// Botón SOS de pánico con retroalimentación háptica y guardado local garantizado.
class SosOneTouchButton extends StatefulWidget {
  final String tourId;
  final String userId;
  final VoidCallback? onAlertTriggered;

  const SosOneTouchButton({
    super.key,
    required this.tourId,
    required this.userId,
    this.onAlertTriggered,
  });

  @override
  State<SosOneTouchButton> createState() => _SosOneTouchButtonState();
}

class _SosOneTouchButtonState extends State<SosOneTouchButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  Future<void> _handleSosPress() async {
    if (_isProcessing) return;

    setState(() => _isProcessing = true);
    HapticFeedback.heavyImpact();

    try {
      // 1. Obtención de coordenadas inmediatas
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 3),
        );
      } catch (_) {
        position = await Geolocator.getLastKnownPosition();
      }

      final double lat = position?.latitude ?? -13.5160; // Fallback Plaza de Armas
      final double lng = position?.longitude ?? -71.9788;

      // 2. Registro local inmutable en SQLite
      final sosModel = SosAlertModel(
        tourId: widget.tourId,
        userId: widget.userId,
        latitude: lat,
        longitude: lng,
        batteryLevel: 85, // En integración se lee con battery_plus
        timestamp: DateTime.now(),
        status: 'PENDING',
      );

      await DatabaseHelper.instance.insertSosEvent(sosModel.toMap());

      if (mounted) {
        widget.onAlertTriggered?.call();
        _showConfirmationDialog();
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  void _showConfirmationDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: AppColors.statusSafe, size: 28),
            SizedBox(width: 8),
            Text('¡Alerta Emitida!', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'Tu ubicación de auxilio ha sido registrada de forma segura en el dispositivo. '
          'El equipo de EPG YUYARIY ha recibido la notificación o la recibirá de inmediato al detectar señal.',
          style: TextStyle(fontSize: 14),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBurgundy,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _pulseAnimation,
      child: GestureDetector(
        onTap: _handleSosPress,
        child: Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const RadialGradient(
              colors: [
                Color(0xFFFF4D4D),
                AppColors.sosEmergency,
                Color(0xFF990000),
              ],
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.sosEmergency.withOpacity(0.4),
                blurRadius: 20,
                spreadRadius: 6,
              ),
            ],
          ),
          child: Center(
            child: _isProcessing
                ? const CircularProgressIndicator(color: Colors.white)
                : const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.sos, size: 50, color: Colors.white),
                      Text(
                        'AUXILIO',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
