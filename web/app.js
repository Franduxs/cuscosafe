// ==========================================
// CuscoSafe PWA - Motor Inteligente Offline-First
// EPG YUYARIY S.A.C. - SENATI CNIU-126
// ==========================================

// 1. Registro de Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=20261002-v4').then((reg) => {
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

// 2.1 Hitos Oficiales del City Tour VR (EPG YUYARIY) - Multilingüe (Español / English / Runasimi Quechua)
const TOUR_LANDMARKS = [
  {
    id: 'plazaDeArmas',
    name: 'Plaza de Armas (Huacaypata)',
    nameEn: 'Main Square (Huacaypata)',
    nameQu: 'Huacaypata Hatun Kancha',
    coords: YUYARIY_COORDS.plazaDeArmas,
    icon: '🏛️',
    desc: 'Centro sagrado del Imperio Inca y núcleo monumental del Cusco colonial.',
    descEn: 'Sacred center of the Inca Empire and historic monumental hub of colonial Cusco.',
    descQu: 'Tawantinsuyupa sunqun, Pachakutiqpa hatun wasinkuna.',
    narrations: {
      es: 'Bienvenido a la Plaza de Armas del Cusco, conocida en tiempos incas como Huacaypata. Aquí confluían los cuatro suyos del Tahuantinsuyo. Con tus lentes VR YUYARIY puedes apreciar cómo lucían los palacios de Pachacútec y Huayna Cápac.',
      en: 'Welcome to the Plaza de Armas of Cusco, historically known as Huacaypata. The four quarters of the Inca Empire converged right here. With your YUYARIY VR headset, witness how the palaces of Pachacutec and Huayna Capac looked five centuries ago.',
      qu: 'Allillanchu! Allin hamusqaykichik Huacaypataman, Tawantinsuyupa sunqunman. Pachakutiqpa hatun wasinkunata qhaway YUYARIY Realidad Virtual nisqawan.'
    },
    narration: 'Bienvenido a la Plaza de Armas del Cusco, conocida en tiempos incas como Huacaypata. Aquí confluían los cuatro suyos del Tahuantinsuyo. Con tus lentes VR YUYARIY puedes apreciar cómo lucían los palacios de Pachacútec y Huayna Cápac.',
    vrImage: 'icons/vr_plaza.jpg'
  },
  {
    id: 'qoricancha',
    name: 'Qoricancha (Templo del Sol)',
    nameEn: 'Qoricancha (Temple of the Sun)',
    nameQu: 'Qorikancha (Intipa Wasin)',
    coords: YUYARIY_COORDS.qoricancha,
    icon: '☀️',
    desc: 'El recinto de adoración al Sol más fastuoso del Tahuantinsuyo.',
    descEn: 'The most opulent ceremonial sanctuary dedicated to the Sun in the Inca Empire.',
    descQu: 'Inti Taytapa yupaychana wasin, qoriwan qatasqa pirqakuna.',
    narrations: {
      es: 'Te encuentras en las inmediaciones del Qoricancha, el Templo del Sol. Sus muros de piedra andesita pulida estaban forrados en planchas de oro macizo. La experiencia de Realidad Virtual recrea el resplandor sagrado del Inti Raymi.',
      en: 'You are standing near the sacred Qoricancha, the Temple of the Sun. Its polished andesite stone walls were once entirely covered in solid gold plates. Experience the sacred radiance of Inti Raymi through YUYARIY VR.',
      qu: 'Qorikanchaman chayamurqanki, Inti Taytanchikpa wasinman. Chay rumi pirqakuna qoriwan qatasqa karqan. Inti Raymipa k\'anchayninta YUYARIY VR nisqawan rikuy.'
    },
    narration: 'Te encuentras en las inmediaciones del Qoricancha, el Templo del Sol. Sus muros de piedra andesita pulida estaban forrados en planchas de oro macizo. La experiencia de Realidad Virtual recrea el resplandor sagrado del Inti Raymi.',
    vrImage: 'icons/vr_qoricancha.jpg'
  },
  {
    id: 'sacsayhuaman',
    name: 'Fortaleza Sacsayhuamán',
    nameEn: 'Sacsayhuaman Fortress',
    nameQu: 'Saqsaywaman Hatun Pukara',
    coords: YUYARIY_COORDS.sacsayhuaman,
    icon: '🗿',
    desc: 'Murallas megalíticas ciclópeas con piedras de más de 120 toneladas.',
    descEn: 'Cyclopean megalithic ramparts crafted with stones weighing over 120 tons.',
    descQu: 'Kinsa patapatakuna, pachak iskay chunka tonelada rumiwan ruwasqa.',
    narrations: {
      es: 'Avanzamos hacia Sacsayhuamán. Esta impresionante fortaleza y centro astronómico cuenta con tres niveles de murallas ciclópeas labradas con piedras de más de ciento veinte toneladas.',
      en: 'We ascend towards Sacsayhuaman. This colossal fortress and astronomical temple features three zigzagging levels of cyclopean stone megaliths weighing over 120 tons each.',
      qu: 'Saqsaywaman hatun pukraman chayamunchik. Pachakutiqpa ruwachisqan kinsa patapatakuna, pachak iskay chunka tonelada rumi hatun kallpawan churasqa.'
    },
    narration: 'Avanzamos hacia Sacsayhuamán. Esta impresionante fortaleza y centro astronómico cuenta con tres niveles de murallas ciclópeas labradas con piedras de más de ciento veinte toneladas.',
    vrImage: 'icons/vr_sacsayhuaman.jpg'
  },
  {
    id: 'sanPedro',
    name: 'Mercado Central San Pedro',
    nameEn: 'San Pedro Central Market',
    nameQu: 'San Pedro Qhatu Wasi',
    coords: YUYARIY_COORDS.sanPedro,
    icon: '🛍️',
    desc: 'Histórico mercado colonial y centro de intercambio andino tradicional.',
    descEn: 'Historic market designed by Gustave Eiffel, the cultural heart of Andean trade.',
    descQu: 'Gustave Eiffel ruwasqan hatun qhatu wasi, lliwmanta lliw mikhunakuna.',
    narrations: {
      es: 'Mercado Central de San Pedro, construido en mil novecientos veinticinco y diseñado por el ingeniero Gustave Eiffel. Es el punto neurálgico del trueque y tradición gastronómica cusqueña.',
      en: 'San Pedro Central Market, built in 1925 and designed by engineer Gustave Eiffel. It is the beating heart of Andean trade, native superfoods, and Cusco culinary heritage.',
      qu: 'San Pedro qhatu wasiman chayamunchik. Gustave Eiffel ruwasqan. Kaypin kashan mikhunakuna, hampikuna, lliwmanta lliw qhatuqkuna.'
    },
    narration: 'Mercado Central de San Pedro, construido en mil novecientos veinticinco y diseñado por el ingeniero Gustave Eiffel. Es el punto neurálgico del trueque y tradición gastronómica cusqueña.',
    vrImage: 'icons/vr_plaza.jpg'
  }
];

