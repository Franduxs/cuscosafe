// ==========================================
// CuscoSafe PWA - Motor Inteligente Offline-First
// EPG YUYARIY S.A.C. - SENATI CNIU-126
// ==========================================

// 1. Registro de Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('✅ ServiceWorker CuscoSafe registrado:', reg.scope);
    }).catch((err) => {
      console.warn('⚠️ ServiceWorker error:', err);
    });
  });
}

// 2. Coordenadas y Polígonos de Referencia
const YUYARIY_COORDS = {
  office: [-13.5186, -71.9772],
  plazaDeArmas: [-13.5160, -71.9788],
  qoricancha: [-13.5204, -71.9754],
  sanPedro: [-13.5200, -71.9830],
  sacsayhuaman: [-13.5080, -71.9816]
};

// Polígono del City Tour en Centro Histórico de Cusco
const SAFE_POLYGON = [
  [-13.5060, -71.9840], // Sacsayhuamán Norte
  [-13.5120, -71.9710], // San Blas Alto Este
  [-13.5230, -71.9740], // Av. El Sol Sur-Este
  [-13.5235, -71.9860], // San Pedro Sur-Oeste
  [-13.5130, -71.9870]  // Santa Teresa Nor-Oeste
];

// 2.1 Hitos Oficiales del City Tour VR (EPG YUYARIY)
const TOUR_LANDMARKS = [
  {
    id: 'plazaDeArmas',
    name: 'Plaza de Armas (Huacaypata)',
    coords: YUYARIY_COORDS.plazaDeArmas,
    icon: '🏛️',
    desc: 'Centro sagrado del Imperio Inca y núcleo monumental del Cusco colonial.',
    narration: 'Bienvenido a la Plaza de Armas del Cusco, conocida en tiempos incas como Huacaypata. Aquí confluían los cuatro suyos del Tahuantinsuyo. Con tus lentes VR YUYARIY puedes apreciar cómo lucían los palacios de Pachacútec y Huayna Cápac.',
    vrImage: 'icons/vr_plaza.jpg'
  },
  {
    id: 'qoricancha',
    name: 'Qoricancha (Templo del Sol)',
    coords: YUYARIY_COORDS.qoricancha,
    icon: '☀️',
    desc: 'El recinto de adoración al Sol más fastuoso del Tahuantinsuyo.',
    narration: 'Te encuentras en las inmediaciones del Qoricancha, el Templo del Sol. Sus muros de piedra andesita pulida estaban forrados en planchas de oro macizo. La experiencia de Realidad Virtual recrea el resplandor sagrado del Inti Raymi.',
    vrImage: 'icons/vr_qoricancha.jpg'
  },
  {
    id: 'sacsayhuaman',
    name: 'Fortaleza Sacsayhuamán',
    coords: YUYARIY_COORDS.sacsayhuaman,
    icon: '🗿',
    desc: 'Murallas megalíticas ciclópeas con piedras de más de 120 toneladas.',
    narration: 'Avanzamos hacia Sacsayhuamán. Esta impresionante fortaleza y centro astronómico cuenta con tres niveles de murallas ciclópeas labradas con precisión milimétrica.',
    vrImage: 'icons/vr_sacsayhuaman.jpg'
  },
  {
    id: 'sanPedro',
    name: 'Mercado Central San Pedro',
    coords: YUYARIY_COORDS.sanPedro,
    icon: '🛍️',
    desc: 'Histórico mercado colonial y centro de intercambio andino tradicional.',
    narration: 'Mercado Central de San Pedro, construido en mil novecientos veinticinco y diseñado por el ingeniero Gustave Eiffel. Es el punto neurálgico del trueque y tradición gastronómica cusqueña.',
    vrImage: 'icons/vr_plaza.jpg'
  }
];

const MAP_LAYERS = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

