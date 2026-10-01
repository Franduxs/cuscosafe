# CuscoSafe - Sistema de Monitoreo y Asistencia Inteligente Offline-First

[![SENATI](https://img.shields.io/badge/SENATI-Dirección_Zonal_Cusco--Apurímac--Madre_de_Dios-003366.svg)](https://www.senati.edu.pe)
[![Carrera](https://img.shields.io/badge/Carrera-Ingeniería_de_Software_con_IA-FF6600.svg)](https://www.senati.edu.pe)
[![Empresa](https://img.shields.io/badge/Empresa-EPG_YUYARIY_S.A.C.-D4AF37.svg)](https://yuyariy.com)
[![Curso](https://img.shields.io/badge/Curso-CNIU--126_Formulación_de_Proyectos-green.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Flutter_3.x_%7C_SQLite_%7C_Firebase_Spark-blue.svg)](#)
[![Cost](https://img.shields.io/badge/Costo_Licencias-S/_0.00_(100%25_Gratuito)-success.svg)](#)

---

## 📌 1. Información General del Proyecto
- **Denominación del Proyecto:** "Implementación de una Aplicación Móvil con Arquitectura Offline-First y Módulo de Detección Heurística de Anomalías para el Monitoreo y Asistencia de Turistas en el Servicio City Tour de la Empresa EPG YUYARIY S.A.C."
- **Estudiante / Autor:** Franduxs (Francito Soto Berrio)
- **Institución:** Servicio Nacional de Adiestramiento en Trabajo Industrial (SENATI)
- **Dirección Zonal:** Cusco - Apurímac - Madre de Dios
- **CFP:** Cusco
- **Programa:** Aprendizaje Dual / Carrera de Ingeniería de Software con Inteligencia Artificial
- **Curso:** CNIU-126 Metodología y Formulación de Proyectos de Innovación y/o Mejora
- **Asesor Técnico:** Jimmy Arredondo Aquehua
- **Empresa Patrocinadora:** EPG YUYARIY S.A.C. (Av. El Sol, Centro Histórico de Cusco)

---

## 🎯 2. Justificación y Problemática
En el servicio turístico de **City Tour** por el Centro Histórico de Cusco (recorriendo puntos como Qoricancha, Plaza de Armas, Mercado de San Pedro y Sacsayhuamán), se identificaron las siguientes problemáticas críticas:
1. **Pérdida de tiempo operativo:** Demoras recurrentes de **15 a 30 minutos por incidente** debido a turistas desorientados en las intrincadas calles coloniales e incaicas.
2. **Cañones urbanos y falta de señal:** Pérdida de cobertura de datos móviles (3G/4G/5G) causada por los muros macizos de piedra, impidiendo la comunicación tradicional en tiempo real.
3. **Falta de un canal unificado de pánico:** Canales de auxilio dispersos (llamadas, mensajería no integrada).

---

## 🏗️ 3. Arquitectura Técnica (Costo S/ 0.00)
- **Frontend Móvil:** Flutter 3.x / Dart (Despliegue nativo multiplataforma Android/iOS).
- **Persistencia Local (Store & Forward):** SQLite mediante `sqflite` con índices B-Tree para salvaguardar coordenadas y eventos SOS sin conexión.
- **Backend & Sincronización:** Google Firebase en plan Spark (Cloud Firestore NoSQL, Firebase Auth, FCM).
- **Cartografía Libre:** OpenStreetMap mediante `flutter_map` y `latlong2` (sustituyendo APIs comerciales de pago como Google Maps).
- **Módulo de Inteligencia Artificial:**
  - Evaluador de Geocercado con Algoritmo de **Ray-Casting** (Point-in-Polygon).
  - Detector Heurístico de Anomalías de Movimiento (alerta por inmovilidad no programada `>10 min` o desvío de ruta).

---

## 📁 4. Estructura del Repositorio (Clean Architecture)
```text
cuscosafe/
├── android/app/src/main/AndroidManifest.xml    # Permisos Foreground/Background GPS
├── lib/
│   ├── main.dart                              # Inicialización de servicios y arranque
│   ├── core/
│   │   ├── ai/
│   │   │   ├── geofence_evaluator.dart        # Algoritmo de Ray-Casting
│   │   │   └── heuristic_anomaly_detector.dart # Detección de inmovilidad y desvío
│   │   ├── constants/
│   │   │   ├── app_colors.dart                # Paleta corporativa YUYARIY
│   │   │   └── tour_coordinates.dart          # Coordenadas reales del City Tour
│   │   └── database/
│   │       └── database_helper.dart           # Motor SQLite Offline-First
│   └── features/                              # Módulos: Tracking, SOS, Monitoreo
├── pubspec.yaml                               # Dependencias de libre acceso
└── README.md
```

---

## 🚀 5. Cronograma de Sprints (Metodología Scrum)
- **Sprint 1 (Completado):** Arquitectura base, esquema SQLite `DatabaseHelper`, permisos Android y configuración inicial.
- **Sprint 2:** Servicio de captura de GPS en segundo plano con optimización de batería y botón SOS con vibración háptica.
- **Sprint 3:** Panel de monitoreo para el personal de EPG YUYARIY S.A.C. con mapa en tiempo real y alertas push.
- **Sprint 4:** Protocolo de pruebas en campo (Ruta Qoricancha - Plaza de Armas) y redacción del Capítulo III/IV bajo normas APA 7ma edición.