// Estilos Vectoriales MapLibre GL (OpenFreeMap + Esri Satellite)
const VECTOR_STYLES = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'esri-satellite-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
};

const LEAFLET_LAYERS = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
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
  mapStyle: 'liberty',
  compassFollowActive: false,
  is3dActive: true,
  currentHeading: 0,
  targetHeading: 0,
  pitch: 40,
  tourLanguage: 'es',
  isHapticLocked: false,
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

// 4. Inicialización de Mapas (MapLibre GL Vectorial para Turista + Leaflet para Operador)
let touristMap, operatorMap;
let touristMarker;
let touristLandmarkMarkers = [];
let operatorTileLayer, operatorMarkersGroup;

// Coordenadas GeoJSON [lng, lat] para MapLibre
const SAFE_GEOJSON_COORDS = [
  ...SAFE_POLYGON.map(p => [p[1], p[0]]),
  [SAFE_POLYGON[0][1], SAFE_POLYGON[0][0]]
];

function initMaps() {
  // 4.1 Mapa Vectorial GPU de Turista con MapLibre GL JS (WebGL 2.0)
  try {
    touristMap = new maplibregl.Map({
      container: 'tourist-map',
      style: VECTOR_STYLES[state.mapStyle],
      center: [YUYARIY_COORDS.plazaDeArmas[1], YUYARIY_COORDS.plazaDeArmas[0]],
      zoom: 16.5,
      pitch: 40, // Perspectiva 3D inicial atractiva
      bearing: 0,
      attributionControl: false
    });

    touristMap.on('load', () => {
      setupTouristMapLayers();
      addTouristMapLandmarks();
      initTouristMarker();
    });
  } catch (err) {
    console.error('Error inicializando MapLibre GL:', err);
  }

  // 4.2 Mapa Táctico de Operador con Leaflet
  operatorMap = L.map('operator-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(YUYARIY_COORDS.plazaDeArmas, 15);

  operatorTileLayer = L.tileLayer(LEAFLET_LAYERS.osm, {
    maxZoom: 19
  }).addTo(operatorMap);

  L.polygon(SAFE_POLYGON, {
    color: '#D2A542',
    weight: 2,
    dashArray: '4, 4',
    fillColor: '#D2A542',
    fillOpacity: 0.08
  }).addTo(operatorMap);

  addTourLandmarksLeaflet(operatorMap);
  operatorMarkersGroup = L.layerGroup().addTo(operatorMap);
  updateOperatorMarkers();
}

function setupTouristMapLayers() {
  if (!touristMap) return;

  if (!touristMap.getSource('yuyariy-geofence')) {
    touristMap.addSource('yuyariy-geofence', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [SAFE_GEOJSON_COORDS]
        }
      }
    });
  }

  if (!touristMap.getLayer('geofence-fill')) {
    touristMap.addLayer({
      id: 'geofence-fill',
      type: 'fill',
      source: 'yuyariy-geofence',
      paint: {
        'fill-color': '#B65B52',
        'fill-opacity': 0.14
      }
    });
  }

  if (!touristMap.getLayer('geofence-line')) {
    touristMap.addLayer({
      id: 'geofence-line',
      type: 'line',
      source: 'yuyariy-geofence',
      paint: {
        'line-color': '#D2A542',
        'line-width': 2.5,
        'line-dasharray': [2, 2]
      }
    });
  }

  // 3D Extruded Buildings Layer (Arquitectura Colonial & Inca en Relieve)
  try {
    if (touristMap.getSource('openmaptiles') && !touristMap.getLayer('3d-buildings-extrusion')) {
      touristMap.addLayer({
        id: '3d-buildings-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': state.mapStyle === 'dark' ? '#212A35' : '#E8DEC9',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0,
            15.5, ['coalesce', ['get', 'render_height'], 10]
          ],
          'fill-extrusion-base': [
            'coalesce',
            ['get', 'render_min_height'],
            0
          ],
          'fill-extrusion-opacity': 0.85
        }
      });
    }

    // Luz Solar Andina (Simula la altitud del Cusco y relieve con sombras reales)
    touristMap.setLight({
      anchor: 'map',
      color: state.mapStyle === 'dark' ? '#D2A542' : '#FFFDF2',
      intensity: state.mapStyle === 'dark' ? 0.35 : 0.65,
      position: [1.3, 115, 52]
    });
  } catch (e) {
    console.log('3D building extrusion notice:', e);
  }
}

function addTouristMapLandmarks() {
  touristLandmarkMarkers.forEach(m => m.remove());
  touristLandmarkMarkers = [];

  TOUR_LANDMARKS.forEach(lm => {
    const el = document.createElement('div');
    el.className = 'custom-landmark-pin';
    el.innerHTML = `
      <div style="background:#B65B52;border:2.5px solid #D2A542;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.5);font-size:14px;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.18)'" onmouseout="this.style.transform='scale(1.0)'">
        ${lm.icon}
      </div>
    `;

    const popupHtml = `
      <div style="min-width:180px; font-family:sans-serif; padding:4px;">
        <strong style="color:#28323D; font-size:12.5px;">${lm.icon} ${lm.name}</strong>
        <p style="font-size:10.5px; color:#4A5568; margin:4px 0 8px 0; line-height:1.3;">${lm.desc}</p>
        <div style="display:flex; gap:6px;">
          <button onclick="openVrModal('${lm.id}')" style="background:#B65B52; color:white; border:none; padding:5px 8px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">🥽 Ver VR 360°</button>
          <button onclick="narrateLandmarkById('${lm.id}')" style="background:#28323D; color:#D2A542; border:none; padding:5px 8px; border-radius:6px; font-size:10px; font-weight:700; cursor:pointer;">🎙️ Narrar</button>
        </div>
      </div>
    `;

    const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(popupHtml);
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lm.coords[1], lm.coords[0]])
      .setPopup(popup)
      .addTo(touristMap);

    touristLandmarkMarkers.push(marker);
  });
}