// 3. Estado Global del Sistema
const state = {
  isSimulatedOffline: false,
  currentPosition: { lat: YUYARIY_COORDS.plazaDeArmas[0], lng: YUYARIY_COORDS.plazaDeArmas[1], accuracy: 5 },
  isRealGps: false,
  isInsideGeofence: true,
  isSimulatingWalk: false,
  walkStep: 0,
  walkTimer: null,
  activeSosAlerts: 0,
  laggedTourists: 1,
  sosCountdownInterval: null,
  sosCountdownValue: 3,
  pendingSosEvent: null,
  mapStyle: 'osm',
  isAudioGuideActive: false,
  currentLandmarkKey: 'qoricancha',
  telemetryBuffer: JSON.parse(localStorage.getItem('cuscosafe_telemetry') || '[]'),
  touristsGroup: [
    { id: 'T-01', name: 'Franduxs (Tú)', lat: -13.5160, lng: -71.9788, status: 'safe', battery: 94 },
    { id: 'T-02', name: 'John Miller (USA)', lat: -13.5175, lng: -71.9780, status: 'safe', battery: 88 },
    { id: 'T-03', name: 'Elena Rossi (ITA)', lat: -13.5195, lng: -71.9760, status: 'warning', battery: 65, lagMinutes: 12 },
    { id: 'T-04', name: 'Pierre Dubois (FRA)', lat: -13.5204, lng: -71.9754, status: 'safe', battery: 79 },
    { id: 'T-05', name: 'Akira Tanaka (JPN)', lat: -13.5180, lng: -71.9770, status: 'safe', battery: 91 }
  ]
};

// 4. Inicialización de Mapas Leaflet
let touristMap, operatorMap;
let touristTileLayer, operatorTileLayer;
let touristMarker, touristCircle, geofencePolygonLayer;
let operatorMarkersGroup;