function initTouristMarker() {
  if (touristMarker) touristMarker.remove();

  const markerEl = document.createElement('div');
  markerEl.className = 'tourist-direction-marker';
  markerEl.innerHTML = `
    <span class="tourist-arrow" id="tourist-marker-arrow">▲</span>
    <div class="tourist-pulse-dot"></div>
  `;

  touristMarker = new maplibregl.Marker({ element: markerEl })
    .setLngLat([state.currentPosition.lng, state.currentPosition.lat])
    .addTo(touristMap);
}

function addTourLandmarksLeaflet(mapInstance) {
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

  if (touristMarker) {
    touristMarker.setLngLat([lng, lat]);
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

// 9. Manejo del Botón SOS (Pánico con Confirmación, Vibración y Auxilio Directo)
let lastSosTriggerTime = 0;
function handleSosTrigger(e) {
  if (e && e.type === 'touchstart' && e.cancelable) {
    e.preventDefault();
  }
  const now = Date.now();
  if (now - lastSosTriggerTime < 800) return;
  lastSosTriggerTime = now;

  // Vibración táctil si el dispositivo la soporta
  if (navigator.vibrate) {
    navigator.vibrate([250, 100, 250, 100, 350]);
  }
  playAlertTone('sos');

  // Restablecer estado visual del modal
  state.sosCountdownValue = 3;
  const countEl = document.getElementById('countdown-number');
  const circleEl = document.getElementById('sos-countdown-circle');
  const titleEl = document.getElementById('sos-modal-title');
  const descEl = document.getElementById('sos-modal-desc');
  const hintEl = document.getElementById('sos-modal-hint');
  const cancelBtn = document.getElementById('btn-cancel-sos');

  if (countEl) countEl.textContent = state.sosCountdownValue;
  if (circleEl) circleEl.style.display = 'flex';
  if (titleEl) titleEl.textContent = 'EMERGENCIA SOS ACTIVADA';
  if (descEl) descEl.textContent = 'Transmitiendo alerta prioritaria a la Central de Operaciones EPG YUYARIY y registrando coordenadas GPS...';
  if (hintEl) hintEl.textContent = 'Presiona cancelar si fue un toque accidental:';
  if (cancelBtn) {
    cancelBtn.textContent = '✕ CANCELAR ALERTA (Falsa Alarma)';
    cancelBtn.onclick = cancelSosAlert;
  }

  const modal = document.getElementById('sos-modal');
  if (modal) modal.classList.remove('modal-hidden');

  clearInterval(state.sosCountdownInterval);
  state.sosCountdownInterval = setInterval(() => {
    state.sosCountdownValue--;
    if (state.sosCountdownValue > 0) {
      if (countEl) countEl.textContent = state.sosCountdownValue;
      playAlertTone('sos');
    } else {
      clearInterval(state.sosCountdownInterval);
      dispatchConfirmedSos();
    }
  }, 1000);
}

function cancelSosAlert() {
  clearInterval(state.sosCountdownInterval);
  const modal = document.getElementById('sos-modal');
  if (modal) modal.classList.add('modal-hidden');
  showBanner('ℹ️ Alerta SOS cancelada por el usuario (Falsa alarma).');
}

function dispatchConfirmedSos() {
  state.activeSosAlerts++;
  const sosCount = document.getElementById('hud-sos-count');
  if (sosCount) sosCount.textContent = state.activeSosAlerts;

  // Marcar estado crítico en el grupo de turistas
  if (state.touristsGroup && state.touristsGroup.length > 0) {
    state.touristsGroup[0].status = 'sos';
  }
  updateOperatorMarkers();
  updateOperatorTable();

  // Guardar evento SOS prioritario en Store & Forward
  const pos = state.currentPosition || { lat: YUYARIY_COORDS.plazaDeArmas[0], lng: YUYARIY_COORDS.plazaDeArmas[1] };
  saveTelemetryPoint(pos.lat, pos.lng, true);

  // Actualizar modal con confirmación de auxilio y acceso directo a rescate
  const titleEl = document.getElementById('sos-modal-title');
  const descEl = document.getElementById('sos-modal-desc');
  const circleEl = document.getElementById('sos-countdown-circle');
  const hintEl = document.getElementById('sos-modal-hint');
  const cancelBtn = document.getElementById('btn-cancel-sos');

  const latStr = pos.lat.toFixed(5);
  const lngStr = pos.lng.toFixed(5);

  if (titleEl) titleEl.textContent = '🚨 ALERTA SOS TRANSMITIDA';
  if (circleEl) circleEl.style.display = 'none';
  if (descEl) {
    descEl.innerHTML = `<strong>Ubicación registrada:</strong> ${latStr}, ${lngStr} (Cusco · 3,399 m.s.n.m.)<br>` +
      `Central EPG YUYARIY notificada. Comunícate directamente con la Policía de Turismo o SAMU mediante los botones directos:`;
  }
  if (hintEl) hintEl.textContent = 'Tu posición continúa siendo monitoreada en tiempo real por el Centro de Control.';
  if (cancelBtn) {
    cancelBtn.textContent = '✓ Entendido / Cerrar Ventana';
    cancelBtn.onclick = () => {
      const modal = document.getElementById('sos-modal');
      if (modal) modal.classList.add('modal-hidden');
    };
  }

  const isOnline = navigator.onLine && !state.isSimulatedOffline;
  if (isOnline) {
    showBanner('🚨 ALERTA SOS TRANSMITIDA: La central EPG YUYARIY ha recibido tus coordenadas.');
  } else {
    showBanner('🚨 ALERTA SOS RETENIDA: Sin señal 4G. Guardada en SQLite local; se transmitirá al detectar cobertura.');
  }
}

// Compartir ubicación en tiempo real por WhatsApp
function shareLocationWhatsApp() {
  const pos = state.currentPosition || {
    lat: YUYARIY_COORDS.plazaDeArmas[0],
    lng: YUYARIY_COORDS.plazaDeArmas[1]
  };
  const lat = pos.lat.toFixed(6);
  const lng = pos.lng.toFixed(6);
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const now = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const msg = [
    '🚨 *ALERTA DE EMERGENCIA SOS - TURISTA CUSCO*',
    'Solicito auxilio turístico inmediato. Mi ubicación GPS en tiempo real:',
    `📍 ${mapsUrl}`,
    `🗺️ Coordenadas: ${lat}, ${lng}`,
    `⏰ Reporte: ${now}`,
    '🏢 Operador: EPG YUYARIY S.A.C. · CuscoSafe PWA',
    '📞 Contactos de Emergencia Oficiales:',
    '• Policía de Turismo Cusco (POLTUR): +51 84 249654',
    '• SAMU Ambulancia: 106'
  ].join('\n');

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
  showBanner('💬 Abriendo WhatsApp para compartir ubicación GPS de emergencia...');
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
    if (btn) {
      btn.textContent = '🚶 Iniciar Simulación de Paseo';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-primary');
    }
    showBanner('Simulación de caminata detenida.');
  } else {
    state.isSimulatingWalk = true;
    if (btn) {
      btn.textContent = '⏸️ Pausar Simulación';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-danger');
    }
    showBanner('🚶 Simulación activa: Recorriendo Hatun Rumiyoc y Av. El Sol.');
    
    state.walkTimer = setInterval(() => {
      state.walkStep = (state.walkStep + 1) % TOUR_WALK_POINTS.length;
      const pt = TOUR_WALK_POINTS[state.walkStep];
      updateTouristPosition(pt[0], pt[1], 4, true);
      if (touristMap) {
        touristMap.easeTo({ center: [pt[1], pt[0]], duration: 1000 });
      }
    }, 3500);
  }
}

function centerOnUser() {
  if (touristMap && state.currentPosition) {
    touristMap.flyTo({
      center: [state.currentPosition.lng, state.currentPosition.lat],
      zoom: 17,
      duration: 800
    });
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
  if (touristMap) {
    touristMap.flyTo({ center: [outsideLng, outsideLat], zoom: 15, duration: 800 });
  }
}

// 13. UI Navigation & Banners
function switchTab(viewName, btnElem) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('view-active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('nav-active'));

  document.getElementById(`view-${viewName}`).classList.add('view-active');
  btnElem.classList.add('nav-active');

  // Redimensionar mapas al cambiar pestañas
  setTimeout(() => {
    if (viewName === 'tourist' && touristMap) touristMap.resize();
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

// 14. Selector Dinámico de Capas Vectoriales (OpenFreeMap Liberty / Satélite Esri / Dark)
function toggleMapLayer() {
  const modes = ['liberty', 'satellite', 'dark'];
  const nextIdx = (modes.indexOf(state.mapStyle) + 1) % modes.length;
  state.mapStyle = modes[nextIdx];

  const btn = document.getElementById('btn-map-layer');

  if (touristMap) {
    touristMap.setStyle(VECTOR_STYLES[state.mapStyle]);
    touristMap.once('style.load', () => {
      setupTouristMapLayers();
    });
  }

  if (state.mapStyle === 'satellite') {
    if (btn) btn.innerHTML = '🌙 Noche';
    showBanner('🛰️ Modo Satélite HD activado (Fotografía aérea de precisión)');
  } else if (state.mapStyle === 'dark') {
    if (btn) btn.innerHTML = '🗺️ Calles';
    showBanner('🌙 Modo Nocturno Andino activado (Pizarra y contraste dorado)');
  } else {
    if (btn) btn.innerHTML = '🛰️ Satélite';
    showBanner('🗺️ Modo Calles Vectorial OpenFreeMap Ultra Nítido activado');
  }
}

// 14.1 Motor de Brújula Móvil 360° y Navegación Heading-Up (WebGL GPU)
class MobileCompassManager {
  constructor() {
    this.currentHeading = 0;
    this.targetHeading = 0;
    this.isListening = false;
    this.animFrameId = null;
    this.deadband = 0.5; // Supresión de temblor de pulso (<0.5°)
    this.lerpFactor = 0.20; // Interpolación suave a 60fps
  }

  start() {
    if (this.isListening) return;

    const onOrientation = (e) => {
      let heading = null;

      // 1. iOS Safari (0 a 360, 0 = Norte Magnético con compensación de inclinación)
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        heading = e.webkitCompassHeading;
      } else if (e.absolute === true && e.alpha !== null) {
        // 2. Android Chrome deviceorientationabsolute
        heading = (360 - e.alpha) % 360;
      } else if (e.alpha !== null) {
        // 3. Fallback Android estándar
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        // Compensación de orientación de pantalla (retrato vs apaisado)
        const screenAngle = (window.screen.orientation ? window.screen.orientation.angle : (window.orientation || 0)) || 0;
        this.targetHeading = (heading + screenAngle + 360) % 360;
      }
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', onOrientation, true);
    } else {
      window.addEventListener('deviceorientation', onOrientation, true);
    }

    this.isListening = true;
    this.runLoop();
  }

  runLoop() {
    const step = () => {
      // Diferencia angular por la ruta más corta [-180, 180]
      const diff = ((this.targetHeading - this.currentHeading + 540) % 360) - 180;

      if (Math.abs(diff) >= this.deadband) {
        this.currentHeading = (this.currentHeading + diff * this.lerpFactor + 360) % 360;
      }

      this.render(this.currentHeading);
      this.animFrameId = requestAnimationFrame(step);
    };
    this.animFrameId = requestAnimationFrame(step);
  }

  render(heading) {
    const roundHeading = Math.round(heading);
    state.currentHeading = roundHeading;

    // 1. Flecha dorada sobre el marcador del turista
    const arrow = document.getElementById('tourist-marker-arrow');
    if (arrow) {
      if (state.compassFollowActive) {
        // Si el mapa gira con el usuario, la vista al frente es recta (0°)
        arrow.style.transform = 'rotate(0deg)';
      } else {
        // Si el mapa está fijo al Norte, la flecha indica hacia dónde mira el celular
        arrow.style.transform = `rotate(${roundHeading}deg)`;
      }
    }

    // 2. Rotación dinámica continua 360° del mapa vectorial (Modo Heading-Up)
    if (state.compassFollowActive && touristMap) {
      touristMap.setBearing(roundHeading);
    }

    // 3. Brújula en HUD superior (indica el Norte en tiempo real)
    const compassArrow = document.getElementById('compass-icon');
    const compassText = document.getElementById('compass-text');
    if (compassArrow) {
      const currentBearing = touristMap ? touristMap.getBearing() : 0;
      compassArrow.style.transform = `rotate(${-currentBearing}deg)`;
    }
    if (compassText) {
      const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      const card = cardinals[Math.round(roundHeading / 45) % 8];
      compassText.textContent = `${card} ${roundHeading}°`;
    }

    // 4. Radar Háptico Espacial ("Hot / Cold" Finder hacia el hito seleccionado)
    const activeLm = TOUR_LANDMARKS.find(l => l.id === state.currentLandmarkKey) || TOUR_LANDMARKS[0];
    if (activeLm && state.currentPosition) {
      const targetBearing = calculateBearing(state.currentPosition.lat, state.currentPosition.lng, activeLm.coords[0], activeLm.coords[1]);
      const bearingDiff = Math.abs(((targetBearing - roundHeading + 540) % 360) - 180);

      const compassHud = document.getElementById('hud-compass');
      if (bearingDiff < 14) {
        if (arrow) arrow.classList.add('pulse-gold');
        if (compassHud) compassHud.classList.add('pulse-gold');

        if (!state.isHapticLocked) {
          if (navigator.vibrate) navigator.vibrate([20, 25, 20]);
          state.isHapticLocked = true;
        }
      } else {
        if (arrow) arrow.classList.remove('pulse-gold');
        if (compassHud) compassHud.classList.remove('pulse-gold');
        state.isHapticLocked = false;
      }
    }
  }
}

const compassManager = new MobileCompassManager();

// Activar o desactivar seguimiento 360° con brújula
async function toggleCompassFollow() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        showBanner('⚠️ Permiso de sensor de brújula denegado en Safari.');
        return;
      }
    } catch (err) {
      console.warn('Compass permission request error:', err);
    }
  }

  state.compassFollowActive = !state.compassFollowActive;
  compassManager.start();

  const btn = document.getElementById('btn-compass-follow');
  if (btn) {
    btn.classList.toggle('active', state.compassFollowActive);
    btn.setAttribute('title', state.compassFollowActive ? 'Brújula 360° Activa (Toca para fijar orientación manual)' : 'Brújula 360°: Girar mapa según orientación del celular');
  }

  if (state.compassFollowActive) {
    showBanner('🧭 Modo Heading-Up Activado: El mapa gira 360° en tiempo real según donde apuntes tu celular.');
  } else {
    showBanner('🧭 Modo Fijo Activado: El mapa mantiene orientación manual.');
  }
}

// Alternar perspectiva 3D (Tilt WebGL)
function toggle3dPerspective() {
  state.is3dActive = !state.is3dActive;
  const targetPitch = state.is3dActive ? 48 : 0;
  state.pitch = targetPitch;

  if (touristMap) {
    touristMap.easeTo({ pitch: targetPitch, duration: 800 });
  }

  const btn = document.getElementById('btn-3d-tilt');
  if (btn) {
    btn.classList.toggle('active', state.is3dActive);
    btn.setAttribute('title', state.is3dActive ? 'Perspectiva 3D Activa (Toca para vista cenital 2D)' : 'Alternar perspectiva 3D del mapa');
  }

  showBanner(state.is3dActive ? '📐 Perspectiva 3D Vectorial Activada (48°).' : '📐 Vista Cenital 2D Plana Activada (0°).');
}

// Reorientar el mapa al Norte (0°)
function resetMapNorth() {
  if (touristMap) {
    touristMap.easeTo({ bearing: 0, duration: 600 });
  }
  state.compassFollowActive = false;
  const btn = document.getElementById('btn-compass-follow');
  if (btn) {
    btn.classList.remove('active');
    btn.setAttribute('title', 'Brújula 360°: Girar mapa según orientación del celular');
  }
  showBanner('🧭 Mapa orientado al Norte (0°).');
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

  const sheetLmEl = document.getElementById('sheet-current-lm');
  const sheetDistEl = document.getElementById('sheet-current-dist');
  if (sheetLmEl) sheetLmEl.textContent = nearest.name.split(' (')[0];
  if (sheetDistEl) sheetDistEl.textContent = `· ${distMeters}m`;

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
    touristMap.flyTo({
      center: [lm.coords[1], lm.coords[0]],
      zoom: 17.5,
      pitch: state.is3dActive ? 48 : 0,
      duration: 1200
    });
  }

  updateSpatialHud();

  if (state.isAudioGuideActive) {
    narrateLandmarkById(lm.id);
  }
}