function initMaps() {
  // Mapa de Turista
  touristMap = L.map('tourist-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(YUYARIY_COORDS.plazaDeArmas, 16);

  touristTileLayer = L.tileLayer(MAP_LAYERS.osm, {
    maxZoom: 19
  }).addTo(touristMap);

  // Polígono seguro
  geofencePolygonLayer = L.polygon(SAFE_POLYGON, {
    color: '#D2A542',
    weight: 2,
    dashArray: '5, 5',
    fillColor: '#B65B52',
    fillOpacity: 0.10
  }).addTo(touristMap);

  // Puntos del tour
  addTourLandmarks(touristMap);

  // Marcador del Turista
  const touristIcon = L.divIcon({
    className: 'custom-tourist-pin',
    html: '<div style="background:#2A9D8F;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(0,0,0,0.6);animation:pulse 2s infinite;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  touristMarker = L.marker(YUYARIY_COORDS.plazaDeArmas, { icon: touristIcon }).addTo(touristMap);
  touristCircle = L.circle(YUYARIY_COORDS.plazaDeArmas, { radius: 15, color: '#2A9D8F', fillOpacity: 0.15 }).addTo(touristMap);

  // Mapa de Operador
  operatorMap = L.map('operator-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(YUYARIY_COORDS.plazaDeArmas, 15);

  operatorTileLayer = L.tileLayer(MAP_LAYERS.osm, {
    maxZoom: 19
  }).addTo(operatorMap);

  L.polygon(SAFE_POLYGON, {
    color: '#D2A542',
    weight: 2,
    dashArray: '4, 4',
    fillColor: '#D2A542',
    fillOpacity: 0.08
  }).addTo(operatorMap);

  addTourLandmarks(operatorMap);
  operatorMarkersGroup = L.layerGroup().addTo(operatorMap);
  updateOperatorMarkers();
}

function addTourLandmarks(mapInstance) {
  TOUR_LANDMARKS.forEach(lm => {
    const marker = L.circleMarker(lm.coords, {
      radius: 7,
      color: '#D2A542',
      fillColor: '#B65B52',
      fillOpacity: 0.95,
      weight: 2
    });

    const popupHtml = `
      <div style="min-width:180px; font-family:sans-serif;">
        <strong style="color:#28323D; font-size:12.5px;">${lm.icon} ${lm.name}</strong>
        <p style="font-size:10.5px; color:#4A5568; margin:4px 0 8px 0; line-height:1.3;">${lm.desc}</p>
        <div style="display:flex; gap:6px;">
          <button onclick="openVrModal('${lm.id}')" style="background:#B65B52; color:white; border:none; padding:4px 8px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">🥽 Ver VR 360°</button>
          <button onclick="narrateCurrentVrScene()" style="background:#28323D; color:#D2A542; border:none; padding:4px 8px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">🎙️ Narrar</button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml).addTo(mapInstance);
  });
}

// 5. Algoritmo de Geocercado Ray-Casting (Point in Polygon)
function isPointInPolygon(point, polygon) {
  const lat = point.lat !== undefined ? point.lat : point[0];
  const lng = point.lng !== undefined ? point.lng : point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }
  return inside;
}

// 6. Audio Binaural para iPhone / iOS (Sin archivos MP3 externos)
let audioCtx = null;
function playAlertTone(type = 'sos') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type === 'sos' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(type === 'sos' ? 880 : 440, audioCtx.currentTime);
    if (type === 'sos') {
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
    }

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (type === 'sos' ? 0.35 : 0.2));

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + (type === 'sos' ? 0.35 : 0.2));
  } catch (e) {
    console.warn('Audio tone muted:', e);
  }
}

// 7. Sensor GPS Real (Hardware del iPhone)
function startGpsTracking() {
  if (!('geolocation' in navigator)) {
    document.getElementById('gps-accuracy').textContent = 'Simulado';
    return;
  }

  navigator.geolocation.watchPosition(
    (pos) => {
      state.isRealGps = true;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy);

      document.getElementById('gps-accuracy').textContent = `±${accuracy}m`;
      
      // Si el usuario está físicamente en Cusco o quiere usar su GPS real
      updateTouristPosition(lat, lng, accuracy, false);
    },
    (err) => {
      console.log('GPS error/permission:', err.message);
      document.getElementById('gps-accuracy').textContent = 'Modo Tour Cusco';
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

function updateTouristPosition(lat, lng, accuracy = 5, recordToBuffer = true) {
  state.currentPosition = { lat, lng, accuracy };

  if (touristMarker && touristCircle) {
    touristMarker.setLatLng([lat, lng]);
    touristCircle.setLatLng([lat, lng]);
    touristCircle.setRadius(accuracy);
  }

  // Actualizar también en el array del grupo
  state.touristsGroup[0].lat = lat;
  state.touristsGroup[0].lng = lng;
  updateOperatorMarkers();

  // Evaluar Geocerca
  const inside = isPointInPolygon({ lat, lng }, SAFE_POLYGON);
  state.isInsideGeofence = inside;

  const geofenceElem = document.getElementById('geofence-status');
  if (inside) {
    geofenceElem.textContent = '✅ En Perímetro Seguro';
    geofenceElem.className = 'val val-safe';
  } else {
    geofenceElem.textContent = '⚠️ DESVÍO FUERA DE ZONA';
    geofenceElem.className = 'val val-warning';
    showBanner('⚠️ Alerta Heurística: Te has desviado fuera del perímetro seguro del City Tour.');
    playAlertTone('warning');
  }

  // Persistir en SQLite / Store & Forward
  if (recordToBuffer) {
    saveTelemetryPoint(lat, lng);
  }

  // Actualizar Brújula y Distancia Espacial en HUD
  updateSpatialHud();
}

// 8. Motor Offline-First (Store & Forward)
function saveTelemetryPoint(lat, lng, isSos = false) {
  const isOnline = navigator.onLine && !state.isSimulatedOffline;
  const point = {
    id: 'pt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    timestamp: new Date().toISOString(),
    is_sos: isSos ? 1 : 0,
    is_synced: isOnline ? 1 : 0
  };

  state.telemetryBuffer.unshift(point);
  if (state.telemetryBuffer.length > 100) state.telemetryBuffer.pop();

  localStorage.setItem('cuscosafe_telemetry', JSON.stringify(state.telemetryBuffer));
  updateBufferUI();
}

function updateBufferUI() {
  const unsyncedCount = state.telemetryBuffer.filter(p => p.is_synced === 0).length;
  document.getElementById('offline-buffer-count').textContent = `${unsyncedCount} ptos`;
  document.getElementById('buffer-records-count').textContent = state.telemetryBuffer.length;

  const preview = document.getElementById('db-preview');
  if (preview) {
    preview.textContent = JSON.stringify(state.telemetryBuffer.slice(0, 5), null, 2);
  }
}

function forceSyncStoreForward() {
  let syncedCount = 0;
  state.telemetryBuffer.forEach(p => {
    if (p.is_synced === 0) {
      p.is_synced = 1;
      syncedCount++;
    }
  });

  localStorage.setItem('cuscosafe_telemetry', JSON.stringify(state.telemetryBuffer));
  updateBufferUI();
  showBanner(`✅ Despachador Store & Forward: Sincronizados ${syncedCount} paquetes con la nube de YUYARIY.`);
  playAlertTone('safe');
}

function clearTelemetryBuffer() {
  state.telemetryBuffer = [];
  localStorage.removeItem('cuscosafe_telemetry');
  updateBufferUI();
}

// 9. Manejo del Botón SOS (Pánico con Confirmación y Vibración)
function handleSosTrigger() {
  // Vibración táctil si el dispositivo la soporta
  if (navigator.vibrate) {
    navigator.vibrate([250, 100, 250, 100, 350]);
  }
  playAlertTone('sos');

  // Abrir modal de cuenta regresiva
  state.sosCountdownValue = 3;
  document.getElementById('countdown-number').textContent = state.sosCountdownValue;
  document.getElementById('sos-modal').classList.remove('modal-hidden');

  clearInterval(state.sosCountdownInterval);
  state.sosCountdownInterval = setInterval(() => {
    state.sosCountdownValue--;
    if (state.sosCountdownValue > 0) {
      document.getElementById('countdown-number').textContent = state.sosCountdownValue;
      playAlertTone('sos');
    } else {
      clearInterval(state.sosCountdownInterval);
      dispatchConfirmedSos();
    }
  }, 1000);
}

function cancelSosAlert() {
  clearInterval(state.sosCountdownInterval);
  document.getElementById('sos-modal').classList.add('modal-hidden');
  showBanner('ℹ️ Alerta SOS cancelada por el usuario (Falsa alarma).');
}

function dispatchConfirmedSos() {
  document.getElementById('sos-modal').classList.add('modal-hidden');
  state.activeSosAlerts++;
  document.getElementById('hud-sos-count').textContent = state.activeSosAlerts;

  // Marcar estado crítico en el grupo
  state.touristsGroup[0].status = 'sos';
  updateOperatorMarkers();
  updateOperatorTable();

  // Guardar evento SOS prioritario en Store & Forward
  saveTelemetryPoint(state.currentPosition.lat, state.currentPosition.lng, true);

  const isOnline = navigator.onLine && !state.isSimulatedOffline;
  if (isOnline) {
    showBanner('🚨 ALERTA SOS TRANSMITIDA: La central EPG YUYARIY ha recibido tus coordenadas.');
  } else {
    showBanner('🚨 ALERTA SOS RETENIDA: Sin señal 4G. Guardada en SQLite local; se transmitirá al detectar cobertura.');
  }
}

// 10. Centro de Control del Operador
function updateOperatorMarkers() {
  if (!operatorMarkersGroup) return;
  operatorMarkersGroup.clearLayers();

  state.touristsGroup.forEach(t => {
    let pinColor = '#2A9D8F'; // safe
    let label = '🟢 En ruta';

    if (t.status === 'warning') {
      pinColor = '#E76F51';
      label = '⚠️ Rezagado >10m';
    } else if (t.status === 'sos') {
      pinColor = '#E63946';
      label = '🚨 SOS ACTIVO';
    }

    const iconHtml = `<div style="background:${pinColor};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>`;
    const icon = L.divIcon({
      className: 'custom-op-pin',
      html: iconHtml,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([t.lat, t.lng], { icon })
      .bindPopup(`<b>${t.name}</b><br>Estado: ${label}<br>Batería: ${t.battery}%`)
      .addTo(operatorMarkersGroup);
  });
}

function updateOperatorTable() {
  const tbody = document.getElementById('operator-tourists-table');
  if (!tbody) return;

  tbody.innerHTML = '';
  state.touristsGroup.forEach(t => {
    const tr = document.createElement('tr');
    let statusBadge = '<span style="color:#2A9D8F;font-weight:700;">🟢 Seguro</span>';
    let actionBtn = '<span style="color:#718096;">Nominal</span>';

    if (t.status === 'warning') {
      statusBadge = '<span style="color:#E76F51;font-weight:700;">⚠️ Rezagado (12m)</span>';
      actionBtn = `<button class="btn-xs" style="background:#E76F51;" onclick="notifyTourist('${t.id}')">Avisar</button>`;
    } else if (t.status === 'sos') {
      statusBadge = '<span style="color:#E63946;font-weight:700;animation:pulse-border 1s infinite;">🚨 SOS ACTIVO</span>';
      actionBtn = `<button class="btn-xs" style="background:#E63946;" onclick="resolveSos('${t.id}')">Resolver</button>`;
    }

    tr.innerHTML = `
      <td><strong>${t.name}</strong></td>
      <td>${statusBadge}</td>
      <td>${t.lat.toFixed(4)}, ${t.lng.toFixed(4)}</td>
      <td>🔋 ${t.battery}%</td>
      <td>${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function resolveSos(touristId) {
  const tourist = state.touristsGroup.find(t => t.id === touristId);
  if (tourist) {
    tourist.status = 'safe';
    if (state.activeSosAlerts > 0) state.activeSosAlerts--;
    document.getElementById('hud-sos-count').textContent = state.activeSosAlerts;
    updateOperatorMarkers();
    updateOperatorTable();
    showBanner(`✅ Incidente de ${tourist.name} resuelto satisfactoriamente.`);
  }
}

function notifyTourist(touristId) {
  showBanner(`📢 Recordatorio de reincorporación enviado al visor/app del turista.`);
}

// 11. Simulación de Paseo por el Centro Histórico
const TOUR_WALK_POINTS = [
  YUYARIY_COORDS.plazaDeArmas,
  [-13.5165, -71.9782], // Calle Triunfo
  [-13.5173, -71.9778], // Calle Hatun Rumiyoc (Piedra 12 Ángulos)
  [-13.5182, -71.9775], // Calle San Agustín
  YUYARIY_COORDS.office, // Sede YUYARIY (Av. El Sol)
  [-13.5195, -71.9762], // Palacio Mancio Sierra
  YUYARIY_COORDS.qoricancha // Templo del Sol
];

function toggleTourSimulation() {
  const btn = document.getElementById('btn-sim-walk');
  if (state.isSimulatingWalk) {
    clearInterval(state.walkTimer);
    state.isSimulatingWalk = false;
    btn.textContent = '🚶 Simular Paseo';
    showBanner('Simulación de caminata detenida.');
  } else {
    state.isSimulatingWalk = true;
    btn.textContent = '⏸️ Pausar Paseo';
    showBanner('🚶 Simulación activa: Recorriendo Hatun Rumiyoc y Av. El Sol.');
    
    state.walkTimer = setInterval(() => {
      state.walkStep = (state.walkStep + 1) % TOUR_WALK_POINTS.length;
      const pt = TOUR_WALK_POINTS[state.walkStep];
      updateTouristPosition(pt[0], pt[1], 4, true);
      touristMap.panTo(pt);
    }, 3500);
  }
}

function centerOnUser() {
  if (touristMap && state.currentPosition) {
    touristMap.setView([state.currentPosition.lat, state.currentPosition.lng], 17);
  }
}

// 12. Pruebas de Campo (Matriz SENATI)
function toggleSimulatedOffline() {
  state.isSimulatedOffline = !state.isSimulatedOffline;
  const netBadge = document.getElementById('network-badge');
  const netText = document.getElementById('network-status-text');
  const btn = document.getElementById('btn-toggle-offline');

  if (state.isSimulatedOffline) {
    netBadge.className = 'badge badge-offline';
    netText.textContent = 'Offline (Piedra)';
    btn.textContent = 'Restablecer Red (Online)';
    showBanner('🔴 [CP-01] Cañón urbano simulado: Pérdida total de datos 4G.');
  } else {
    netBadge.className = 'badge badge-online';
    netText.textContent = 'Online';
    btn.textContent = 'Cortar Red (Modo Offline)';
    showBanner('🟢 [CP-02] Conexión recuperada: Red 4G restablecida.');
    forceSyncStoreForward();
  }
}

function triggerTestOfflineSos() {
  if (!state.isSimulatedOffline) {
    toggleSimulatedOffline();
  }
  handleSosTrigger();
}

function triggerProlongedStopTest() {
  const motionElem = document.getElementById('motion-status');
  motionElem.textContent = '⚠️ Inmóvil >10 min';
  motionElem.className = 'val val-warning';
  showBanner('⚠️ [CP-04] Detección Heurística: Inmovilidad no programada (>10 min) detectada.');
  playAlertTone('warning');
}

function triggerOutOfBoundsTest() {
  // Coordenadas muy al sur de Cusco (fuera de la geocerca)
  const outsideLat = -13.5350;
  const outsideLng = -71.9600;
  updateTouristPosition(outsideLat, outsideLng, 8, true);
  touristMap.setView([outsideLat, outsideLng], 15);
}

// 13. UI Navigation & Banners
function switchTab(viewName, btnElem) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('view-active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('nav-active'));

  document.getElementById(`view-${viewName}`).classList.add('view-active');
  btnElem.classList.add('nav-active');

  // Redimensionar mapas al cambiar pestañas
  setTimeout(() => {
    if (viewName === 'tourist' && touristMap) touristMap.invalidateSize();
    if (viewName === 'operator' && operatorMap) {
      operatorMap.invalidateSize();
      updateOperatorTable();
    }
    if (viewName === 'tests') updateBufferUI();
  }, 100);
}

function showBanner(msg) {
  const banner = document.getElementById('alert-banner');
  const text = document.getElementById('alert-message');
  text.textContent = msg;
  banner.classList.remove('alert-hidden');
}

function dismissBanner() {
  document.getElementById('alert-banner').classList.add('alert-hidden');
}

function openAgencyInfoModal() {
  const modal = document.getElementById('agency-info-modal');
  if (modal) modal.classList.remove('modal-hidden');
}

function closeAgencyInfoModal() {
  const modal = document.getElementById('agency-info-modal');
  if (modal) modal.classList.add('modal-hidden');
}

// 14. Selector Dinámico de Capas de Mapa (OpenStreetMap / Satélite Esri / Pizarra Nocturna)
function toggleMapLayer() {
  const modes = ['osm', 'satellite', 'dark'];
  const nextIdx = (modes.indexOf(state.mapStyle) + 1) % modes.length;
  state.mapStyle = modes[nextIdx];

  if (touristTileLayer) touristMap.removeLayer(touristTileLayer);
  touristTileLayer = L.tileLayer(MAP_LAYERS[state.mapStyle], { maxZoom: 19 }).addTo(touristMap);
  touristTileLayer.bringToBack();

  const btn = document.getElementById('btn-map-layer');
  if (state.mapStyle === 'satellite') {
    btn.innerHTML = '🌙 Noche';
    showBanner('🛰️ Modo Satélite HD activado (Fotografía aérea de precisión)');
  } else if (state.mapStyle === 'dark') {
    btn.innerHTML = '🗺️ Calles';
    showBanner('🌙 Modo Nocturno Andino activado (Contraste dorado sobre pizarra)');
  } else {
    btn.innerHTML = '🛰️ Satélite';
    showBanner('🗺️ Modo Calles OpenStreetMap activado');
  }
}

// 15. Brújula Espacial y Radar HUD en Tiempo Real
function updateSpatialHud() {
  const current = state.currentPosition;
  if (!current) return;

  let nearest = TOUR_LANDMARKS[0];
  let minDistance = 999999;

  TOUR_LANDMARKS.forEach(lm => {
    const d = calculateDistance(current.lat, current.lng, lm.coords[0], lm.coords[1]);
    if (d < minDistance) {
      minDistance = d;
      nearest = lm;
    }
  });

  const distMeters = Math.round(minDistance);
  const timeMin = Math.max(1, Math.round(distMeters / 75));

  const nameEl = document.getElementById('hud-landmark-name');
  const distEl = document.getElementById('hud-landmark-dist');
  if (nameEl) nameEl.textContent = nearest.name.split(' (')[0];
  if (distEl) distEl.textContent = `· ${distMeters}m (${timeMin}m)`;

  const bearing = calculateBearing(current.lat, current.lng, nearest.coords[0], nearest.coords[1]);
  const compassArrow = document.getElementById('compass-icon');
  const compassText = document.getElementById('compass-text');
  if (compassArrow) {
    compassArrow.style.transform = `rotate(${Math.round(bearing)}deg)`;
  }
  if (compassText) {
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const card = cardinals[Math.round(bearing / 45) % 8];
    compassText.textContent = `${card} ${Math.round(bearing)}°`;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

// 16. Selección de Hitos y Navegación Dinámica
function selectLandmark(key, chipElem) {
  state.currentLandmarkKey = key;
  const lm = TOUR_LANDMARKS.find(l => l.id === key);
  if (!lm) return;

  document.querySelectorAll('.milestone-chip').forEach(c => c.classList.remove('chip-active'));
  if (chipElem) {
    chipElem.classList.add('chip-active');
  } else {
    document.querySelectorAll('.milestone-chip').forEach(c => {
      if (c.textContent.toLowerCase().includes(key.toLowerCase().substring(0, 4))) {
        c.classList.add('chip-active');
      }
    });
  }

  if (touristMap) {
    touristMap.flyTo(lm.coords, 17, { duration: 1.2 });
  }

  updateSpatialHud();

  if (state.isAudioGuideActive) {
    narrateText(lm.narration);
  }
}

function cycleToNextLandmark() {
  const ids = TOUR_LANDMARKS.map(l => l.id);
  const nextIdx = (ids.indexOf(state.currentLandmarkKey) + 1) % ids.length;
  const nextKey = ids[nextIdx];
  const chips = document.querySelectorAll('.milestone-chip');
  selectLandmark(nextKey, chips[nextIdx]);
}

// 17. Audio-Guía Inteligente Multimodal con Síntesis de Voz Nativa
function toggleAudioGuide() {
  state.isAudioGuideActive = !state.isAudioGuideActive;
  const btn = document.getElementById('btn-audio');
  if (btn) {
    btn.classList.toggle('btn-audio-glow', state.isAudioGuideActive);
    btn.textContent = state.isAudioGuideActive ? '🎙️ Audio ON' : '🎙️ Audio';
  }

  if (state.isAudioGuideActive) {
    const lm = TOUR_LANDMARKS.find(l => l.id === state.currentLandmarkKey) || TOUR_LANDMARKS[0];
    narrateText(`Iniciando audio guía oficial de EPG YUYARIY. ${lm.narration}`);
  } else {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showBanner('🔇 Audio guía pausada.');
  }
}

function narrateCurrentVrScene() {
  const lm = TOUR_LANDMARKS.find(l => l.id === vrState.activeLandmark) || TOUR_LANDMARKS[0];
  narrateText(lm.narration);
}

function narrateText(text) {
  if (!('speechSynthesis' in window)) {
    showBanner('⚠️ Síntesis de voz no disponible en este dispositivo.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.lang = 'es-PE';

  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es-PE') || v.lang.startsWith('es-ES') || v.lang.startsWith('es'));
  if (esVoice) utter.voice = esVoice;

  showBanner('🎙️ Reproduciendo relato histórico oficial...');
  window.speechSynthesis.speak(utter);
}

// 18. Motor de Visor de Realidad Virtual 360° (YUYARIY VR Canvas Engine)
let vrState = {
  activeLandmark: 'qoricancha',
  isGyro: false,
  isStereo: false,
  yaw: 0,
  pitch: 0,
  isDragging: false,
  lastX: 0,
  lastY: 0,
  images: {},
  animFrameId: null
};

function initVrViewer() {
  const canvas = document.getElementById('vr-canvas');
  if (!canvas) return;

  TOUR_LANDMARKS.forEach(lm => {
    const img = new Image();
    img.src = lm.vrImage;
    vrState.images[lm.id] = img;
  });

  canvas.addEventListener('mousedown', (e) => {
    vrState.isDragging = true;
    vrState.lastX = e.clientX;
    vrState.lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    vrState.isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!vrState.isDragging) return;
    const dx = e.clientX - vrState.lastX;
    const dy = e.clientY - vrState.lastY;
    vrState.lastX = e.clientX;
    vrState.lastY = e.clientY;

    vrState.yaw += dx * 0.25;
    vrState.pitch = Math.max(-65, Math.min(65, vrState.pitch - dy * 0.25));
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      vrState.isDragging = true;
      vrState.lastX = e.touches[0].clientX;
      vrState.lastY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    vrState.isDragging = false;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!vrState.isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - vrState.lastX;
    const dy = e.touches[0].clientY - vrState.lastY;
    vrState.lastX = e.touches[0].clientX;
    vrState.lastY = e.touches[0].clientY;

    vrState.yaw += dx * 0.35;
    vrState.pitch = Math.max(-65, Math.min(65, vrState.pitch - dy * 0.35));
  }, { passive: true });

  window.addEventListener('deviceorientation', (e) => {
    if (!vrState.isGyro || e.alpha === null) return;
    vrState.yaw = -e.alpha;
    vrState.pitch = Math.max(-65, Math.min(65, e.beta - 45));
  });
}

function openVrModal(landmarkKey = 'qoricancha') {
  const modal = document.getElementById('vr-modal');
  if (modal) modal.classList.remove('modal-hidden');
  switchVrScene(landmarkKey);
  startVrRenderLoop();
}

function closeVrModal() {
  const modal = document.getElementById('vr-modal');
  if (modal) modal.classList.add('modal-hidden');
  if (vrState.animFrameId) cancelAnimationFrame(vrState.animFrameId);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function switchVrScene(key, btnElem) {
  vrState.activeLandmark = key;
  const lm = TOUR_LANDMARKS.find(l => l.id === key) || TOUR_LANDMARKS[0];

  const title = document.getElementById('vr-scene-title');
  const desc = document.getElementById('vr-scene-desc');
  if (title) title.textContent = lm.name;
  if (desc) desc.textContent = lm.desc;

  document.querySelectorAll('.vr-tab-btn').forEach(b => b.classList.remove('vr-tab-active'));
  if (btnElem) {
    btnElem.classList.add('vr-tab-active');
  } else {
    document.querySelectorAll('.vr-tab-btn').forEach(t => {
      if (t.textContent.toLowerCase().includes(key.toLowerCase().substring(0, 4))) {
        t.classList.add('vr-tab-active');
      }
    });
  }

  if (!vrState.images[key]) {
    const img = new Image();
    img.src = lm.vrImage;
    vrState.images[key] = img;
  }
}

function toggleVrGyro() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === 'granted') {
        vrState.isGyro = !vrState.isGyro;
        updateGyroButton();
      }
    }).catch(err => {
      console.warn('Gyro error:', err);
      vrState.isGyro = !vrState.isGyro;
      updateGyroButton();
    });
  } else {
    vrState.isGyro = !vrState.isGyro;
    updateGyroButton();
  }
}

function updateGyroButton() {
  const btn = document.getElementById('btn-vr-gyro');
  if (btn) {
    btn.classList.toggle('active', vrState.isGyro);
    btn.textContent = vrState.isGyro ? '📱 Giroscopio ON' : '📱 Giroscopio';
  }
}

function toggleVrStereo() {
  vrState.isStereo = !vrState.isStereo;
  const btn = document.getElementById('btn-vr-stereo');
  if (btn) {
    btn.classList.toggle('active', vrState.isStereo);
    btn.textContent = vrState.isStereo ? '🥽 2 Ojos (VR)' : '🥽 Gafas VR';
  }
}

function startVrRenderLoop() {
  const canvas = document.getElementById('vr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function render() {
    const rect = canvas.parentElement.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const img = vrState.images[vrState.activeLandmark];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (vrState.isStereo) {
        const halfW = canvas.width / 2;
        drawVrEye(ctx, img, 0, 0, halfW, canvas.height, vrState.yaw - 1.5, vrState.pitch);
        drawVrEye(ctx, img, halfW, 0, halfW, canvas.height, vrState.yaw + 1.5, vrState.pitch);

        ctx.strokeStyle = '#D2A542';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(halfW, 0);
        ctx.lineTo(halfW, canvas.height);
        ctx.stroke();
      } else {
        drawVrEye(ctx, img, 0, 0, canvas.width, canvas.height, vrState.yaw, vrState.pitch);
      }
    }

    vrState.animFrameId = requestAnimationFrame(render);
  }

  if (vrState.animFrameId) cancelAnimationFrame(vrState.animFrameId);
  vrState.animFrameId = requestAnimationFrame(render);
}

function drawVrEye(ctx, img, xOffset, yOffset, viewW, viewH, yaw, pitch) {
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  const normYaw = (((yaw % 360) + 360) % 360) / 360;
  const fovW = 0.28;
  const fovH = (viewH / viewW) * fovW;

  const srcX = normYaw * imgW;
  const srcY = Math.max(0, Math.min(imgH - (imgH * fovH), (0.5 - (pitch / 180) - fovH / 2) * imgH));
  const srcW = imgW * fovW;
  const srcH = imgH * fovH;

  if (srcX + srcW <= imgW) {
    ctx.drawImage(img, srcX, srcY, srcW, srcH, xOffset, yOffset, viewW, viewH);
  } else {
    const part1W = imgW - srcX;
    const part2W = srcW - part1W;
    const viewPart1W = (part1W / srcW) * viewW;
    const viewPart2W = viewW - viewPart1W;

    ctx.drawImage(img, srcX, srcY, part1W, srcH, xOffset, yOffset, viewPart1W, viewH);
    ctx.drawImage(img, 0, srcY, part2W, srcH, xOffset + viewPart1W, yOffset, viewPart2W, viewH);
  }
}

// 19. Modal Altitud y Soroche
function openAltitudeModal() {
  const modal = document.getElementById('altitude-modal');
  if (modal) modal.classList.remove('modal-hidden');
}

function closeAltitudeModal() {
  const modal = document.getElementById('altitude-modal');
  if (modal) modal.classList.add('modal-hidden');
}

// Conectividad nativa del navegador
window.addEventListener('online', () => {
  if (!state.isSimulatedOffline) {
    document.getElementById('network-badge').className = 'badge badge-online';
    document.getElementById('network-status-text').textContent = 'Online';
    forceSyncStoreForward();
  }
});

window.addEventListener('offline', () => {
  document.getElementById('network-badge').className = 'badge badge-offline';
  document.getElementById('network-status-text').textContent = 'Offline';
  showBanner('⚠️ Dispositivo desconectado de internet. Activado modo Store & Forward.');
});

// Inicialización general al cargar
window.addEventListener('DOMContentLoaded', () => {
  initMaps();
  initVrViewer();
  startGpsTracking();
  updateSpatialHud();
  updateBufferUI();
  updateOperatorTable();
});