function cycleToNextLandmark() {
  const ids = TOUR_LANDMARKS.map(l => l.id);
  const nextIdx = (ids.indexOf(state.currentLandmarkKey) + 1) % ids.length;
  const nextKey = ids[nextIdx];
  const chips = document.querySelectorAll('.milestone-chip');
  selectLandmark(nextKey, chips[nextIdx]);
}

// 17. Audio-Guía Inteligente Multilingüe (Español / English / Runasimi Quechua)
function setTourLanguage(lang = 'es', btnElem) {
  state.tourLanguage = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('lang-active'));
  if (btnElem) btnElem.classList.add('lang-active');

  // Actualizar títulos del carrusel según idioma seleccionado
  document.querySelectorAll('.milestone-chip').forEach((chip, idx) => {
    const lm = TOUR_LANDMARKS[idx];
    if (lm) {
      const titleSpan = chip.querySelector('.chip-title');
      if (titleSpan) {
        if (lang === 'en') titleSpan.textContent = lm.nameEn.split(' (')[0];
        else if (lang === 'qu') titleSpan.textContent = lm.nameQu.split(' (')[0];
        else titleSpan.textContent = lm.name.split(' (')[0];
      }
    }
  });

  const langNames = { es: 'Español 🇵🇪', en: 'English 🇬🇧', qu: 'Runasimi (Quechua) 🏛️' };
  showBanner(`🌐 Idioma de audio-guía: ${langNames[lang] || lang}`);
  playAlertTone('safe');

  if (state.isAudioGuideActive) {
    narrateLandmarkById(state.currentLandmarkKey);
  }
}

function narrateLandmarkById(id) {
  const lm = TOUR_LANDMARKS.find(l => l.id === id) || TOUR_LANDMARKS[0];
  const text = (lm.narrations && lm.narrations[state.tourLanguage]) ? lm.narrations[state.tourLanguage] : lm.narration;
  narrateText(text, state.tourLanguage);
}

function toggleAudioGuide() {
  state.isAudioGuideActive = !state.isAudioGuideActive;
  const btn = document.getElementById('btn-audio');
  if (btn) {
    btn.classList.toggle('btn-audio-glow', state.isAudioGuideActive);
    btn.textContent = state.isAudioGuideActive ? '🎙️ Audio ON' : '🎙️ Audio';
  }

  if (state.isAudioGuideActive) {
    const lm = TOUR_LANDMARKS.find(l => l.id === state.currentLandmarkKey) || TOUR_LANDMARKS[0];
    const intro = state.tourLanguage === 'en'
      ? 'Starting official YUYARIY audio guide. '
      : (state.tourLanguage === 'qu' ? 'YUYARIY rimayta qallarisun. ' : 'Iniciando audio guía oficial de EPG YUYARIY. ');
    const text = (lm.narrations && lm.narrations[state.tourLanguage]) ? lm.narrations[state.tourLanguage] : lm.narration;
    narrateText(intro + text, state.tourLanguage);
  } else {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showBanner('🔇 Audio guía pausada.');
  }
}

function narrateCurrentVrScene() {
  const lm = TOUR_LANDMARKS.find(l => l.id === vrState.activeLandmark) || TOUR_LANDMARKS[0];
  const text = (lm.narrations && lm.narrations[state.tourLanguage]) ? lm.narrations[state.tourLanguage] : lm.narration;
  narrateText(text, state.tourLanguage);
}

function narrateText(text, lang = state.tourLanguage) {
  if (!('speechSynthesis' in window)) {
    showBanner('⚠️ Síntesis de voz no disponible en este dispositivo.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = lang === 'qu' ? 0.92 : 1.0;
  utter.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (lang === 'en') {
    utter.lang = 'en-US';
    const enVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'));
    if (enVoice) utter.voice = enVoice;
  } else {
    utter.lang = 'es-PE';
    const esVoice = voices.find(v => v.lang.startsWith('es-PE') || v.lang.startsWith('es-ES') || v.lang.startsWith('es'));
    if (esVoice) utter.voice = esVoice;
  }

  showBanner(`🎙️ Audio-Guía (${lang.toUpperCase()}): Relato oficial en reproducción...`);
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

// ==========================================
// 18.1 Motor de Cámara de Realidad Aumentada (AR Viewfinder)
// EPG YUYARIY S.A.C. - Retículo Holográfico & Hitos Flotantes
// ==========================================
const arState = {
  stream: null,
  isActive: false,
  isTorchOn: false,
  isSynthetic: false,
  animFrameId: null,
  activeTargetKey: 'plazaDeArmas',
  videoTrack: null
};

// Soporte de gestos táctiles y ratón en el Viewport AR (rotación manual 360°)
let isArDragging = false;
let arDragStartX = 0;
let arHeadingAtDragStart = 0;

function setupArViewportGestures() {
  const vp = document.getElementById('ar-viewport');
  if (!vp || vp._hasArGestures) return;
  vp._hasArGestures = true;

  const onStart = (clientX) => {
    isArDragging = true;
    arDragStartX = clientX;
    arHeadingAtDragStart = state.currentHeading || 0;
  };

  const onMove = (clientX) => {
    if (!isArDragging) return;
    const deltaX = clientX - arDragStartX;
    // 1 pixel = ~0.35 grados de rotación
    const newHeading = (((arHeadingAtDragStart - (deltaX * 0.35)) % 360) + 360) % 360;
    state.currentHeading = Math.round(newHeading);
    if (compassManager) compassManager.targetHeading = state.currentHeading;
  };

  const onEnd = () => {
    isArDragging = false;
  };

  vp.addEventListener('mousedown', (e) => onStart(e.clientX));
  window.addEventListener('mousemove', (e) => onMove(e.clientX));
  window.addEventListener('mouseup', onEnd);

  vp.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) onStart(e.touches[0].clientX);
  }, { passive: true });
  vp.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) onMove(e.touches[0].clientX);
  }, { passive: true });
  vp.addEventListener('touchend', onEnd);
}

async function openArModal() {
  const modal = document.getElementById('ar-modal');
  if (modal) modal.classList.remove('modal-hidden');
  arState.isActive = true;

  initArCompassTape();
  setupArViewportGestures();

  // Solicitar permiso de sensores de orientación (iOS Safari 13+)
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm === 'granted') {
        compassManager.start();
      }
    } catch (e) {
      console.warn('Permiso orientación AR:', e);
    }
  } else {
    compassManager.start();
  }

  await startArCamera();
  startArRenderLoop();
  showBanner('📷 Visor AR Activo: Apunta tu cámara a los hitos del Cusco.');
}

async function startArCamera() {
  const video = document.getElementById('ar-video');
  const banner = document.getElementById('ar-camera-banner');
  if (banner) banner.classList.add('hidden');
  arState.isSynthetic = false;

  const isSecure = window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  if (!isSecure) {
    console.warn('AR: Contexto HTTP no seguro sin SSL');
    activateSyntheticArMode(
      '🔒 Conexión HTTP sin SSL',
      'Los navegadores móviles requieren conexión segura (HTTPS) para habilitar la cámara en vivo. Activado el Modo Visión Sintética con retículo y brújula 360°.',
      false
    );
    return;
  }

  if (!hasMediaDevices) {
    console.warn('AR: mediaDevices no disponible');
    activateSyntheticArMode(
      '📷 Cámara no compatible',
      'Tu navegador no soporta captura de cámara en vivo. Modo Visión Sintética activado.',
      false
    );
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    arState.stream = stream;
    arState.videoTrack = stream.getVideoTracks()[0];
    if (video) {
      video.srcObject = stream;
      await video.play().catch(e => console.warn('Video play catch:', e));
      video.classList.remove('ar-video-synthetic');
    }
    if (banner) banner.classList.add('hidden');
  } catch (err) {
    console.warn('Error cámara AR:', err);

    // Si falló por restricciones altas (OverconstrainedError), probar fallback genérico
    if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
      try {
        const streamFb = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        arState.stream = streamFb;
        arState.videoTrack = streamFb.getVideoTracks()[0];
        if (video) {
          video.srcObject = streamFb;
          await video.play().catch(e => console.warn('Fallback play catch:', e));
          video.classList.remove('ar-video-synthetic');
        }
        if (banner) banner.classList.add('hidden');
        return;
      } catch (err2) {
        console.warn('Fallback cámara falló:', err2);
      }
    }

    let title = '📷 Modo Visión Sintética AR';
    let desc = 'Sensor de cámara física no disponible.';
    let canRetry = true;

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      title = '⚠️ Permiso de Cámara Denegado';
      desc = 'Has rechazado el acceso a la cámara. Para ver las calles en vivo, permite la cámara en los permisos del navegador y toca Reintentar.';
      canRetry = true;
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      title = '📷 Cámara No Encontrada';
      desc = 'No se detectó un sensor de cámara en tu dispositivo. Modo holográfico interactivo 360° activo.';
      canRetry = false;
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      title = '⚠️ Cámara Ocupada';
      desc = 'La cámara está siendo utilizada por otra aplicación. Ciérrala y toca Reintentar.';
      canRetry = true;
    }

    activateSyntheticArMode(title, desc, canRetry);
  }
}

function activateSyntheticArMode(titleText, descText, showRetry = true) {
  arState.isSynthetic = true;
  const video = document.getElementById('ar-video');
  const banner = document.getElementById('ar-camera-banner');
  const title = document.getElementById('ar-banner-title');
  const desc = document.getElementById('ar-banner-desc');
  const retryBtn = document.getElementById('btn-ar-retry');

  if (video) {
    if (video.srcObject) {
      video.srcObject = null;
    }
    video.poster = 'icons/vr_plaza.jpg';
    video.classList.add('ar-video-synthetic');
  }

  if (banner) {
    if (title) title.textContent = titleText;
    if (desc) desc.textContent = descText;
    if (retryBtn) retryBtn.style.display = showRetry ? 'inline-block' : 'none';
    banner.classList.remove('hidden');
  }

  showBanner(`${titleText}: Modo interactivo 360° simulado.`);
}

async function retryArCamera() {
  showBanner('🔄 Solicitando permisos de cámara...');
  await startArCamera();
}

function closeArModal() {
  const modal = document.getElementById('ar-modal');
  if (modal) modal.classList.add('modal-hidden');
  arState.isActive = false;

  if (arState.animFrameId) cancelAnimationFrame(arState.animFrameId);

  if (arState.stream) {
    arState.stream.getTracks().forEach(t => t.stop());
    arState.stream = null;
    arState.videoTrack = null;
  }
}

async function toggleArTorch() {
  if (!arState.videoTrack) {
    showBanner('🔦 Linterna no disponible en este sensor.');
    return;
  }
  const capabilities = arState.videoTrack.getCapabilities ? arState.videoTrack.getCapabilities() : {};
  if (!capabilities.torch) {
    showBanner('🔦 Linterna no soportada por el hardware de la cámara.');
    return;
  }

  arState.isTorchOn = !arState.isTorchOn;
  try {
    await arState.videoTrack.applyConstraints({
      advanced: [{ torch: arState.isTorchOn }]
    });
    const btn = document.getElementById('btn-ar-torch');
    if (btn) btn.textContent = arState.isTorchOn ? '⚡ On' : '🔦';
  } catch (e) {
    console.warn('Torch error:', e);
  }
}

function initArCompassTape() {
  const track = document.getElementById('ar-tape-track');
  if (!track || track.children.length > 0) return;

  // 12 ticks por ciclo de 360° (cada 30° un tick etiquetado, ancho fijo 60px -> 2.0px/grado)
  const baseTicks = [
    { deg: 0, label: 'N', cardinal: true },
    { deg: 30, label: '30°' },
    { deg: 60, label: '60°' },
    { deg: 90, label: 'E', cardinal: true },
    { deg: 120, label: '120°' },
    { deg: 150, label: '150°' },
    { deg: 180, label: 'S', cardinal: true },
    { deg: 210, label: '210°' },
    { deg: 240, label: '240°' },
    { deg: 270, label: 'O', cardinal: true },
    { deg: 300, label: '300°' },
    { deg: 330, label: '330°' }
  ];

  // Generar 3 ciclos para rotación infinita suave (-360° a +720°)
  let fullHtml = '';
  for (let c = 0; c < 3; c++) {
    baseTicks.forEach(t => {
      fullHtml += `<span class="ar-tape-item ${t.cardinal ? 'cardinal' : ''}">${t.label}</span>`;
    });
  }
  track.innerHTML = fullHtml;
}

function startArRenderLoop() {
  const container = document.getElementById('ar-floating-landmarks');
  const tapeTrack = document.getElementById('ar-tape-track');
  const userPos = state.currentPosition || { lat: YUYARIY_COORDS.plazaDeArmas[0], lng: YUYARIY_COORDS.plazaDeArmas[1] };

  function render() {
    if (!arState.isActive) return;

    const heading = state.currentHeading || 0;

    // Desplazar cinta de brújula calibrada (60px por cada 30° -> 2.0px por grado)
    // Ciclo 1: 0 a 11 (items 0..11, 720px total)
    // Ciclo 2: 12 a 23 (items 12..23, tick N en item 12)
    // El centro del item 12 (0° N) está en: 12 * 60 + 30 = 750px.
    // Con track a left: 50%, un translateX(-750px) centra exactamente N bajo el puntero.
    if (tapeTrack) {
      const headingNorm = (((heading % 360) + 360) % 360);
      const pxPerDeg = 2.0;
      const zeroCenterOffset = 750;
      const shiftPx = zeroCenterOffset + (headingNorm * pxPerDeg);
      tapeTrack.style.transform = `translateX(-${shiftPx.toFixed(1)}px)`;
    }

    const indicatorText = document.getElementById('ar-tape-indicator-text');
    if (indicatorText) {
      const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      const card = cardinals[Math.round(heading / 45) % 8];
      indicatorText.textContent = `${Math.round(heading)}° ${card}`;
    }

    if (container) {
      let closestTarget = null;
      let minAngleAbs = 999;
      let htmlBadges = '';

      TOUR_LANDMARKS.forEach(lm => {
        const bearing = calculateBearing(userPos.lat, userPos.lng, lm.coords[0], lm.coords[1]);
        const dist = Math.round(calculateDistance(userPos.lat, userPos.lng, lm.coords[0], lm.coords[1]));

        // Ángulo relativo respecto hacia dónde apunta la cámara [-180, 180]
        const relAngle = ((bearing - heading + 540) % 360) - 180;

        // Campo de visión de la cámara (FOV ~ 72° = [-36°, +36°])
        if (Math.abs(relAngle) <= 36) {
          const xPercent = 50 + (relAngle / 36) * 44;
          const yPercent = 40 + Math.min(22, (dist / 1200) * 15);
          const isCentered = Math.abs(relAngle) < 12;

          if (Math.abs(relAngle) < minAngleAbs) {
            minAngleAbs = Math.abs(relAngle);
            closestTarget = { lm, dist, bearing, isCentered };
          }

          const nameByLang = state.tourLanguage === 'en' ? lm.nameEn : (state.tourLanguage === 'qu' ? lm.nameQu : lm.name);

          htmlBadges += `
            <div class="ar-landmark-badge ${isCentered ? 'ar-badge-target' : ''}"
                 style="left: ${xPercent.toFixed(1)}%; top: ${yPercent.toFixed(1)}%;"
                 onclick="selectArTarget('${lm.id}')">
              <span>${lm.icon}</span>
              <span class="ar-badge-title">${nameByLang.split(' (')[0]}</span>
              <span class="ar-badge-dist">· ${dist}m</span>
            </div>
          `;
        }
      });

      container.innerHTML = htmlBadges;

      // Actualizar tarjeta inferior con el hito enfocado
      if (closestTarget) {
        arState.activeTargetKey = closestTarget.lm.id;
        updateArBottomCard(closestTarget.lm, closestTarget.dist, closestTarget.bearing);
      }
    }

    arState.animFrameId = requestAnimationFrame(render);
  }

  if (arState.animFrameId) cancelAnimationFrame(arState.animFrameId);
  arState.animFrameId = requestAnimationFrame(render);
}

function updateArBottomCard(lm, dist, bearing) {
  const title = document.getElementById('ar-target-title');
  const distEl = document.getElementById('ar-target-dist');
  if (title) {
    title.textContent = state.tourLanguage === 'en' ? lm.nameEn : (state.tourLanguage === 'qu' ? lm.nameQu : lm.name);
  }
  if (distEl) {
    const card = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(bearing / 45) % 8];
    distEl.textContent = `Distancia: ${dist}m · Rumbo: ${Math.round(bearing)}° ${card}`;
  }
}

function selectArTarget(id) {
  arState.activeTargetKey = id;
  const lm = TOUR_LANDMARKS.find(l => l.id === id);
  if (lm && state.currentPosition) {
    const dist = Math.round(calculateDistance(state.currentPosition.lat, state.currentPosition.lng, lm.coords[0], lm.coords[1]));
    const bearing = calculateBearing(state.currentPosition.lat, state.currentPosition.lng, lm.coords[0], lm.coords[1]);
    updateArBottomCard(lm, dist, bearing);
  }
}

function narrateArTarget() {
  narrateLandmarkById(arState.activeTargetKey);
}

function openVrModalFromAr() {
  const targetKey = arState.activeTargetKey;
  closeArModal();
  openVrModal(targetKey);
}

// Captura de Foto Turística con Marco Holográfico Oficial EPG YUYARIY
function takeArTourSnapshot() {
  const video = document.getElementById('ar-video');
  const canvas = document.createElement('canvas');
  const w = (video && video.videoWidth) ? video.videoWidth : 1280;
  const h = (video && video.videoHeight) ? video.videoHeight : 720;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  try {
    if (video && video.videoWidth > 0) {
      ctx.drawImage(video, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#1A2129';
      ctx.fillRect(0, 0, w, h);
    }
  } catch (e) {
    ctx.fillStyle = '#1A2129';
    ctx.fillRect(0, 0, w, h);
  }

  // Marco elegante EPG YUYARIY
  ctx.strokeStyle = '#D2A542';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Esquinas doradas incaicas
  ctx.fillStyle = '#B65B52';
  ctx.fillRect(10, 10, 60, 12);
  ctx.fillRect(10, 10, 12, 60);
  ctx.fillRect(w - 70, 10, 60, 12);
  ctx.fillRect(w - 22, 10, 12, 60);

  // Franja inferior con metadatos
  ctx.fillStyle = 'rgba(26, 33, 41, 0.88)';
  ctx.fillRect(20, h - 90, w - 40, 70);

  const activeLm = TOUR_LANDMARKS.find(l => l.id === arState.activeTargetKey) || TOUR_LANDMARKS[0];
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`🏛️ ${activeLm.name} · CuscoSafe AR`, 40, h - 52);

  ctx.fillStyle = '#D2A542';
  ctx.font = '16px sans-serif';
  const now = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  ctx.fillText(`EPG YUYARIY S.A.C. · Tours con Realidad Virtual · Altitud: 3,399 m.s.n.m. · ${now}`, 40, h - 28);

  const link = document.createElement('a');
  link.download = `CuscoSafe_Recuerdo_${activeLm.id}_${Date.now()}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.92);
  link.click();

  showBanner('📸 ¡Foto de recuerdo con marco oficial de EPG YUYARIY descargada con éxito!');
  playAlertTone('safe');
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

// 20. Control de Bottom Sheet Plegable / Peek (Estilo Google Maps / Apple Maps)
function toggleTouristSheet(forceState) {
  const sheet = document.getElementById('tourist-bottom-sheet');
  const hint = document.getElementById('sheet-toggle-hint');
  if (!sheet) return;

  const isCurrentlyExpanded = sheet.classList.contains('is-expanded');
  const shouldExpand = forceState !== undefined ? forceState : !isCurrentlyExpanded;

  if (shouldExpand) {
    sheet.classList.remove('is-collapsed');
    sheet.classList.add('is-expanded');
    if (hint) hint.textContent = '▼ Plegar';
  } else {
    sheet.classList.remove('is-expanded');
    sheet.classList.add('is-collapsed');
    if (hint) hint.textContent = '▲ Tour';
  }

  // Refrescar tamaño geométrico del mapa MapLibre tras animación de transición
  setTimeout(() => {
    if (touristMap) touristMap.resize();
  }, 360);
}

function handleMiniSos(e) {
  if (e) {
    e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
  }
  handleSosTrigger(e);
}

function dismissApkBanner() {
  const bar = document.getElementById('apk-download-bar');
  if (bar) bar.style.display = 'none';
  try {
    localStorage.setItem('cuscosafe_apk_dismissed', '1');
  } catch (err) {}
  setTimeout(() => {
    if (touristMap) touristMap.resize();
  }, 100);
}

function initSheetSwipeGestures() {
  const sheet = document.getElementById('tourist-bottom-sheet');
  if (!sheet) return;
  let startY = 0;

  sheet.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  sheet.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;
      if (diff > 45) {
        // Deslizar hacia arriba -> expandir
        toggleTouristSheet(true);
      } else if (diff < -45) {
        // Deslizar hacia abajo -> plegar
        toggleTouristSheet(false);
      }
    }
  }, { passive: true });
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
  if (localStorage.getItem('cuscosafe_apk_dismissed') === '1') {
    const bar = document.getElementById('apk-download-bar');
    if (bar) bar.style.display = 'none';
  }
  initMaps();
  initVrViewer();
  startGpsTracking();
  updateSpatialHud();
  updateBufferUI();
  updateOperatorTable();
  compassManager.start();
  initSheetSwipeGestures();
});
